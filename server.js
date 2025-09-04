require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI
const mongoURI = process.env.mongoURI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected to Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Database Schemas ---

// Contact schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Payment schema - Updated to include userId
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  phone: String,
  plan: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  signature: String,
  status: { type: String, default: "created" },
  paymentMethod: String,
  date: { type: Date, default: Date.now }
});
const Payment = mongoose.model("Payment", paymentSchema);

// Membership schema
const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: String,
  amount: Number,
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: { type: String, default: "active" },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
});
const Membership = mongoose.model("Membership", membershipSchema);

// --- Razorpay Setup ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
  key_secret: process.env.RAZORPAY_SECRET || "YOUR_RAZORPAY_SECRET"
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Main route
app.get('/', (req, res) => {
  res.send('Gym Website Backend is running 🚀');
});

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.json({ success: true, message: "Contact saved successfully!" });
  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Auth APIs ---

// Register user
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // HASH THE PASSWORD
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword, // Store the HASHED password
        });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
      const { emailOrPhone, password } = req.body;
      // Step 1: Log the values received from the frontend
      console.log('Login attempt with:', { emailOrPhone, password });
      // Find user by either email or phone
      const user = await User.findOne({
          $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
      });
      // Step 2: Log the user found in the database
      console.log('User found in DB:', user);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    // Step 3: Log the result of the password comparison
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user profile (protected route)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Payment APIs ---

// 1. Create Order (protected route)
app.post("/api/payment/order", authenticateToken, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, plan, name, email, phone, paymentMethod } = req.body;
    const userId = req.user.id;

    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Save initial order with user ID
    const newPayment = new Payment({
      userId,
      name,
      email,
      phone,
      plan,
      amount,
      paymentMethod,
      orderId: order.id,
      status: order.status
    });
    await newPayment.save();

    res.json({ success: true, order, paymentId: newPayment._id });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Verify Payment (protected route)
app.post("/api/payment/verify", authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const userId = req.user.id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "YOUR_RAZORPAY_SECRET")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Update payment record
      const updatedPayment = await Payment.findOneAndUpdate(
        { _id: paymentId, userId: userId }, // Ensure payment belongs to the authenticated user
        {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "paid"
        },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found or unauthorized' });
      }

      // Create membership record with user ID
      const newMembership = new Membership({
        userId: userId,
        plan: updatedPayment.plan,
        amount: updatedPayment.amount,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentId: updatedPayment._id
      });
      await newMembership.save();

      res.json({ success: true, message: "Payment verified successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user memberships (protected route)
app.get("/api/memberships", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await Membership.find({ userId }).sort({ startDate: -1 });
    res.json({ success: true, memberships });
  } catch (err) {
    console.error("Error fetching memberships:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user payments (protected route)
app.get("/api/payments", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId }).sort({ date: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

# 🏋️‍♂️ MYGYM - Full Stack Gym Website

A full-stack gym management website with **user authentication, membership plans, Razorpay integration, and admin dashboard**.  
Built with **Node.js, Express, MongoDB, Razorpay, and HTML/CSS/JS frontend**.

---

## ✨ Features

- 🔐 **User Authentication**
  - Register & Login (JWT-based authentication)
  - Passwords securely hashed with bcrypt

- 💳 **Payment Integration**
  - Razorpay payment gateway
  - Membership plans with auto-verification
  - Stores transactions in MongoDB

- 👤 **User Dashboard**
  - View membership details
  - Manage profile

- 📩 **Contact Form**
  - Saves user queries into MongoDB

- 📊 **Admin/Owner Dashboard**
  - Manage users
  - Track payments
  - View memberships

---

## 🛠️ Tech Stack

**Frontend:**  
- HTML5, CSS3, JavaScript (Vanilla JS)

**Backend:**  
- Node.js, Express.js  
- MongoDB (Mongoose ODM)

**Other Tools:**  
- Razorpay SDK  
- JWT (JSON Web Token)  
- bcrypt.js (password hashing)  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/YOUR-USERNAME/MYGYM.git
cd MYGYM
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env file in the root with:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
4️⃣ Start the server
node server.js
Server will run on:
👉 http://localhost:5000

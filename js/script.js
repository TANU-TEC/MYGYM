// ================= Dark Mode =================
document.getElementById('darkToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
  
  // ================= Hero Slider =================
  let slides = document.querySelectorAll('.slide');
  let currentSlide = 0;
  if (slides.length > 0) {
    slides[currentSlide].classList.add('active');
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }
  
  // ================= BMI Calculator =================
  function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight')?.value);
    const height = parseFloat(document.getElementById('height')?.value) / 100;
  
    if (!weight || !height) {
      alert("⚠️ Enter valid weight & height");
      return;
    }
  
    const bmi = (weight / (height * height)).toFixed(2);
    let category = "";
  
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal weight";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Obese";
  
    document.getElementById('bmiResult').innerText = `Your BMI is ${bmi} (${category})`;
  }
  
  // ================= Contact Form Validation =================
  // document.addEventListener("DOMContentLoaded", () => {
  //   const contactForm = document.getElementById("contactForm");
  //   if (contactForm) {
  //     contactForm.addEventListener("submit", (e) => {
  //       e.preventDefault();
  
  //       const name = document.getElementById("name").value.trim();
  //       const email = document.getElementById("email").value.trim();
  //       const message = document.getElementById("message").value.trim();
  
  //       if (name.length < 2) {
  //         alert("⚠️ Please enter a valid name.");
  //         return;
  //       }
  
  //       const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  //       if (!emailPattern.test(email)) {
  //         alert("⚠️ Please enter a valid email address.");
  //         return;
  //       }
  
  //       if (message.length < 10) {
  //         alert("⚠️ Message should be at least 10 characters long.");
  //         return;
  //       }
  
  //       alert("✅ Message sent successfully!");
  //       contactForm.reset();
  //     });
  //   }
  // });
  // ================= Contact Form Validation & Backend Submission =================
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const name = document.getElementById("name").value.trim();
          const email = document.getElementById("email").value.trim();
          const phone = document.getElementById("phone").value.trim(); // Added phone input
          const message = document.getElementById("message").value.trim();

          // Client-side validation (keep this for a better user experience)
          if (name.length < 2) {
              alert("⚠️ Please enter a valid name.");
              return;
          }

          const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
          if (!emailPattern.test(email)) {
              alert("⚠️ Please enter a valid email address.");
              return;
          }
          
          // Validate phone number as well, using the pattern from contact.html
          const phonePattern = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
          if (!phonePattern.test(phone)) {
              alert("⚠️ Please enter a valid 10-digit phone number.");
              return;
          }

          if (message.length < 10) {
              alert("⚠️ Message should be at least 10 characters long.");
              return;
          }
          
          // Prepare data for the backend
          const formData = { name, email, phone, message };

          try {
              // Send data to the backend API endpoint
              const response = await fetch('http://localhost:5000/api/contact', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(formData),
              });

              // Parse the JSON response from the server
              const result = await response.json();

              if (response.ok) {
                  // Success: The server responded with a 2xx status code
                  alert("✅ Message sent successfully!");
                  contactForm.reset();
              } else {
                  // Failure: The server responded with an error message
                  alert(`⚠️ Error: ${result.message}`);
              }
          } catch (error) {
              // Network error: The server is not reachable
              console.error('Submission error:', error);
              alert("An error occurred. Please try again later.");
          }
      });
  }
});

document.addEventListener("DOMContentLoaded", () => {
    // -------- Get plan from URL --------
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan'); // basic, standard, premium
  
    // -------- Membership Plans --------
    const plans = {
      basic: {
        name: "Basic Plan",
        price: "₹999 / month",
        features: [
          "Access to Gym Equipment",
          "1 Personal Training Session",
          "Free Fitness Assessment"
        ]
      },
      standard: {
        name: "Standard Plan",
        price: "₹1999 / month",
        features: [
          "All Basic Plan Features",
          "5 Personal Training Sessions",
          "Access to Group Classes",
          "Diet Consultation"
        ]
      },
      premium: {
        name: "Premium Plan",
        price: "₹2999 / month",
        features: [
          "All Standard Plan Features",
          "Unlimited Personal Training",
          "Priority Class Booking",
          "24/7 Gym Access"
        ]
      }
    };
  
    // -------- Plan Details Page --------
    if (plan && plans[plan] && document.getElementById("planName")) {
      const planNameEl = document.getElementById('planName');
      const planPriceEl = document.getElementById('planPrice');
      const featuresList = document.getElementById('planFeatures');
      const joinBtn = document.getElementById('joinBtn');
  
      planNameEl.textContent = plans[plan].name;
      planPriceEl.textContent = plans[plan].price;
  
      if (featuresList) {
        featuresList.innerHTML = '';
        plans[plan].features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = feature;
          featuresList.appendChild(li);
        });
      }
  
      if (joinBtn) joinBtn.href = `payment.html?plan=${plan}`;
    }
  });
  
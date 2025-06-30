// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Remove the old Bet Code Conversion Form code as it's now in conversion.js

  // Newsletter Form
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      if (!email) {
        alert("Please enter your email address");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Simulate form submission (would be replaced with actual API call)
      alert(`Thank you for subscribing with: ${email}`);
      this.reset();

      // In a real application, you would make an API call here
      // For example:
      // fetch('/api/subscribe', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ email })
      // })
      // .then(response => response.json())
      // .then(data => {
      //     console.log(data);
      //     newsletterForm.reset();
      // })
      // .catch(error => {
      //     console.error('Error:', error);
      // });
    });
  }

  // Add animation classes on scroll
  const animateOnScroll = function () {
    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.75) {
        section.classList.add("fade-in");
      }
    });
  };

  // Initial check on page load
  animateOnScroll();

  // Check on scroll
  window.addEventListener("scroll", animateOnScroll);
});

// Mobile menu functionality could be added here if needed

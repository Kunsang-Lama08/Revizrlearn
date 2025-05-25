// Index.js
// Wait for the page to fully load before removing the spinner
window.addEventListener('load', () => {
  const spinner = document.getElementById('loading-spinner');
  spinner.style.opacity = 0;
  setTimeout(() => spinner.style.display = 'none', 500);
});

// Typing effect for main intro text
const typingText = document.getElementById('typing-text');
const textToType = 'Revizrlearn';
let index = 0;

function typeWriter() {
  if (index < textToType.length) {
    typingText.textContent += textToType.charAt(index);
    index++;
    setTimeout(typeWriter, 150);
  }
}
typeWriter();

// Carousel logic
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentSlide = 0;

function showSlide(n) {
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === n);
  });
}

prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

// Auto-cycle carousel every 5 seconds
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);

// Testimonials auto-slide
const testimonials = document.querySelectorAll('.testimonial');
let currentTestimonial = 0;

function showTestimonial(n) {
  testimonials.forEach((t, i) => {
    t.classList.toggle('active', i === n);
  });
}

setInterval(() => {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  showTestimonial(currentTestimonial);
}, 7000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Revizrlearn/service-worker.js');
  });
}

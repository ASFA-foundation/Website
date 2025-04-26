// Animate progress bar with smoother animation and better practices
function animateProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  if (!progressBar) return; // Exit if no progress bar found
  
  const targetWidth = parseInt(progressBar.getAttribute('aria-valuenow'));
  const animationDuration = 1000; // 1 second duration
  const startTime = performance.now();
  
  function updateProgress(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      const currentWidth = Math.floor(progress * targetWidth);
      
      progressBar.style.width = `${currentWidth}%`;
      progressBar.textContent = `${currentWidth}%`;
      
      if (progress < 1) {
          requestAnimationFrame(updateProgress);
      }
  }
  
  requestAnimationFrame(updateProgress);
}

// Trigger on page load with check for reduced motion preference
window.addEventListener('load', () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animateProgressBar();
  } else {
      // For users who prefer reduced motion, set immediately
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
          const targetWidth = progressBar.getAttribute('aria-valuenow');
          progressBar.style.width = `${targetWidth}%`;
          progressBar.textContent = `${targetWidth}%`;
      }
  }
});

// Newsletter Form Submission with basic validation
document.querySelector('.newsletter-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const emailInput = this.querySelector('input[type="email"]');
  const email = emailInput.value.trim();
  
  // Basic email validation
  if (!email || !email.includes('@')) {
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
      return;
  }
  
  // Remove any error state
  emailInput.classList.remove('error');
  emailInput.setAttribute('aria-invalid', 'false');
  
  // Show success message (consider replacing alert with a proper UI message)
  alert(`Thank you for subscribing with ${email}! We'll keep you updated.`);
  
  // Reset form
  this.reset();
  
  // Focus management for better accessibility
  emailInput.focus();
});
// Main JavaScript functionality for Vysotski portfolio

// Email copy functionality with error handling
const emailBtn = document.getElementById('emailButton');
const email = 'hey@vysotski.me';

async function copyEmailToClipboard() {
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = email;
      textArea.style.cssText = `
        position: absolute;
        left: -100vw;
        top: -100vh;
        opacity: 0;
        pointer-events: none;
        user-select: none;
      `;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showSuccessMessage();
      } else {
        showErrorMessage();
      }
      return;
    }
    
    // Modern clipboard API
    await navigator.clipboard.writeText(email);
    showSuccessMessage();
    
  } catch (err) {
    console.error('Failed to copy email:', err);
    showErrorMessage();
  }
}

function showSuccessMessage() {
  const originalText = emailBtn.textContent;
  emailBtn.textContent = 'Email copied!';
  
  setTimeout(() => {
    emailBtn.textContent = originalText;
  }, 2000);
}

function showErrorMessage() {
  const originalText = emailBtn.textContent;
  emailBtn.textContent = 'Failed to copy';
  
  setTimeout(() => {
    emailBtn.textContent = originalText;
  }, 2000);
}

// Initialize email functionality when DOM is ready
function initEmailFunctionality() {
  if (emailBtn) {
    // Add keyboard support for email link
    emailBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyEmailToClipboard();
      }
    });
    
    console.log('Email functionality initialized');
  }
}

// Preload fonts for better performance
function initFontPreloading() {
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      console.log('Fonts loaded successfully');
    });
  }
}

// Initialize all functionality when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initEmailFunctionality();
    initFontPreloading();
  });
} else {
  initEmailFunctionality();
  initFontPreloading();
}

// Make email copy function globally available for debugging
window.copyEmail = copyEmailToClipboard;

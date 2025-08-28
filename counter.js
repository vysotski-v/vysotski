// Simple Click Counter
// Uses localStorage for persistence (no database needed)

class ClickCounter {
  constructor() {
    this.counts = {
      square: 0,
      circle: 0
    };
    this.init();
  }

  init() {
    // Load saved counts from localStorage
    this.loadCounts();
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Update display
    this.updateDisplay();
    
    console.log('Click counter initialized');
  }

  loadCounts() {
    try {
      const saved = localStorage.getItem('clickCounts');
      if (saved) {
        this.counts = JSON.parse(saved);
        console.log('Loaded counts from localStorage:', this.counts);
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  }

  saveCounts() {
    try {
      localStorage.setItem('clickCounts', JSON.stringify(this.counts));
    } catch (error) {
      console.error('Error saving counts:', error);
    }
  }

  increment(id) {
    if (this.counts.hasOwnProperty(id)) {
      this.counts[id]++;
      this.saveCounts();
      this.updateDisplay();
      console.log(`${id} clicked! New count: ${this.counts[id]}`);
    }
  }

  updateDisplay() {
    const squareEl = document.getElementById('square');
    const circleEl = document.getElementById('circle');
    
    if (squareEl) {
      squareEl.textContent = this.counts.square;
    }
    
    if (circleEl) {
      circleEl.textContent = this.counts.circle;
    }
  }

  attachEventListeners() {
    const squareEl = document.getElementById('square');
    const circleEl = document.getElementById('circle');
    
    if (squareEl) {
      squareEl.addEventListener('click', () => this.increment('square'));
      console.log('Square click listener attached');
    }
    
    if (circleEl) {
      circleEl.addEventListener('click', () => this.increment('circle'));
      console.log('Circle click listener attached');
    }
  }

  // Public method to reset counts
  reset() {
    this.counts = { square: 0, circle: 0 };
    this.saveCounts();
    this.updateDisplay();
    console.log('Counts reset');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.clickCounter = new ClickCounter();
  });
} else {
  window.clickCounter = new ClickCounter();
}

// Make reset function globally available for debugging
window.resetCounts = () => {
  if (window.clickCounter) {
    window.clickCounter.reset();
  }
};

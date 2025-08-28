// Database-backed Click Counter using Supabase

class ClickCounter {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // Try to use Supabase database
      this.db = new ClickDatabase();
      await this.db.initialize();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Update display with current counts
      this.updateDisplay();
      
      console.log('Click counter initialized with Supabase database');
    } catch (error) {
      console.error('Error initializing Supabase database, falling back to local storage:', error);
      // Fallback to local storage if database fails
      this.fallbackToLocal();
    }
  }

  fallbackToLocal() {
    console.log('Falling back to local storage');
    this.db = new LocalClickDatabase();
    this.db.initialize();
    this.attachEventListeners();
    this.updateDisplay();
  }

  async increment(id) {
    try {
      if (this.db) {
        // Use database
        const newCount = await this.db.increment(id);
        this.updateDisplay();
        console.log(`${id} clicked! New count: ${newCount}`);
      }
    } catch (error) {
      console.error('Error incrementing counter:', error);
      // If database fails, try to fallback to local storage
      if (this.db instanceof ClickDatabase) {
        console.log('Database failed, switching to local storage');
        this.fallbackToLocal();
        await this.increment(id); // Retry with local storage
      }
    }
  }

  updateDisplay() {
    const squareEl = document.getElementById('square');
    const circleEl = document.getElementById('circle');
    
    let counts;
    if (this.db) {
      counts = this.db.getCounts();
    } else {
      counts = { square: 0, circle: 0 };
    }
    
    if (squareEl) {
      squareEl.textContent = counts.square;
    }
    
    if (circleEl) {
      circleEl.textContent = counts.circle;
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
  async reset() {
    try {
      if (this.db) {
        await this.db.reset();
      }
      this.updateDisplay();
      console.log('Counts reset');
    } catch (error) {
      console.error('Error resetting counts:', error);
    }
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

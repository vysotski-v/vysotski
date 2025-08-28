// Database-backed Click Counter using Supabase

class ClickCounter {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // Try to use Supabase database
      console.log('Initializing Supabase database...');
      this.db = new ClickDatabase();
      await this.db.initialize();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Update display with current counts
      this.updateDisplay();
      
      console.log('Click counter initialized with Supabase database');
      console.log('Initial counts loaded:', this.db.getCounts());
    } catch (error) {
      console.error('Error initializing Supabase database, falling back to local storage:', error);
      // Fallback to local storage if database fails
      this.fallbackToLocal();
    }
  }

  async fallbackToLocal() {
    console.log('Falling back to local storage');
    this.db = new LocalClickDatabase();
    await this.db.initialize();
    this.attachEventListeners();
    this.updateDisplay();
  }

  async increment(id) {
    try {
      if (this.db) {
        // Use database
        console.log(`Incrementing ${id} in database...`);
        const newCount = await this.db.increment(id);
        this.updateDisplay();
        console.log(`${id} clicked! New count: ${newCount}`);
        console.log('Current database counts:', this.db.getCounts());
      }
    } catch (error) {
      console.error('Error incrementing counter:', error);
      // If database fails, try to fallback to local storage
      if (this.db instanceof ClickDatabase) {
        console.log('Database failed, switching to local storage');
        await this.fallbackToLocal();
        await this.increment(id); // Retry with local storage
      }
    }
  }

  updateDisplay() {
    const squareEl = document.getElementById('btn-square');
    const circleEl = document.getElementById('btn-circle');
    
    let counts;
    if (this.db) {
      counts = this.db.getCounts();
    } else {
      counts = { 'btn-square': 0, 'btn-circle': 0 };
    }
    
    if (squareEl) {
      squareEl.textContent = counts['btn-square'];
    }
    
    if (circleEl) {
      circleEl.textContent = counts['btn-circle'];
    }
  }

  attachEventListeners() {
    const squareEl = document.getElementById('btn-square');
    const circleEl = document.getElementById('btn-circle');
    
    if (squareEl) {
      squareEl.addEventListener('click', () => this.increment('btn-square'));
      console.log('Square click listener attached');
    }
    
    if (circleEl) {
      circleEl.addEventListener('click', () => this.increment('btn-circle'));
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

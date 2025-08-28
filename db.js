// Database layer for click counter using existing Supabase setup

class SupabaseClickDatabase {
  constructor() {
    this.supabaseUrl = 'https://hpvpozhrsxlvtzolgfhj.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdnBvemhyc3hsdnR6b2xnZmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODMzODQsImV4cCI6MjA3MTk1OTM4NH0.rHgWYjc5PFQNcDIvgmNy3XHROcbSYNUYSk34b5aAU4E';
    this.client = null;
    this.counts = { square: 0, circle: 0 };
  }

  async initialize() {
    try {
      // Create Supabase client
      this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
      
      // Load existing counts
      await this.loadCounts();
      console.log('Supabase database initialized with counts:', this.counts);
    } catch (error) {
      console.error('Error initializing Supabase database:', error);
      throw error;
    }
  }

  async loadCounts() {
    try {
      const { data, error } = await this.client
        .from('clicks')
        .select('id, count');

      if (error) {
        console.error('Error loading counts:', error);
        throw error;
      }

      // Initialize counts from database
      this.counts = { square: 0, circle: 0 };
      data.forEach(row => {
        if (this.counts.hasOwnProperty(row.id)) {
          this.counts[row.id] = row.count;
        }
      });

      return this.counts;
    } catch (error) {
      console.error('Error in loadCounts:', error);
      throw error;
    }
  }

  async increment(id) {
    try {
      if (!this.counts.hasOwnProperty(id)) {
        throw new Error(`Invalid counter ID: ${id}`);
      }

      // Get current count
      const { data, error } = await this.client
        .from('clicks')
        .select('count')
        .eq('id', id)
        .single();

      let currentCount = 0;

      if (error && error.code === 'PGRST116') {
        // Row doesn't exist, create it with count = 1
        console.log(`Creating new row for ${id}`);
        const { error: insertError } = await this.client
          .from('clicks')
          .insert({ id: id, count: 1 });

        if (insertError) {
          console.error('Error creating row:', insertError);
          throw insertError;
        }
        
        // Update local counts and return 1
        this.counts[id] = 1;
        return 1;
      } else if (error) {
        console.error('Error fetching count:', error);
        throw error;
      } else {
        currentCount = data.count;
      }

      const newCount = currentCount + 1;

      // Update the count in database
      const { error: updateError } = await this.client
        .from('clicks')
        .update({ count: newCount })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating count:', updateError);
        throw updateError;
      }

      // Update local counts
      this.counts[id] = newCount;
      return newCount;

    } catch (error) {
      console.error('Error in increment:', error);
      throw error;
    }
  }

  getCounts() {
    return { ...this.counts };
  }

  async reset() {
    try {
      // Reset both square and circle to 0
      const { error: updateSquareError } = await this.client
        .from('clicks')
        .update({ count: 0 })
        .eq('id', 'square');

      const { error: updateCircleError } = await this.client
        .from('clicks')
        .update({ count: 0 })
        .eq('id', 'circle');

      if (updateSquareError || updateCircleError) {
        console.error('Error resetting counts:', updateSquareError || updateCircleError);
        throw updateSquareError || updateCircleError;
      }

      this.counts = { square: 0, circle: 0 };
    } catch (error) {
      console.error('Error in reset:', error);
      throw error;
    }
  }
}

// Fallback to localStorage if Supabase fails
class LocalClickDatabase {
  constructor() {
    this.counts = { square: 0, circle: 0 };
  }

  async initialize() {
    this.loadFromStorage();
    console.log('Local database initialized with counts:', this.counts);
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('clickCounts');
      if (saved) {
        this.counts = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('clickCounts', JSON.stringify(this.counts));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async increment(id) {
    if (this.counts.hasOwnProperty(id)) {
      this.counts[id]++;
      this.saveToStorage();
      return this.counts[id];
    }
    throw new Error(`Invalid counter ID: ${id}`);
  }

  getCounts() {
    return { ...this.counts };
  }

  async reset() {
    this.counts = { square: 0, circle: 0 };
    this.saveToStorage();
  }
}

// Export the appropriate database class
window.ClickDatabase = SupabaseClickDatabase;
window.LocalClickDatabase = LocalClickDatabase;

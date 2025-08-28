// clicks.js

// Load counts on page load
async function loadCounts() {
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  
  try {
    const { data, error } = await supabaseClient.from('clicks').select('id, count')
    if (error) {
      console.error('Error loading counts:', error)
      if (error.code === '42501') {
        console.error('❌ RLS Policy Error: Row Level Security is blocking reads.')
        console.error('💡 Solution: Go to Supabase Dashboard → Authentication → Policies → Disable RLS on clicks table')
      } else if (error.status === 401) {
        console.error('❌ Authentication Error: Invalid API key or permissions.')
        console.error('💡 Check your Supabase API key configuration.')
      } else if (error.status === 406) {
        console.error('❌ Request Error: Invalid request format.')
        console.error('💡 Check your Supabase client configuration.')
      }
      return
    }

    // Set counts for existing rows
    data.forEach(row => {
      const el = document.getElementById(row.id)
      if (el) el.innerText = row.count
    })
    
    // Ensure both square and circle elements show 0 if no data exists
    const squareEl = document.getElementById('square')
    const circleEl = document.getElementById('circle')
    
    if (squareEl && !data.find(row => row.id === 'square')) {
      squareEl.innerText = '0'
    }
    
    if (circleEl && !data.find(row => row.id === 'circle')) {
      circleEl.innerText = '0'
    }
    
  } catch (err) {
    console.error('Unexpected error in loadCounts:', err)
  }
}

// Increment counter when square or circle is clicked
async function increment(id) {
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  
  try {
    // Try to fetch current count
    const { data, error } = await supabaseClient
      .from('clicks')
      .select('count')
      .eq('id', id)
      .single()

    let currentCount = 0;
    
    if (error && error.code === 'PGRST116') {
      // Row doesn't exist, create it with count = 1
      console.log(`Creating new row for ${id}`);
      const { error: insertError } = await supabaseClient
        .from('clicks')
        .insert({ id: id, count: 1 })
      
      if (insertError) {
        console.error('Error creating row:', insertError)
        if (insertError.code === '42501') {
          console.error('❌ RLS Policy Error: Row Level Security is blocking inserts.')
          console.error('💡 Solution: Go to Supabase Dashboard → Authentication → Policies → Disable RLS on clicks table')
        }
        return
      }
      
      currentCount = 1;
    } else if (error) {
      console.error('Error fetching count:', error)
      if (error.code === '42501') {
        console.error('❌ RLS Policy Error: Row Level Security is blocking reads.')
        console.error('💡 Solution: Go to Supabase Dashboard → Authentication → Policies → Disable RLS on clicks table')
      }
      return
    } else {
      currentCount = data.count;
    }

    const newCount = currentCount + 1

    // Update Supabase (only if we didn't just create the row)
    if (currentCount > 0) {
      const { error: updateError } = await supabaseClient
        .from('clicks')
        .update({ count: newCount })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating count:', updateError)
        return
      }
    }

    // Update UI instantly
    const el = document.getElementById(id)
    if (el) el.innerText = newCount
    
  } catch (err) {
    console.error('Unexpected error in increment:', err)
  }
}

// Attach click events when DOM is ready
function attachEventListeners() {
  const squareEl = document.getElementById('square')
  const circleEl = document.getElementById('circle')
  
  if (squareEl) {
    squareEl.addEventListener('click', () => increment('square'))
  }
  
  if (circleEl) {
    circleEl.addEventListener('click', () => increment('circle'))
  }
}

// Initialize clicks functionality
function initializeClicks() {
  console.log('Initializing clicks functionality');
  attachEventListeners();
  loadCounts();
}

// Make initializeClicks globally available
window.initializeClicks = initializeClicks;

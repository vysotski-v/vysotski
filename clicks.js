// clicks.js
import { supabase } from './supabaseClient.js'

// Load counts on page load
async function loadCounts() {
  const { data, error } = await supabase.from('clicks').select('id, count')
  if (error) {
    console.error('Error loading counts:', error)
    return
  }

  data.forEach(row => {
    const el = document.getElementById(row.id)
    if (el) el.innerText = row.count
  })
}

// Increment counter when square or circle is clicked
async function increment(id) {
  // Fetch current count
  const { data, error } = await supabase
    .from('clicks')
    .select('count')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching count:', error)
    return
  }

  const newCount = data.count + 1

  // Update Supabase
  const { error: updateError } = await supabase
    .from('clicks')
    .update({ count: newCount })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating count:', updateError)
    return
  }

  // Update UI instantly
  const el = document.getElementById(id)
  if (el) el.innerText = newCount
}

// Attach click events
document.getElementById('square').addEventListener('click', () => increment('square'))
document.getElementById('circle').addEventListener('click', () => increment('circle'))

// Run on startup
loadCounts()

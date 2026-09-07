import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eckfauyeypikvolpidsz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja2ZhdXlleXBpa3ZvbHBpZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjE1NTIsImV4cCI6MjEwNDMzNzU1Mn0.9FSsOWE1ab8KJLf6UVWAXAJJtgTZVhOd7X-jM0Lg5Jo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log(`URL: ${supabaseUrl}`)

  // Test 1: Basic connection
  const { data: healthData, error: healthError } = await supabase
    .from('_test_connection')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (healthError) {
    if (healthError.code === '42P01' || healthError.message.includes('does not exist')) {
      console.log('✅ Connection OK (table not found yet - expected)')
    } else {
      console.log('⚠️  Connection issue:', healthError.message)
    }
  } else {
    console.log('✅ Connection OK')
  }

  // Test 2: Check if customers table exists
  const { data: customersData, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .limit(1)

  if (customersError) {
    if (customersError.code === '42P01') {
      console.log('❌ Table "customers" does not exist - run SQL migration first')
    } else {
      console.log('⚠️  customers table error:', customersError.message)
    }
  } else {
    console.log(`✅ Table "customers" exists (${customersData?.length || 0} rows)`)
  }

  // Test 3: Check if orders table exists
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .limit(1)

  if (ordersError) {
    if (ordersError.code === '42P01') {
      console.log('❌ Table "orders" does not exist - run SQL migration first')
    } else {
      console.log('⚠️  orders table error:', ordersError.message)
    }
  } else {
    console.log(`✅ Table "orders" exists (${ordersData?.length || 0} rows)`)
  }

  // Test 4: Auth status
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.log('ℹ️  Auth: No active session (expected for API key auth)')
  } else {
    console.log(`✅ Auth: Logged in as ${user?.email || 'unknown'}`)
  }
}

testConnection().catch(console.error)

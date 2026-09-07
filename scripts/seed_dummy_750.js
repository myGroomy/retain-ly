const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://eckfauyeypikvolpidsz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja2ZhdXlleXBpa3ZvbHBpZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjE1NTIsImV4cCI6MjEwNDMzNzU1Mn0.9FSsOWE1ab8KJLf6UVWAXAJJtgTZVhOd7X-jM0Lg5Jo'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const FIRST_NAMES = [
  'Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Maya', 'Hendra', 'Rina', 'Agus', 'Lani',
  'Eko', 'Nita', 'Fajar', 'Dian', 'Bambang', 'Fitri', 'Rudi', 'Indah', 'Bayu', 'Sri',
  'Ahmad', 'Yuni', 'Doni', 'Ratna', 'Gilang', 'Putri', 'Taufik', 'Sari', 'Dimas', 'Mega',
  'Reza', 'Wulan', 'Arif', 'Tari', 'Diki', 'Desi', 'Rian', 'Anita', 'Gading', 'Gita',
  'Irfan', 'Tania', 'Lukman', 'Dina', 'Fikri', 'Siska', 'Aditya', 'Vina', 'Galih', 'Lia',
  'Kevin', 'Clarissa', 'Daniel', 'Jessica', 'David', 'Stephanie', 'Christian', 'Michelle',
  'Alvin', 'Vanessa', 'Jonathan', 'Nicole', 'William', 'Grace', 'Bryan', 'Patricia',
  'Farhan', 'Nabila', 'Faisal', 'Zahra', 'Ilham', 'Aisyah', 'Rifky', 'Syifa', 'Rayhan', 'Annisa'
]

const LAST_NAMES = [
  'Santoso', 'Rahma', 'Wijaya', 'Lestari', 'Pratama', 'Setiawan', 'Agustina', 'Nugroho', 'Hidayat', 'Kusuma',
  'Suryani', 'Putra', 'Wibowo', 'Firmansyah', 'Saputra', 'Utami', 'Siregar', 'Pasaribu', 'Simanjuntak', 'Hutapea',
  'Nasution', 'Batubara', 'Ginting', 'Sembiring', 'Tarigan', 'Sinaga', 'Lubis', 'Harahap', 'Tanjung', 'Chaniago',
  'Kurniawan', 'Hadi', 'Mahendra', 'Purnama', 'Prakoso', 'Gunawan', 'Suherman', 'Budiman', 'Sukoco', 'Pambudi',
  'Wong', 'Tan', 'Lim', 'Tjoa', 'Lie', 'Ang', 'Khoe', 'Oey', 'Gho', 'Ong'
]

const CHANNELS = ['dine_in', 'takeaway', 'gofood', 'grab', 'shopee', 'whatsapp']

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function generatePhone(index) {
  const prefixes = ['0812', '0813', '0857', '0878', '0821', '0838', '0896', '0852']
  const prefix = prefixes[index % prefixes.length]
  const suffix = String(1000000 + index).slice(1)
  return `08${prefix.slice(2)}${suffix}`
}

async function seed() {
  console.log('Generating 750 dummy customers and order history (1 month period)...')

  const today = new Date('2026-09-08')
  
  const customersData = []
  const ordersData = []

  // Generate 750 customers
  for (let i = 0; i < 750; i++) {
    const firstName = getRandomItem(FIRST_NAMES)
    const lastName = getRandomItem(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const phone = generatePhone(i)

    // Determine retention segment for target realistic ratio:
    // ~65% active (0-30 days ago)
    // ~25% at_risk (31-60 days ago)
    // ~10% churned (61-90 days ago)
    const rand = Math.random()
    let daysAgoLastOrder
    if (rand < 0.65) {
      daysAgoLastOrder = getRandomInt(0, 28) // Active
    } else if (rand < 0.90) {
      daysAgoLastOrder = getRandomInt(31, 58) // At Risk
    } else {
      daysAgoLastOrder = getRandomInt(61, 88) // Churned
    }

    const lastOrderDateObj = new Date(today.getTime() - daysAgoLastOrder * 86400000)
    
    // Number of orders: 1 to 9 orders
    const orderCount = getRandomInt(1, 7)
    
    // First order date is 5 to 60 days before last order date
    const firstOrderDaysBefore = (orderCount > 1) ? getRandomInt(5, 40) : 0
    const firstOrderDateObj = new Date(lastOrderDateObj.getTime() - firstOrderDaysBefore * 86400000)

    const customerObj = {
      name: fullName,
      phone_normalized: phone,
      first_order_date: formatDate(firstOrderDateObj)
    }

    customersData.push(customerObj)
  }

  // Insert customers in batches of 100
  console.log('Inserting customers into Supabase...')
  const insertedCustomers = []
  for (let i = 0; i < customersData.length; i += 100) {
    const batch = customersData.slice(i, i + 100)
    const { data, error } = await supabase.from('customers').insert(batch).select()
    if (error) {
      console.error('Error inserting customer batch:', error)
      process.exit(1)
    }
    insertedCustomers.push(...data)
  }

  console.log(`Inserted ${insertedCustomers.length} customers successfully!`)

  // Generate orders for inserted customers
  for (const cust of insertedCustomers) {
    // Generate order history between first_order_date and last_order_date
    const firstTime = new Date(cust.first_order_date).getTime()
    // Find customer days ago from our generated data
    const orderCount = getRandomInt(1, 6)
    
    // Generate dates between first_order_date and today
    for (let j = 0; j < orderCount; j++) {
      let dateOffset = (j === 0) ? 0 : getRandomInt(1, 25)
      const orderDateObj = new Date(firstTime + dateOffset * 86400000)
      if (orderDateObj > today) orderDateObj.setTime(today.getTime())

      const ch = getRandomItem(CHANNELS)
      ordersData.push({
        customer_id: cust.id,
        order_date: formatDate(orderDateObj),
        channel: ch,
        raw_phone_input: cust.phone_normalized
      })
    }
  }

  console.log(`Inserting ${ordersData.length} orders into Supabase...`)
  for (let i = 0; i < ordersData.length; i += 200) {
    const batch = ordersData.slice(i, i + 200)
    const { error } = await supabase.from('orders').insert(batch)
    if (error) {
      console.error('Error inserting orders batch:', error)
      process.exit(1)
    }
  }

  console.log('SEEDING COMPLETE! Successfully added 750 customers and all order records!')
}

seed().catch(console.error)

const { google } = require('googleapis')
const { v4: uuidv4 } = require('uuid')

const SERVICE_ACCOUNT_EMAIL = 'stokis-service@stokis-project.iam.gserviceaccount.com'
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDWWqW1zL6uGfFg
yYAZ5RSpNGHcOthevEiYVCL5hH419yBnrZ115C1nMSv5ceplf6aY6piHz55Xh4AH
ttm0rN7hM8D6DQdssPOMB+Nx+Czd1HVV3SU9TFcRz35oRUQIzmkEXP1Wl4bBjUI1
9V7JU2sPZu4yigdXeU/iXAT0ORnlzE+T2bn823oBT76agvyrF0s7uiHhylPdV3NV
wZW3jqdvM07t6HHdJu/jKcC/jKvSkyaZzwm13ivSwyQafFrXgdF+cv3vgL+Qerhw
8o8RRC00Bfpbh1BvInZoC6xvPCJ65ice5G1rHaLvji2REGXOQfSXgSO1jQvJ+qFP
294I8SShAgMBAAECggEAB7yDI+nygoYdLXPC/oGYxU1GsD7PdbEwouQmfwBGgzFw
J03KKRRwhGZEmAmB1Df541BUQP0//G4U3jJomRoZe+H097wQpd5HwVNnj214RmlX
SB9l1gMzVp6OiWThQmVwv4o7pSxtiKl4gkoLfxNWVy/32OByc2Ma0ail5R/1If4K
IzhLZ9qnVQQrTOeHWP5L577i7n0Et58WgjCS57gPEdFgh5GkjCKjfmSCLwbhFzqz
yClNNWn5Pj90cupXyAbz1JDXx3cFHT3+PmbE5WIsCZ7b3lbROzXi7I/FdoYtabMi
Po01T0RRLqqc2/23HOsgFO96XNkssHru6zM3dtQuAQKBgQD7LBdG+2jm1GhWguf0
F84S+zef2JjqpFuxHIz2RV6vWwNOg/aeWAoxOYf2eOQXRj3azgG5ImmX17fbVjhd
tCOnLWXcwAlS/XbabxfdfUSrYg6XaId85fjAx7W26Dd+HwlM4Brc2WAv4o3AkUcZ
IgZwAqcpDvJh8mmRsP2mVuA0aQKBgQDaeWPuzf7t1fDlhdaa2IUCfkJvRYTDDm8e
Jx9Kj+HizpVW5TxrkjAfPIkyFTDLAx61/AcIj8q662InUdEeEnoIKwaZNxm01/Is
UrNfvV7iYj+F4tW8Oi2p0Ru6i9G1ZntzmuoMei+xEX9SmQzJpVolnwAm6ulJ1+Vm
sflY9A2HeQKBgE7/9i5QQxVfN5YGRHiEyD82Hq+7C5W5rlFNnpSTCw3yfV7DqNzy
6fnDk50VNwCPCkN4yhf11+p3Yg+t1bq7Pv+FCuXczNH6gNiBWqtCjEevZtF+gibp
mkzgQ6pM7a9QibdRQYG3KUbGZjlsOEWSax3t56/FUL035rZ5Sb540roJAoGAT8NX
99zfgQfF7pZhlqEMVq+wI53W7bv8V57i7r7/MmZH4bTJzWBPD2hzkoRoDwZxlPGR
w89zrbC4YjCdz4PhZ9AFlbSnPv5EXWhIMuEZnj9Of9wkOpdnCoPcwsu/YaIr2jYp
0ypc9SG1QXu9TnV/JxMY5ByJ1brr9wVtSsu3kMkCgYBiv5P0nTfKDo/ragcAdcdK
uEAvRrf/qM/LVq5FKmb7MCULYAP9hVfPzimNZA1RaR8ClBvJqFtxq5K0zO0xlLQC
Lo1pmFHLEnrajt9wRZY9lEHRAFi/KhtiBrFU/AcCkuu8qpj5MvXsQS9gNYK1wXG2
eEFuie9z4SYllY9IL/uIzg==
-----END PRIVATE KEY-----`

const SPREADSHEET_ID = '1aiBxUoN_xdR5Tu3hYJKl10R-jQzp1LCK8DnQzqLG9YQ'

// Indonesian names
const FIRST_NAMES_M = [
  'Budi', 'Andi', 'Rizky', 'Hendra', 'Agus', 'Eko', 'Fajar', 'Bambang', 'Rudi', 'Bayu',
  'Ahmad', 'Doni', 'Gilang', 'Taufik', 'Dimas', 'Reza', 'Arif', 'Diki', 'Rian', 'Gading',
  'Irfan', 'Lukman', 'Fikri', 'Aditya', 'Galih', 'Kevin', 'Daniel', 'David', 'Alvin', 'Jonathan',
  'William', 'Bryan', 'Farhan', 'Faisal', 'Ilham', 'Rifky', 'Rayhan', 'Raka', 'Yoga', 'Fadhil',
  'Arya', 'Bagas', 'Citra', 'Denny', 'Erlangga', 'Firmansyah', 'Ghifari', 'Hafiz', 'Indra', 'Joko'
]

const FIRST_NAMES_F = [
  'Siti', 'Dewi', 'Maya', 'Rina', 'Nita', 'Dian', 'Fitri', 'Indah', 'Sri', 'Yuni',
  'Ratna', 'Putri', 'Sari', 'Mega', 'Wulan', 'Tari', 'Desi', 'Anita', 'Gita', 'Nabila',
  'Zahra', 'Aisyah', 'Syifa', 'Annisa', 'Clarissa', 'Jessica', 'Stephanie', 'Michelle', 'Nicole', 'Grace',
  'Patricia', 'Vanessa', 'Tania', 'Dina', 'Siska', 'Vina', 'Lia', 'Naura', 'Kayla', 'Aurel',
  'Bella', 'Citra', 'Dinda', 'Elsa', 'Fiona', 'Gita', 'Hana', 'Intan', 'Julia', 'Kartika'
]

const LAST_NAMES = [
  'Santoso', 'Rahma', 'Wijaya', 'Lestari', 'Pratama', 'Setiawan', 'Agustina', 'Nugroho', 'Hidayat', 'Kusuma',
  'Suryani', 'Putra', 'Wibowo', 'Firmansyah', 'Saputra', 'Utami', 'Siregar', 'Pasaribu', 'Simanjuntak', 'Hutapea',
  'Nasution', 'Batubara', 'Ginting', 'Sembiring', 'Tarigan', 'Sinaga', 'Lubis', 'Harahap', 'Tanjung', 'Chaniago',
  'Kurniawan', 'Hadi', 'Mahendra', 'Purnama', 'Prakoso', 'Gunawan', 'Suherman', 'Budiman', 'Sukoco', 'Pambudi',
  'Wijoyo', 'Saputro', 'Handoko', 'Susanto', 'Wibisono', 'Hartono', 'Sutrisno', 'Widodo', 'Purnomo', 'Sugiarto'
]

const CHANNELS = ['dine_in', 'takeaway', 'gofood', 'grab', 'shopee', 'whatsapp']
const BRANCHES = ['CMH', 'BDG']

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
  const prefixes = ['0812', '0813', '0857', '0878', '0821', '0838', '0896', '0852', '0815', '0856']
  const prefix = prefixes[index % prefixes.length]
  const num = String(10000000 + index).slice(-7)
  return `${prefix}${num}`
}

async function main() {
  console.log('🚀 Starting to seed 500 customers (250 CMH + 250 BDG)...\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const today = new Date('2026-09-10')

  const customersData = []
  const ordersData = []

  // Generate 500 customers (250 per branch)
  for (let i = 0; i < 500; i++) {
    const branch = i < 250 ? 'CMH' : 'BDG'
    const isFemale = Math.random() > 0.5
    const firstName = isFemale ? getRandomItem(FIRST_NAMES_F) : getRandomItem(FIRST_NAMES_M)
    const lastName = getRandomItem(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const phone = generatePhone(i)
    const id = uuidv4()

    // Determine retention segment
    const rand = Math.random()
    let daysAgoLastOrder
    if (rand < 0.60) {
      daysAgoLastOrder = getRandomInt(0, 25) // Active
    } else if (rand < 0.85) {
      daysAgoLastOrder = getRandomInt(26, 55) // At Risk
    } else {
      daysAgoLastOrder = getRandomInt(56, 90) // Churned
    }

    const lastOrderDateObj = new Date(today.getTime() - daysAgoLastOrder * 86400000)
    
    const orderCount = getRandomInt(1, 8)
    const firstOrderDaysBefore = orderCount > 1 ? getRandomInt(5, 45) : 0
    const firstOrderDateObj = new Date(lastOrderDateObj.getTime() - firstOrderDaysBefore * 86400000)

    customersData.push({
      id,
      name: fullName,
      phone_normalized: phone,
      first_order_date: formatDate(firstOrderDateObj),
      created_at: new Date(firstOrderDateObj.getTime() - getRandomInt(0, 3) * 86400000).toISOString(),
      version: '1',
      branch,
    })

    // Generate orders
    for (let j = 0; j < orderCount; j++) {
      let dateOffset = j === 0 ? 0 : getRandomInt(1, 30)
      const orderDateObj = new Date(firstOrderDateObj.getTime() + dateOffset * 86400000)
      if (orderDateObj > today) orderDateObj.setTime(today.getTime())

      ordersData.push({
        id: uuidv4(),
        customer_id: id,
        order_date: formatDate(orderDateObj),
        channel: getRandomItem(CHANNELS),
        raw_phone_input: phone,
        created_at: orderDateObj.toISOString(),
      })
    }

    // Progress indicator
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`\r   Generated ${i + 1}/500 customers...`)
    }
  }

  console.log(`\n\n✅ Generated ${customersData.length} customers`)
  console.log(`✅ Generated ${ordersData.length} orders`)

  // Insert customers in batches of 50
  console.log('\n📥 Inserting customers into Google Sheets...')
  for (let i = 0; i < customersData.length; i += 50) {
    const batch = customersData.slice(i, i + 50)
    const rows = batch.map(c => [
      c.id, c.phone_normalized, c.name, c.first_order_date, c.created_at, c.version, c.branch
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'customers!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })

    process.stdout.write(`\r   Inserted ${Math.min(i + 50, customersData.length)}/500 customers...`)
  }
  console.log('\n   ✅ Customers inserted!')

  // Insert orders in batches of 100
  console.log('\n📥 Inserting orders into Google Sheets...')
  for (let i = 0; i < ordersData.length; i += 100) {
    const batch = ordersData.slice(i, i + 100)
    const rows = batch.map(o => [
      o.id, o.customer_id, o.order_date, o.channel, o.raw_phone_input, o.created_at
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'orders!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })

    process.stdout.write(`\r   Inserted ${Math.min(i + 100, ordersData.length)}/${ordersData.length} orders...`)
  }
  console.log('\n   ✅ Orders inserted!')

  // Summary
  const cmhCount = customersData.filter(c => c.branch === 'CMH').length
  const bdgCount = customersData.filter(c => c.branch === 'BDG').length

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('✅ SEEDING COMPLETE!')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`\n📊 Summary:`)
  console.log(`   • Total customers: ${customersData.length}`)
  console.log(`   • CMH (Cimahi): ${cmhCount} customers`)
  console.log(`   • BDG (Bandung): ${bdgCount} customers`)
  console.log(`   • Total orders: ${ordersData.length}`)
  console.log(`   • Avg orders/customer: ${(ordersData.length / customersData.length).toFixed(1)}`)
  console.log(`\n🔗 View data: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`)
  console.log('═══════════════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

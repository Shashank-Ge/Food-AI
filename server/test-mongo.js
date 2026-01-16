// Quick MongoDB connection test
require('dotenv').config()
const mongoose = require('mongoose')

console.log('Testing MongoDB connection...')
console.log('URI:', process.env.MONGO_URI ? 'Found in .env' : 'NOT FOUND in .env')

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env file')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!')
  console.log('Connection state:', mongoose.connection.readyState) // 1 = connected
  console.log('Database:', mongoose.connection.name)
  process.exit(0)
})
.catch(err => {
  console.error('❌ MongoDB connection failed:')
  console.error('Error:', err.message)
  console.error('\nCommon issues:')
  console.error('1. Check Network Access in MongoDB Atlas (whitelist your IP)')
  console.error('2. Verify Database Access credentials')
  console.error('3. Ensure cluster is running')
  console.error('4. Check connection string format')
  console.error('\nSee MONGODB_SETUP.md for detailed troubleshooting')
  process.exit(1)
})

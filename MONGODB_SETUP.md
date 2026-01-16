# MongoDB Setup Guide

## Current Configuration

The app now handles MongoDB gracefully:
- ✅ AI analysis returns **immediately** to the user
- ✅ MongoDB saves happen **asynchronously** in the background
- ✅ If MongoDB fails, the app still works (analysis is not blocked)

## How It Works

1. User uploads image
2. AI analyzes the food (Groq API)
3. **Response sent to user immediately** ⚡
4. MongoDB save happens in background (non-blocking)
5. If MongoDB times out or fails, user still sees their analysis

## MongoDB Connection Issues

### Problem: Connection Timeout

If you see:
```
MongooseError: Operation `meals.insertOne()` buffering timed out after 10000ms
```

**Good News:** This no longer blocks the user! The AI analysis still works.

### Solutions:

#### Option 1: Fix MongoDB Connection (Recommended)

1. **Check MongoDB Atlas**:
   - Go to https://cloud.mongodb.com/
   - Ensure your cluster is running
   - Check Network Access (whitelist your IP or use 0.0.0.0/0 for testing)
   - Verify Database Access (user credentials are correct)

2. **Update Connection String**:
   In `server/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodai?retryWrites=true&w=majority
   ```

3. **Test Connection**:
   ```bash
   cd server
   node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(err => console.error(err))"
   ```

#### Option 2: Use Local MongoDB

Install MongoDB locally:
```bash
# Windows (with Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

Update `.env`:
```
MONGO_URI=mongodb://localhost:27017/foodai
```

#### Option 3: Disable MongoDB (Testing Only)

Comment out MongoDB in `server/index.js`:
```javascript
// mongoose.connect(process.env.MONGO_URI, {
//   serverSelectionTimeoutMS: 5000,
//   socketTimeoutMS: 45000,
// })
```

The app will still work for AI analysis, just won't save history.

## Checking MongoDB Status

The server logs will show:
- `✓ MongoDB connected` - Everything working
- `✗ MongoDB connection error` - Connection failed (app still works)
- `⚠ MongoDB not connected - skipping save` - Save skipped (app still works)
- `✓ Meal saved to MongoDB: <id>` - Successfully saved
- `✗ MongoDB save error (non-critical)` - Save failed (app still works)

## History Endpoint

To view saved meals:
```
GET http://localhost:5000/history
```

Returns last 10 meals (only works if MongoDB is connected).

## Architecture Benefits

**Before (Blocking):**
```
Upload → AI Analysis → Wait for MongoDB → Response
                         ↑ (timeout = user sees error)
```

**After (Non-blocking):**
```
Upload → AI Analysis → Response to User ⚡
              ↓
         MongoDB Save (background)
         ↓
    Success or Fail (logged, doesn't affect user)
```

## Troubleshooting

### MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0) for testing
5. Click "Confirm"

### MongoDB Atlas Database Access

1. Go to "Database Access"
2. Ensure user exists with read/write permissions
3. Note the username and password
4. Update your `.env` file

### Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

Replace:
- `<username>` - Your MongoDB user
- `<password>` - Your password (URL encode special characters)
- `<cluster>` - Your cluster name
- `<database>` - Database name (e.g., "foodai")

## For Production

Consider:
- Using environment-specific connection strings
- Implementing retry logic
- Adding connection pooling
- Monitoring MongoDB health
- Setting up proper indexes on the Meal collection

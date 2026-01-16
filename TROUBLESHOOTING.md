# Troubleshooting Guide

## Common Issues and Solutions

### 1. Groq API Key Issues

**Problem:** API returns authentication errors

**Solution:**
- Verify your API key is correct in `server/.env`
- Get a new key from https://console.groq.com/
- Ensure no extra spaces in the `.env` file
- Restart the server after changing the key

### 2. Model Not Available

**Problem:** Error about model not found

**Solution:**
The app uses `meta-llama/llama-4-scout-17b-16e-instruct`. If this model is unavailable, try these alternatives:
- `llama-3.2-90b-vision-preview` (Llama 3.2 vision model)
- `llama-3.2-11b-vision-preview` (smaller, faster)
- Check Groq's documentation for current vision models

Update in `server/groq.js`:
```javascript
model: "llama-3.2-11b-vision-preview"
```

### 3. CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
- Ensure server is running on port 5000
- Check CORS is enabled in `server/index.js`
- Verify frontend is making requests to `http://localhost:5000`

### 4. Image Upload Fails

**Problem:** "No image received" error

**Solution:**
- Check file size (keep under 5MB)
- Ensure image format is supported (JPEG, PNG)
- Verify multer is configured correctly
- Check browser console for errors

### 5. JSON Parse Errors

**Problem:** Cannot parse AI response

**Solution:**
- The AI sometimes returns text with markdown formatting
- Check `server/groq.js` has proper regex to strip markdown
- Add more logging to see raw response:
```javascript
console.log("Raw response:", raw)
```

### 6. Server Won't Start

**Problem:** Port already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in server/index.js
app.listen(5001, () => console.log('Server on 5001'))
```

### 7. Dependencies Issues

**Problem:** Module not found errors

**Solution:**
```bash
# Clean install
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## Testing the API Directly

Use curl or Postman to test the backend:

```bash
curl -X POST http://localhost:5000/upload \
  -F "image=@path/to/your/food.jpg"
```

## Checking Logs

Always check both:
1. Server terminal for backend errors
2. Browser console (F12) for frontend errors

## Getting Help

If issues persist:
1. Check Groq API status
2. Verify all dependencies are installed
3. Ensure Node.js version is compatible (v14+)
4. Review error messages carefully

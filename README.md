# AI Food Nutrition Analyzer

A full-stack web application that analyzes food images using AI and provides nutritional guidance.

## Features

- 📸 Upload or capture food images
- 🤖 AI-powered food identification using Groq's vision model
- 🥗 Health assessment and nutritional advice
- 💡 Next meal suggestions from an AI nutritionist
- 💾 Automatic meal history storage in MongoDB (optional)
- 📊 View past meal analyses

## Tech Stack

**Frontend:**
- React 19
- JavaScript

**Backend:**
- Node.js
- Express
- Multer (file upload)
- Groq SDK (AI vision model)
- MongoDB + Mongoose (meal history storage)

**AI Model:**
- Groq's `meta-llama/llama-4-scout-17b-16e-instruct` for image analysis

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Groq API key

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd project
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables
Create a `.env` file in the `server` directory:
```
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=your_mongodb_connection_string
```

**Note:** MongoDB is optional. The app works without it - AI analysis will still function, but meal history won't be saved. See [MONGODB_SETUP.md](MONGODB_SETUP.md) for details.

### Running the Application

1. Start the backend server (from `server` directory):
```bash
node index.js
```
Server runs on `http://localhost:5000`

2. Start the frontend (from `client` directory):
```bash
npm start
```
Client runs on `http://localhost:3000`

## Usage

1. Open the app in your browser at `http://localhost:3000`
2. Click "Choose File" and select a food image
3. Click "Upload & Analyze"
4. View the AI analysis including:
   - Food identification
   - Health rating (healthy/moderate/unhealthy)
   - Reasoning
   - Next meal suggestions

## API Endpoints

### POST `/upload`
Upload a food image for analysis

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "message": "Analyzed",
  "filename": "food.jpg",
  "size": 12345,
  "analysis": {
    "food": "Pizza",
    "health": "moderate",
    "reason": "High in calories and carbs but provides protein",
    "next_meal": "Consider a salad with lean protein"
  }
}
```

**Note:** Response is sent immediately after AI analysis. MongoDB save happens asynchronously in the background.

### GET `/history`
Get last 10 analyzed meals (requires MongoDB connection)

**Response:**
```json
{
  "meals": [
    {
      "_id": "...",
      "filename": "food.jpg",
      "food": "Pizza",
      "health": "moderate",
      "reason": "High in calories...",
      "next_meal": "Consider a salad...",
      "size": 12345,
      "created_at": "2026-01-16T..."
    }
  ]
}
```

## Project Structure

```
project/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.js   # Main component
│   │   └── ...
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   │   └── Meal.js  # MongoDB schema
│   ├── index.js     # Server entry point
│   ├── groq.js      # Groq AI integration
│   ├── .env         # Environment variables
│   └── package.json
├── README.md
├── MONGODB_SETUP.md # MongoDB configuration guide
└── TROUBLESHOOTING.md
```

## Key Features

- **Non-blocking Architecture**: AI analysis returns immediately; MongoDB saves happen in background
- **Graceful Degradation**: App works even if MongoDB is down
- Switched from Gemini API to Groq SDK due to API key issues
- Using `meta-llama/llama-4-scout-17b-16e-instruct` model for vision capabilities
- Improved error handling and logging
- Enhanced UI with loading states and better styling

## Future Enhancements

- Add user authentication
- ~~Store meal history in NoSQL database (MongoDB)~~ ✅ Done
- Upload images to cloud storage (AWS S3/GCS)
- Add meal tracking and analytics dashboard
- Mobile app version (React Native)
- Nutritional breakdown (calories, macros)
- Meal recommendations based on history

## License

MIT

## Author

Created for DreamBig AI | rizzr.ai Internship Assignment

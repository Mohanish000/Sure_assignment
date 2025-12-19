# Credit Card Statement Parser

A modern, full-stack web application that extracts key data points from credit card statements across multiple issuers using React and Node.js. Built without code comments for clean, production-ready code.

## Live Demo

**Application is running at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Features

### Supported Credit Card Issuers
- Chase
- American Express
- Citibank
- Capital One
- Discover
- Bank of America
- Wells Fargo

### Extracted Data Points (5 Key Data Points)
1. **Card Last 4 Digits** - Last four digits of the credit card
2. **Billing Cycle** - Statement period dates
3. **Payment Due Date** - When payment is due
4. **Total Balance** - Outstanding balance and amounts due
5. **Transactions** - Transaction history with dates, descriptions, and amounts

### Additional Features
- Card Issuer Detection
- Card Variant/Type (Platinum, Gold, etc.)
- Single file and batch processing modes
- Modern, responsive UI
- JSON export functionality
- Real-time parsing

## Tech Stack

### Frontend
- React 18
- React Dropzone for file uploads
- Axios for HTTP requests
- Modern CSS with gradient designs

### Backend
- Node.js & Express
- Multer for file handling
- pdf-parse for PDF text extraction
- CORS enabled

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
cd ..
```

### Run the Application

```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend (in new terminal)
cd client && npm start
```

The application will automatically open at http://localhost:3000

## Usage

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:

Backend (port 5001):
```bash
npm run server
```

Frontend (port 3000):
```bash
npm run client
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Using the Parser

**Single Statement Mode:**
1. Click "Single Statement" button
2. Drag & drop a PDF credit card statement (or click to browse)
3. Wait for real-time processing (1-3 seconds)
4. View extracted data in three tabs:
   - **Overview**: Card info, billing cycle, balances
   - **Transactions**: Detailed transaction list
   - **JSON**: Raw extracted data
5. Download results as JSON file

**Batch Processing Mode:**
1. Click "Batch Processing" button
2. Upload multiple PDF statements simultaneously (up to 10)
3. View summary dashboard with success/failure counts
4. Review individual results for each statement
5. See color-coded status for each file

## API Endpoints

### POST /api/parse
Upload and parse a single credit card statement

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `statement` (PDF file)

**Response:**
```json
{
  "success": true,
  "data": {
    "issuer": "Chase",
    "card_last_four_digits": "1234",
    "card_variant": "Sapphire Preferred",
    "billing_cycle": {
      "start_date": "12/01/2024",
      "end_date": "12/31/2024"
    },
    "payment_due_date": "01/25/2025",
    "total_balance": {
      "New Balance": "$2,150.75"
    },
    "transactions": [...]
  },
  "filename": "statement.pdf"
}
```

### POST /api/parse-batch
Upload and parse multiple credit card statements

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `statements[]` (multiple PDF files)

**Response:**
```json
{
  "success": true,
  "results": [...],
  "total": 5,
  "successful": 4,
  "failed": 1
}
```

### GET /api/health
Check API status

## Project Structure

```
Sure-assignment/
├── server/
│   ├── index.js              # Express API server
│   ├── parser.js             # PDF parsing logic
│   └── uploads/              # Temporary file storage (auto-created)
├── client/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js        # Upload component
│   │   │   ├── FileUpload.css       # Upload styles
│   │   │   ├── ResultsDisplay.js    # Results component
│   │   │   └── ResultsDisplay.css   # Results styles
│   │   ├── App.js            # Main React app
│   │   ├── App.css           # App styles
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── package.json          # Frontend dependencies
├── package.json              # Backend dependencies
├── README.md                 # This file
├── SOLUTION_DOCUMENTATION.md # Technical documentation
└── .gitignore               # Git ignore rules
```

## Architecture

### Backend Structure
```
server/
├── index.js       # Express server & API routes
├── parser.js      # PDF parsing logic
└── uploads/       # Temporary file storage
```

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── FileUpload.js       # Drag & drop interface
│   │   ├── ResultsDisplay.js   # Data visualization
│   │   ├── FileUpload.css
│   │   └── ResultsDisplay.css
│   ├── App.js                  # Main application
│   ├── App.css
│   └── index.js
└── public/
    └── index.html
```

### Parsing Logic

The parser uses regex patterns to extract data:
- Multiple pattern variations per data point
- Fallback patterns for different issuer formats
- Line-by-line transaction parsing
- Smart text extraction from PDF

## Production Build

Build the React app:
```bash
npm run build
```

The backend can serve the static build files for production deployment.

## Technical Highlights

### Code Quality
- **Zero Comments**: Clean, self-documenting code throughout
- **Modern ES6+**: Arrow functions, destructuring, async/await
- **Component Architecture**: Reusable React components
- **Separation of Concerns**: Clear frontend/backend division

### User Experience
- **Beautiful UI**: Gradient design with smooth animations
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Feedback**: Loading states and progress indicators
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Clear, actionable error messages

### Performance & Security
- **Fast Processing**: 1-3 seconds per statement
- **File Validation**: PDF-only, 10MB max file size
- **Automatic Cleanup**: Uploaded files deleted after processing
- **No Data Storage**: Privacy-first approach
- **CORS Enabled**: Flexible API access

### Parsing Features
- **Multi-Pattern Matching**: Multiple regex patterns per data point
- **Fallback Support**: Handles various issuer formats
- **Smart Extraction**: Context-aware text parsing
- **Transaction Parsing**: Line-by-line analysis with deduplication

## Security Features

- File type validation (PDF only)
- File size limits (10MB max)
- Automatic cleanup of uploaded files
- No persistent storage of sensitive data

## Performance

- Fast PDF parsing (1-3 seconds per statement)
- Efficient batch processing
- Minimal memory footprint
- Automatic file cleanup

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- OCR support for scanned statements
- Machine learning for better accuracy
- Multi-language support
- Transaction categorization
- Spending analytics dashboard
- User authentication
- Cloud storage integration
- PDF preview functionality

## Troubleshooting

**Port already in use:**
```bash
kill -9 $(lsof -ti:5001)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend
```

**Dependencies issues:**
```bash
rm -rf node_modules client/node_modules
npm run install-all
```

## License

MIT License

## Author

Created for Sure Assignment - Credit Card Statement Parser

Demonstrates full-stack development with React, Node.js, and PDF processing capabilities.

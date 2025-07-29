# SnapCheck

An automated test paper checking system that processes multiple-choice answer sheets from images (JPEG/PNG) and PDF files. Uses computer vision and OCR to detect filled bubbles, extract student information, and provide detailed scoring with Excel export functionality.

## Features

- **Multi-format Support**: Upload JPEG, PNG, or PDF test papers
- **Automated Bubble Detection**: Computer vision-based OMR (Optical Mark Recognition)
- **OCR Text Extraction**: Extract student names and sections from handwritten text
- **Annotated Results**: View processed papers with highlighted correct/incorrect answers
- **PDF Generation**: Export results and answer sheets to PDF

## Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd SnapCheck
```

**2. Setup Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
The backend will start on `http://localhost:5000`

**3. Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm install react-router-dom
npm install jspdf jspdf-autotable
npm install tesseract.js
npm run dev
```
The frontend will start on `http://localhost:5173`

**4. Open your browser** and navigate to `http://localhost:5173`

## Usage

### 1. Create Answer Sheet
- Go to the "Generate" tab
- Configure your test parameters (number of items, choices, etc.)
- Generate and download the answer sheet template

### 2. Set Answer Key
- Go to the "Answer Key" tab
- Enter the correct answers for your test
- Save the answer key

### 3. Upload Test Papers
- Go to the "Upload" tab
- Upload completed test papers (JPEG, PNG, or PDF)
- Click "Scan & Check" to process them

### 4. View Results
- Go to the "Results" tab
- View individual scores and annotated results
- Export results to CSV file

## Technical Stack

### Backend
- **Flask**: Web framework
- **OpenCV**: Image processing and bubble detection
- **PyMuPDF**: PDF to image conversion
- **pytesseract**: OCR for text extraction
- **NumPy**: Numerical computations
- **Pillow**: Image manipulation
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **CSS Modules**: Styled components
- **jsPDF**: PDF generation
- **Tesseract.js**: Client-side OCR
- **React Router**: Navigation

## Project Structure

```
SnapCheck/
├── backend/
│   ├── app.py             # Main Flask application
│   ├── Dockerfile         # Docker configuration
│   ├── railway.json       # Railway deployment config
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── public/
│   │   └── snapcheck-favicon.svg  # App favicon
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── styles/        # CSS modules
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # App entry point
│   ├── eslint.config.js   # ESLint configuration
│   ├── index.html         # HTML template
│   ├── package.json       # Node.js dependencies
│   ├── requirements.txt   # Additional requirements
│   ├── vercel.json        # Vercel deployment config
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Deployment

### Frontend Deployment (Vercel)

The frontend is configured for deployment on Vercel with the included `vercel.json` configuration.

**Deploy via Vercel CLI:**
```bash
npm i -g vercel
cd frontend
vercel
```

**Or deploy via Vercel Dashboard:**
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Vercel will automatically detect it's a Vite project
4. Deploy

### Backend Deployment (Railway)

The backend is configured for deployment on Railway with the included `railway.json` and `Dockerfile`.

**Deploy to Railway:**
1. Connect your GitHub repository to Railway
2. Create a new project and select your repository
3. Set the root directory to `backend`
4. Railway will automatically detect the Dockerfile and deploy
5. The deployment configuration is handled by `railway.json`

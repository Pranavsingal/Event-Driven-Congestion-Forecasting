# Gridlock - Event-Driven Congestion Forecasting

Gridlock is an event-driven congestion forecasting and traffic management system. The platform integrates a Python-based machine learning prediction engine, an Express dispatch backend, and a real-time React analytics control center dashboard. 

It predicts urban traffic bottlenecks triggered by local events (e.g., stadium concerts, sports matches, or severe weather) and suggests proactive route diversions.

---

## 🏗️ Architecture Design

```text
traffic-congestion-management/
├── README.md                           # Main project documentation
│
├── ai-service/                         # Python AI Microservice (API Gateway & ML Models)
│   ├── app.py                         # FastAPI gateway exposing endpoints
│   ├── requirements.txt               # pandas, xgboost, scikit-learn, fastapi, uvicorn
│   ├── models/                        # Saved model binaries (.pkl)
│   ├── src/                           # Logic & Pipeline engines
│   │   ├── api/                       # API route definitions
│   │   ├── data/                      # Data load, clean & feature engineering pipeline
│   │   ├── eda/                       # Charts & Exploratory Data Analysis
│   │   ├── models/                    # Model definition & training preparation
│   │   └── planning/                  # Route planners, diversions & junction databases
│   └── main.py                        # Pipeline orchestrator
│
├── backend/                            # Node.js + Express Backend Server
│   ├── config/                        # Database configurations (MongoDB / Mongoose)
│   ├── controllers/                   # Incident & dispatch management logic
│   ├── models/                        # Mongoose schemas (Incident, DispatchOrder)
│   ├── routes/                        # API routes (/api/incidents, /api/dispatch)
│   ├── package.json
│   └── server.js                      # Express gateway entry point
│
└── frontend/                           # React.js SPA (Vite client)
    ├── package.json
    ├── public/                        # Public assets & icons
    └── src/
        ├── components/                # Modular UI components (MapView, SidebarFilters, MetricCards, etc.)
        ├── pages/                     # App tab views (Dashboard, History, ModelAnalytics)
        ├── App.jsx                    # Routing & Navigation container
        └── index.css                  # Custom design tokens, glassmorphic layout system & variables
```

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v18.0.0+)
* **Python** (v3.10+)
* **MongoDB** (optional; server falls back to memory arrays if no database connection exists)

---

### 2. Launch the AI microservice (`ai-service`)

The AI service handles data preparation, feature engineering, and model inference through a FastAPI gateway.

1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```
2. Set up and activate a Python virtual environment:
   ```bash
   # Create environment
   python -m venv .venv

   # Activate environment (Windows)
   .venv\Scripts\activate

   # Activate environment (macOS/Linux)
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the data preprocessing and engineering pipeline:
   ```bash
   python main.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

---

### 3. Launch the Backend Server (`backend`)

The Express backend coordinates traffic incident tickets, dispatches emergency units, and communicates with the AI gateway.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the node server:
   ```bash
   npm start
   ```

---

### 4. Launch the React Dashboard (`frontend`)

The dashboard features a glassmorphic layout with live interactive SVG district grids mapping out bottlenecks, real-time statistics, and model performance logs.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local link (usually `http://localhost:5173`) in your browser to view the operations panel.

---

## 🧠 ML Forecasting Engine

The platform utilizes four separate machine learning models trained on historical event data:
1. **Severity Classifier (XGBoost)**: Ranks predicted congestions into Low, Moderate, and Critical threat alerts.
2. **Duration Regressor (XGBoost)**: Evaluates the expected duration (in minutes) of road bottlenecks.
3. **Closure Classifier (Random Forest)**: Calculates the probability of a partial or complete road closure requirement.
4. **DL Duration Forecaster (PyTorch MLP)**: Deep learning model deployed in shadow mode evaluating sequential traffic inflows during peak hours.

### Key Predictors (Gini Feature Importance):
* Scheduled Event Trigger / Cause (e.g. Water Logging, Crash Accident, Concert, Derby Match)
* Target Junction and Affected Corridor
* Time-of-Day Traffic Volumes (Morning/Evening peak hour indicators)
* Geo-location Cluster Zones (KMeans k=10 coordinates)

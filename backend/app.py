import re
import nltk
import joblib
from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from typing import Optional, List
from mangum import Mangum
import os

# Download NLTK data
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from models import db, User, Feedback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from werkzeug.security import generate_password_hash, check_password_hash

# ---------------- FASTAPI APP ----------------
app = FastAPI(title="AI Feedback App API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE CONFIG ----------------
# Use environment variable for database URL in production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

@app.on_event("startup")
async def startup():
    # Create tables
    db.metadata.create_all(bind=engine)

@app.on_event("shutdown")
async def shutdown():
    db_session.remove()

# Dependency to get DB session
def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()

# ---------------- LOAD AI MODEL ----------------
# Load models with error handling
try:
    ml_model = joblib.load("sentiment_model.pkl")
    ml_vectorizer = joblib.load("vectorizer.pkl")
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")
    ml_model = None
    ml_vectorizer = None

# ---------------- TEXT CLEANING SETUP ----------------
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

def clean_text(text: str) -> str:
    """Clean and preprocess text for sentiment analysis"""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(words)

def preprocess_form(text: str) -> str:
    """Simple preprocessing for form data"""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text

# ---------------- PYDANTIC MODELS ----------------
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserSignin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class FeedbackCreate(BaseModel):
    user_id: int
    rating: int
    comment: str

class FeedbackResponse(BaseModel):
    message: str
    sentiment: Optional[str] = None

# ---------------- API ROUTES ----------------
@app.get("/")
async def home():
    """Root endpoint to check if API is running"""
    return {"message": "Backend Running Successfully", "status": "active"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint for Vercel"""
    return {"status": "healthy", "models_loaded": ml_model is not None}

# 1️⃣ SIGNUP
@app.post("/signup", response_model=dict)
async def signup(user_data: UserSignup):
    """Register a new user"""
    # Check if user exists
    existing_user = User.query.filter_by(email=user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    hashed_password = generate_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return {"message": "User Registered Successfully"}

# 2️⃣ SIGNIN
@app.post("/signin")
async def signin(user_data: UserSignin):
    """Authenticate user"""
    user = User.query.filter_by(email=user_data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not check_password_hash(user.password, user_data.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return {
        "message": "Login successful",
        "user_id": user.id,
        "user_name": user.name
    }

# 3️⃣ FEEDBACK
@app.post("/feedback", response_model=FeedbackResponse)
async def create_feedback(feedback_data: FeedbackCreate):
    """Submit feedback with sentiment analysis"""
    if ml_model is None or ml_vectorizer is None:
        raise HTTPException(status_code=500, detail="Sentiment model not loaded")
    
    # Clean and analyze sentiment
    cleaned = clean_text(feedback_data.comment)
    transformed = ml_vectorizer.transform([cleaned])
    sentiment = ml_model.predict(transformed)[0]
    
    # Save feedback
    new_feedback = Feedback(
        user_id=feedback_data.user_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
        sentiment=sentiment
    )
    
    db.session.add(new_feedback)
    db.session.commit()
    
    return {
        "message": "Feedback submitted successfully",
        "sentiment": sentiment
    }

# 4️⃣ ADMIN LOGIN
@app.post("/admin/login")
async def admin_login(admin_data: AdminLogin):
    """Admin authentication"""
    # In production, use environment variables for credentials
    if admin_data.username == "admin" and admin_data.password == "admin123":
        return {"message": "Admin login successful", "is_admin": True}
    else:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

# 5️⃣ ADMIN DASHBOARD
@app.get("/admin/dashboard")
async def admin_dashboard():
    """Get admin dashboard data with statistics"""
    feedbacks = Feedback.query.all()
    
    total = len(feedbacks)
    positive = len([f for f in feedbacks if f.sentiment == "positive"])
    negative = len([f for f in feedbacks if f.sentiment == "negative"])
    neutral = len([f for f in feedbacks if f.sentiment == "neutral"])
    
    reviews = [{
        "user_id": f.user_id,
        "rating": f.rating,
        "comment": f.comment,
        "sentiment": f.sentiment,
        "created_at": f.created_at.isoformat() if hasattr(f, 'created_at') else None
    } for f in feedbacks]
    
    return {
        "total_feedback": total,
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "reviews": reviews
    }

# 6️⃣ EMOTION PREDICTION (Form-based)
@app.post("/predict")
async def predict_emotion(feedback: str = Form(...)):
    """Predict emotion from feedback text"""
    if ml_model is None or ml_vectorizer is None:
        raise HTTPException(status_code=500, detail="Sentiment model not loaded")
    
    processed = preprocess_form(feedback)
    features = ml_vectorizer.transform([processed])
    prediction = ml_model.predict(features)[0]
    
    return {
        "feedback": feedback,
        "predicted_emotion": prediction
    }

# Vercel serverless handler
handler = Mangum(app)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

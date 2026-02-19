import re
import nltk
import joblib
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Feedback
import pickle

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE CONFIG ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

# ---------------- LOAD AI MODEL ----------------
ml_model = joblib.load(open("sentiment_model.pkl", "rb"))
ml_vectorizer = joblib.load(open("vectorizer.pkl", "rb"))

def preprocess_form(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text
# ---------------- TEXT CLEANING SETUP ----------------
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(words)

# ---------------- HOME ----------------
@app.route("/")
def home():
    return {"message": "Backend Running Successfully"}

# ==================================================
# 1️⃣ SIGNUP
# ==================================================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(data["password"])

    new_user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User Registered Successfully"}), 201


# ==================================================
# 2️⃣ SIGNIN
# ==================================================
@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user.id
    })


# ==================================================
# 3️⃣ FEEDBACK
# ==================================================
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()

    cleaned = clean_text(data["comment"])
    transformed = ml_vectorizer.transform([cleaned])
    sentiment = ml_model.predict(transformed)[0]

    new_feedback = Feedback(
        user_id=data["user_id"],
        rating=data["rating"],
        comment=data["comment"],
        sentiment=sentiment
    )

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({
        "message": "Feedback submitted successfully",
        "sentiment": sentiment
    })

# ==================================================
# 4️⃣ ADMIN LOGIN (Static)
# ==================================================
@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    if data["username"] == "admin" and data["password"] == "admin123":
        return jsonify({"message": "Admin login successful"})
    else:
        return jsonify({"message": "Invalid admin credentials"}), 401


# ==================================================
# 5️⃣ ADMIN DASHBOARD
# ==================================================
@app.route("/admin/dashboard", methods=["GET"])
def admin_dashboard():
    feedbacks = Feedback.query.all()

    total = len(feedbacks)
    positive = len([f for f in feedbacks if f.sentiment == "positive"])
    negative = len([f for f in feedbacks if f.sentiment == "negative"])
    neutral = len([f for f in feedbacks if f.sentiment == "neutral"])

    data = [{
        "user_id": f.user_id,
        "rating": f.rating,
        "comment": f.comment,
        "sentiment": f.sentiment
    } for f in feedbacks]

    return jsonify({
        "total_feedback": total,
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "reviews": data
    })
# ==================================================
# 6️⃣ EMOTION PREDICTION FORM
# ==================================================
@app.route("/mlform")
def ml_form():
    return render_template("index.html")


@app.route('/predict', methods=['POST'])
def predict():
    feedback = request.form.get('feedback')
    processed = preprocess_form(feedback)
    features = ml_vectorizer.transform([processed])
    prediction = ml_model.predict(features)[0]
    return jsonify({"feedback": feedback, "predicted_emotion": prediction})


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)




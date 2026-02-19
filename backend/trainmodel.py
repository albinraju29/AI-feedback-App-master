import pandas as pd
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Download required nltk data (run once)
nltk.download('stopwords')
nltk.download('wordnet')

# ---------------- LOAD DATASET ----------------
df = pd.read_csv("EmotionDetection.csv")

df = df[["text", "Emotion"]].dropna()

# ---------------- TEXT CLEANING FUNCTION ----------------
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

def clean_text(text):
    text = text.lower()  # lowercase
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # remove special chars & numbers
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(words)

# Apply cleaning
df["cleaned_text"] = df["text"].apply(clean_text)

# ---------------- SPLIT DATA ----------------
X_train, X_test, y_train, y_test = train_test_split(
    df["cleaned_text"],
    df["Emotion"],
    test_size=0.2,
    random_state=42
)

# ---------------- VECTORIZE ----------------
vectorizer = TfidfVectorizer(max_features=5000)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# ---------------- TRAIN MODEL ----------------
model = LogisticRegression(max_iter=2000)
model.fit(X_train_vec, y_train)

# ---------------- EVALUATE ----------------
y_pred = model.predict(X_test_vec)
print("\nModel Evaluation:\n")
print(classification_report(y_test, y_pred))

# ---------------- SAVE MODEL ----------------
pickle.dump(model, open("sentiment_model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("\n✅ Model trained with cleaning and saved successfully!")

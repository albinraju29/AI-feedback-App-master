import requests

url = "http://127.0.0.1:5000/predict"

test_feedbacks = [
    "I am so happy with this app!",
    "I feel frustrated and angry.",
    "This is okay, nothing special.",
    "Wow! I am surprised by this.",
    "I feel very sad today."
]

for feedback in test_feedbacks:
    data = {"feedback": feedback}
    response = requests.post(url, json=data)
    print(f"Feedback: {feedback}")
    print(f"Predicted Emotion: {response.json()}\n")

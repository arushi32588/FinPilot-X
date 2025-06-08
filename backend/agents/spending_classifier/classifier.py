import pandas as pd
import string
import joblib
import os

class SpendingClassifier:
    def __init__(self, model_path='backend/agents/spending_classifier/model.pkl', 
                 vec_path='backend/agents/spending_classifier/vectorizer.pkl'):
        # Load model and vectorizer
        self.clf = joblib.load(model_path)
        self.vectorizer = joblib.load(vec_path)

    def preprocess(self, text):
        text = str(text).lower()
        text = text.translate(str.maketrans(string.punctuation, ' '*len(string.punctuation)))  # replace punctuation with space
        text = text.strip()
        return text

    def predict(self, text):
        # Preprocess the input text
        processed_text = self.preprocess(text)
        
        # Vectorize the processed text
        X = self.vectorizer.transform([processed_text])
        
        # Make prediction
        prediction = self.clf.predict(X)[0]
        return prediction

# Test the classifier if this file is run directly
if __name__ == "__main__":
    classifier = SpendingClassifier()
    
    # Your test samples CSV
    df_test = pd.read_csv('backend/agents/spending_classifier/test_samples.csv')
    
    # Show results
    correct = 0
    for i, row in df_test.iterrows():
        prediction = classifier.predict(row['description'])
        print(f"Input: {row['description']} | Predicted: {prediction} | Expected: {row['expected_category']}")
        if prediction.lower() == row['expected_category'].lower():
            correct += 1

    print(f"Accuracy: {correct}/{len(df_test)} = {correct/len(df_test):.2f}")

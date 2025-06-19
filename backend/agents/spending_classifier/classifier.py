import pandas as pd
import string
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class SpendingClassifier:
    def __init__(self, model_path='backend/agents/spending_classifier/model.pkl', 
                 vec_path='backend/agents/spending_classifier/vectorizer.pkl'):
        logger.debug(f"Loading model from {model_path}")
        logger.debug(f"Loading vectorizer from {vec_path}")
        # Load model and vectorizer
        self.clf = joblib.load(model_path)
        self.vectorizer = joblib.load(vec_path)
        logger.debug("Model and vectorizer loaded successfully")
        
        # Category mapping
        self.category_map = {
            'Groceries': 'Food',
            'Food': 'Food',
            'Transportation': 'Transportation',
            'Housing and Utilities': 'Household',
            'Subscriptions': 'subscription',
            'Medical/Dental': 'Health',
            'Shopping': 'Shopping',
            'Travel': 'Travel',
            'Fitness': 'Health',
            'Personal Hygiene': 'Health',
            'Gifts': 'Gift',
            'Friend Activities': 'Social Life',
            'Hobbies': 'Hobbies',
            'Education': 'Education',
            'Entertainment': 'Entertainment'
        }

    def preprocess(self, text):
        logger.debug(f"Preprocessing text: {text}")
        text = str(text).lower()
        text = text.translate(str.maketrans(string.punctuation, ' '*len(string.punctuation)))  # replace punctuation with space
        text = text.strip()
        logger.debug(f"Preprocessed text: {text}")
        return text

    def predict(self, text):
        try:
            # Preprocess the input text
            processed_text = self.preprocess(text)
            logger.debug(f"Processed text: {processed_text}")
            
            # Vectorize the processed text
            X = self.vectorizer.transform([processed_text])
            logger.debug(f"Vectorized shape: {X.shape}")
            
            # Make prediction
            raw_prediction = self.clf.predict(X)[0]
            logger.debug(f"Raw prediction: {raw_prediction}")
            
            # Map to our categories
            prediction = self.category_map.get(raw_prediction, raw_prediction)
            logger.debug(f"Mapped prediction: {prediction}")
            
            return prediction
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}", exc_info=True)
            raise

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

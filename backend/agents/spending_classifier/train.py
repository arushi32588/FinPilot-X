import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
import string

# Load existing transactions
df1 = pd.read_csv('backend/agents/spending_classifier/transactions.csv')
df1['description'] = (df1['Subcategory'].fillna('') + ' ' + df1['Note'].fillna('')).str.lower()
df1['description'] = df1['description'].str.replace(f"[{string.punctuation}]", " ", regex=True)
df1['description'] = df1['description'].str.strip()
df1 = df1[['description', 'Category']]
df1 = df1[df1['description'] != '']
df1 = df1[df1['Category'] != '']

# Load new Kaggle dataset
df2 = pd.read_csv('backend/agents/spending_classifier/spending_habits.csv')
df2['description'] = (
    df2['Item'].fillna('') + ' ' +
    df2['Category'].fillna('') + ' ' +
    df2['Location'].fillna('')
).str.lower()
df2['description'] = df2['description'].str.replace(f"[{string.punctuation}]", " ", regex=True)
df2['description'] = df2['description'].str.strip()
df2 = df2[['description', 'Category']]
df2 = df2[df2['description'] != '']
df2 = df2[df2['Category'] != '']

# Load additional fine-tuning rows
df3 = pd.read_csv('backend/agents/spending_classifier/finetune_append.csv')
df3['description'] = df3['description'].str.lower().str.replace(f"[{string.punctuation}]", " ", regex=True).str.strip()
df3 = df3[df3['description'] != '']
df3 = df3[df3['Category'] != '']

# Combine both datasets
df = pd.concat([df1, df2, df3], ignore_index=True)
print("Combined dataset size:", df.shape)

# Vectorizer with bigrams and more features
vectorizer = TfidfVectorizer(stop_words='english', max_features=3000, ngram_range=(1, 2))

X = vectorizer.fit_transform(df['description'])
y = df['Category']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use Logistic Regression for better accuracy
clf = LogisticRegression(max_iter=500, class_weight='balanced')
clf.fit(X_train, y_train)

print(f"Train accuracy: {clf.score(X_train, y_train):.3f}")
print(f"Test accuracy: {clf.score(X_test, y_test):.3f}")

# Save model and vectorizer
joblib.dump(clf, 'backend/agents/spending_classifier/model.pkl')
joblib.dump(vectorizer, 'backend/agents/spending_classifier/vectorizer.pkl')

print("Categories trained on:")
print(clf.classes_)

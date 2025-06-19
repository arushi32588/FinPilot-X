import csv
import json
from pathlib import Path
from typing import Dict, List
import os

class IncomeAnalyzer:
    def __init__(self):
        print("\nInitializing IncomeAnalyzer")
        self.categories = self._load_categories()
        print(f"Loaded categories: {self.categories}")
        
    def _load_categories(self) -> Dict:
        """Load category keywords from JSON file"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        categories_path = os.path.join(current_dir, 'categories.json')
        print(f"Loading categories from: {categories_path}")
        with open(categories_path) as f:
            return json.load(f)
    
    def analyze(self, filepath: str) -> Dict:
        """Main analysis pipeline"""
        print(f"\nAnalyzing file: {filepath}")
        transactions = self._read_csv(filepath)
        print(f"Read {len(transactions)} transactions")
        print(f"First transaction: {transactions[0] if transactions else 'No transactions'}")
        
        credits = [t for t in transactions if t['Type'].lower() == 'credit']
        print(f"Found {len(credits)} credit transactions")
        
        # Initialize result structure
        result = {
            'totalIncome': 0,
            'averageIncome': 0,
            'transactionCount': len(credits),
            'incomeByType': [],
            'transactions': []
        }
        
        # Process transactions
        for t in credits:
            try:
                amount = float(t['Amount'])
                category = self._classify(t)
                print(f"Transaction: {t['Description']} - Amount: {amount}, Category: {category}")
                
                # Add to total income
                result['totalIncome'] += amount
                
                # Add to transactions list
                result['transactions'].append({
                    'date': t['Date'],
                    'amount': amount,
                    'type': t['Type'],
                    'description': t['Description'],
                    'account': t.get('Account', '')
                })
                
                # Update income by type
                found = False
                for item in result['incomeByType']:
                    if item['type'] == category:
                        item['amount'] += amount
                        found = True
                        break
                
                if not found:
                    result['incomeByType'].append({
                        'type': category,
                        'amount': amount,
                        'percentage': 0  # Will calculate after
                    })
                    
            except Exception as e:
                print(f"Error processing transaction {t}: {str(e)}")
                continue
        
        # Calculate percentages and average
        if result['totalIncome'] > 0:
            result['averageIncome'] = result['totalIncome'] / result['transactionCount']
            for item in result['incomeByType']:
                item['percentage'] = (item['amount'] / result['totalIncome']) * 100
        
        # Sort income by type by amount
        result['incomeByType'].sort(key=lambda x: x['amount'], reverse=True)
        
        print(f"\nAnalysis result: {result}")
        return result
    
    def _read_csv(self, filepath: str) -> List[Dict]:
        """Robust CSV reader"""
        print(f"\nReading CSV file: {filepath}")
        try:
            with open(filepath, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                transactions = list(reader)
                print(f"CSV headers: {reader.fieldnames}")
                return transactions
        except Exception as e:
            print(f"Error reading CSV: {str(e)}")
            raise ValueError(f"Error reading CSV file: {str(e)}")
    
    def _classify(self, transaction: Dict) -> str:
        """Priority: 1. Existing Category 2. Description Keywords"""
        try:
            desc = transaction.get('Description', '').lower()
            print(f"\nClassifying transaction: {desc}")
            
            if 'Category' in transaction and transaction['Category'].lower() in self.categories:
                category = transaction['Category'].lower()
                print(f"Using existing category: {category}")
                return category
            
            for category, keywords in self.categories.items():
                if any(kw in desc for kw in keywords):
                    print(f"Matched category {category} using keywords")
                    return category
                    
            print("No category match found, using 'other'")
            return 'other'
        except Exception as e:
            print(f"Error in classification: {str(e)}")
            return 'other'
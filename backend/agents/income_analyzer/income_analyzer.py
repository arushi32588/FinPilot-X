import csv
import json
from pathlib import Path
from typing import Dict, List

class IncomeAnalyzer:
    def __init__(self):
        self.categories = self._load_categories()
        
    def _load_categories(self) -> Dict:
        """Load category keywords from JSON file"""
        with open(Path(__file__).parent / 'categories.json') as f:
            return json.load(f)
    
    def analyze(self, filepath: str) -> Dict:
        """Main analysis pipeline"""
        transactions = self._read_csv(filepath)
        credits = [t for t in transactions if t['Type'].lower() == 'credit']
        
        result = {
            'monthly_total': 0,
            'sources': {},
            'uncategorized': 0,
            'currency': 'INR'  
        }
        
        for t in credits:
            amount = float(t['Amount'])
            category = self._classify(t)
            
            result['monthly_total'] += amount
            if category == 'other':
                result['uncategorized'] += amount
            else:
                result['sources'][category] = result['sources'].get(category, 0) + amount
        
        result['sources'] = dict(sorted(
            result['sources'].items(),
            key=lambda x: x[1],
            reverse=True
        ))
        return result
    
    def _read_csv(self, filepath: str) -> List[Dict]:
        """Robust CSV reader"""
        with open(filepath, mode='r', encoding='utf-8-sig') as f:
            return list(csv.DictReader(f))
    
    def _classify(self, transaction: Dict) -> str:
        """Priority: 1. Existing Category 2. Description Keywords"""
        desc = transaction['Description'].lower()
        
        if 'Category' in transaction and transaction['Category'].lower() in self.categories:
            return transaction['Category'].lower()
        
        for category, keywords in self.categories.items():
            if any(kw in desc for kw in keywords):
                return category
                
        return 'other'
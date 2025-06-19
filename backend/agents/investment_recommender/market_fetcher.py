# /backend/investment_agent/market_fetcher.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
from typing import Dict, List, Optional, Tuple
import json
import requests
import yfinance as yf
import time
from functools import lru_cache
import concurrent.futures
from threading import Lock
import mmap
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Disable debug logging for external libraries
logging.getLogger('urllib3').setLevel(logging.WARNING)
logging.getLogger('yfinance').setLevel(logging.WARNING)
logging.getLogger('peewee').setLevel(logging.WARNING)

# Add a custom formatter for recommendation data
class RecommendationFormatter(logging.Formatter):
    def format(self, record):
        if hasattr(record, 'recommendation_data'):
            return f"\nRecommendation Data:\n{record.recommendation_data}"
        return super().format(record)

# Create a handler for recommendation data
recommendation_handler = logging.StreamHandler()
recommendation_handler.setFormatter(RecommendationFormatter())
recommendation_handler.setLevel(logging.INFO)
logger.addHandler(recommendation_handler)

def log_recommendation_data(data_type: str, data: Dict):
    """
    Log recommendation data in a structured format
    """
    try:
        if not data:
            return

        if data_type == "mutual_funds":
            formatted_data = "\nMutual Funds Data:\n"
            for name, fund in data.items():
                formatted_data += f"\n{name}:\n"
                formatted_data += f"  NAV: {fund.get('nav', 'N/A')}\n"
                formatted_data += f"  1Y Returns: {fund.get('returns_1yr', 'N/A')}%\n"
                formatted_data += f"  Risk: {fund.get('risk', 'N/A')}%\n"
                formatted_data += f"  Source: {fund.get('source', 'N/A')}\n"
                formatted_data += f"  Data Sources: {', '.join(fund.get('data_sources', []))}\n"
        elif data_type == "stocks":
            formatted_data = "\nStocks Data:\n"
            for symbol, stock in data.items():
                formatted_data += f"\n{symbol}:\n"
                formatted_data += f"  Price: {stock.get('price', 'N/A')}\n"
                formatted_data += f"  1Y Returns: {stock.get('returns_1yr', 'N/A')}%\n"
                formatted_data += f"  Risk: {stock.get('risk', 'N/A')}%\n"
                formatted_data += f"  Market Cap: {stock.get('market_cap', 'N/A')}\n"
                formatted_data += f"  Source: {stock.get('source', 'N/A')}\n"
                formatted_data += f"  Data Sources: {', '.join(stock.get('data_sources', []))}\n"
        elif data_type == "fixed_deposits":
            formatted_data = "\nFixed Deposits Data:\n"
            for name, fd in data.items():
                formatted_data += f"\n{name}:\n"
                formatted_data += f"  Rate: {fd.get('rate', 'N/A')}%\n"
                formatted_data += f"  Duration: {fd.get('duration_months', 'N/A')} months\n"
                formatted_data += f"  Min Amount: {fd.get('min_amount', 'N/A')}\n"
                formatted_data += f"  Source: {fd.get('source', 'N/A')}\n"
        else:
            return

        # Log the formatted data
        logger.info("", extra={'recommendation_data': formatted_data})
    except Exception as e:
        logger.error(f"Error formatting recommendation data: {str(e)}")

# Dataset paths
DATASET_DIR = os.path.join(os.path.dirname(__file__), "datasets")
MUTUAL_FUND_DATASET = os.path.join(DATASET_DIR, "mutual_funds.csv")
STOCK_DATASET = os.path.join(DATASET_DIR, "stocks.csv")
FD_DATASET = os.path.join(DATASET_DIR, "fixed_deposits.csv")

# Cache for Yahoo Finance data
YF_CACHE = {}
YF_CACHE_TIMEOUT = 3600  # 1 hour

# Optimized cache configuration
NAV_CACHE = {}
NAV_CACHE_LOCK = Lock()
NAV_CACHE_TIMEOUT = 3600  # 1 hour
CHUNK_SIZE = 10000  # Increased chunk size for faster processing
MAX_WORKERS = 8  # Number of parallel workers

# Pre-compiled regex patterns
NAV_PATTERN = re.compile(r'^[^;]*;[^;]*;[^;]*;[^;]*;([^;]*);')
HEADER_PATTERN = re.compile(r'^(Scheme Code|Open Ended)')

# Cache configuration
NAV_WINDOWS = {
    'weekly_drift': 14,  # 14 days for weekly drift alerts
    'recommendation': 365,  # 1 year for fund recommendations
    'risk_scoring': 1095,  # 3 years for risk scoring
    'trend_nudges': 30  # 30 days for trend-based nudges
}

# Add stock symbol mapping
INDIAN_STOCK_SYMBOLS = {
    'RELIANCE': 'RELIANCE.NS',  # NSE symbol
    'TCS': 'TCS.NS',  # NSE symbol
    'HDFCBANK': 'HDFCBANK.NS',
    'INFY': 'INFY.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'SBIN': 'SBIN.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'ASIANPAINT': 'ASIANPAINT.NS'
}

# Add category mapping
FUND_CATEGORY_MAPPING = {
    'Wealth Growth': ['Equity Scheme - Multi Cap Fund', 'Equity Scheme - Large Cap Fund', 'Equity Scheme - Mid Cap Fund'],
    'Retirement': ['Equity Scheme - Multi Cap Fund', 'Equity Scheme - Large Cap Fund', 'Hybrid Scheme - Balanced Fund'],
    'Education': ['Equity Scheme - Multi Cap Fund', 'Hybrid Scheme - Balanced Fund', 'Hybrid Scheme - Conservative Fund'],
    'Tax Saving': ['Equity Scheme - ELSS'],
    'Regular Income': ['Hybrid Scheme - Conservative Fund', 'Debt Scheme - Banking and PSU Fund', 'Debt Scheme - Corporate Bond Fund'],
    'Emergency Fund': ['Debt Scheme - Money Market Fund', 'Debt Scheme - Banking and PSU Fund'],
    'Short Term': ['Debt Scheme - Money Market Fund', 'Debt Scheme - Banking and PSU Fund'],
    'Long Term': ['Equity Scheme - Multi Cap Fund', 'Equity Scheme - Large Cap Fund', 'Hybrid Scheme - Balanced Fund']
}

@lru_cache(maxsize=1000)
def get_yfinance_data(symbol: str, period: str = "1y") -> Optional[pd.DataFrame]:
    """
    Get Yahoo Finance data with improved error handling and retries
    """
    try:
        if not symbol:
            logger.warning("Empty symbol provided to get_yfinance_data")
            return None
            
        # First check cache
        cache_key = f"{symbol}_{period}"
        if cache_key in YF_CACHE:
            cache_time, data = YF_CACHE[cache_key]
            if time.time() - cache_time < YF_CACHE_TIMEOUT:
                return data

        # If not in cache, try to get from Yahoo Finance
        stock = yf.Ticker(symbol)
        
        # Add exponential backoff for rate limits
        max_retries = 5
        base_delay = 30  # Start with 30 seconds delay
        
        for attempt in range(max_retries):
            try:
                # Try different periods if 1y fails
                periods = [period, "6mo", "3mo", "1mo"]
                for p in periods:
                    try:
                        hist = stock.history(period=p)
                        if not hist.empty:
                            YF_CACHE[cache_key] = (time.time(), hist)
                            return hist
                    except Exception:
                        continue
                break
            except Exception as e:
                if "429" in str(e) or "Too Many Requests" in str(e):
                    if attempt < max_retries - 1:
                        sleep_time = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited by Yahoo Finance, waiting {sleep_time}s")
                        time.sleep(sleep_time)
                    continue
                else:
                    logger.error(f"Error fetching Yahoo Finance data: {str(e)}")
                    break
    except Exception as e:
        logger.error(f"Error in get_yfinance_data: {str(e)}")
    
    return None

def get_latest_nav_file() -> Optional[str]:
    """Get the path to the most recent NAV file."""
    try:
        # Get current year and month
        now = datetime.now()
        year = str(now.year)
        month = str(now.month).zfill(2)
        
        # Try current month
        nav_dir = os.path.join(os.path.dirname(__file__), 'datasets', 'mf-data', year, month)
        if os.path.exists(nav_dir):
            # Get the latest file in the directory
            files = [f for f in os.listdir(nav_dir) if f.endswith('.csv')]
            if files:
                latest_file = max(files)
                return os.path.join(nav_dir, latest_file)
        
        # If current month not found, try previous month
        prev_month = str(now.month - 1).zfill(2) if now.month > 1 else '12'
        prev_year = str(now.year - 1) if now.month == 1 else year
        nav_dir = os.path.join(os.path.dirname(__file__), 'datasets', 'mf-data', prev_year, prev_month)
        if os.path.exists(nav_dir):
            files = [f for f in os.listdir(nav_dir) if f.endswith('.csv')]
            if files:
                latest_file = max(files)
                return os.path.join(nav_dir, latest_file)
        
        # If still not found, try any available year/month
        base_dir = os.path.join(os.path.dirname(__file__), 'datasets', 'mf-data')
        if os.path.exists(base_dir):
            years = sorted([d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))], reverse=True)
            for year in years:
                year_dir = os.path.join(base_dir, year)
                months = sorted([d for d in os.listdir(year_dir) if os.path.isdir(os.path.join(year_dir, d))], reverse=True)
                for month in months:
                    month_dir = os.path.join(year_dir, month)
                    files = [f for f in os.listdir(month_dir) if f.endswith('.csv')]
                    if files:
                        latest_file = max(files)
                        return os.path.join(month_dir, latest_file)
        
        logging.error("No NAV files found in any directory")
        return None
        
    except Exception as e:
        logging.error(f"Error getting latest NAV file: {str(e)}")
        return None

def get_historical_nav_data(scheme_code: str, months: int = 12) -> List[float]:
    """
    Get historical NAV data for a fund
    """
    try:
        nav_data = []
        now = datetime.now()
        
        # Get data for the specified number of months
        for i in range(months):
            # Calculate year and month
            month = now.month - i
            year = now.year
            while month <= 0:
                month += 12
                year -= 1
                
            month_str = str(month).zfill(2)
            year_str = str(year)
            
            # Get the NAV file for this month
            nav_dir = os.path.join('backend', 'agents', 'investment_recommender', 'datasets', 'mf-data', year_str, month_str)
            if not os.path.exists(nav_dir):
                continue
                
            # Get the latest file in the directory
            files = [f for f in os.listdir(nav_dir) if f.endswith('.csv')]
            if not files:
                continue
                
            latest_file = max(files)
            nav_file = os.path.join(nav_dir, latest_file)
            
            # Read NAV data
            with open(nav_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if ';' in line:
                        parts = line.split(';')
                        if len(parts) >= 5 and parts[0].strip() == scheme_code:
                            try:
                                nav = float(parts[4].strip())
                                nav_data.append(nav)
                                break
                            except (ValueError, IndexError):
                                continue
        
        return nav_data
    except Exception as e:
        logger.error(f"Error getting historical NAV data: {str(e)}")
        return []

def calculate_fund_metrics(scheme_code: str) -> Tuple[float, float]:
    """
    Calculate returns and risk metrics for a fund
    """
    try:
        # Get historical NAV data
        nav_data = get_historical_nav_data(scheme_code)
        if not nav_data or len(nav_data) < 2:
            # Use fallback values if no historical data
            return 12.0, 15.0
            
        # Calculate returns
        returns = []
        for i in range(1, len(nav_data)):
            prev_nav = nav_data[i-1]
            curr_nav = nav_data[i]
            if prev_nav > 0:
                ret = (curr_nav - prev_nav) / prev_nav
                returns.append(ret)
        
        if not returns:
            # Use fallback values if no valid returns
            return 12.0, 15.0
            
        # Calculate mean return and standard deviation
        mean_return = sum(returns) / len(returns)
        std_dev = (sum((r - mean_return) ** 2 for r in returns) / len(returns)) ** 0.5
        
        # Annualize returns and risk
        annual_return = (1 + mean_return) ** 52 - 1  # Assuming weekly data
        annual_risk = std_dev * (52 ** 0.5)  # Annualize standard deviation
        
        # Convert to percentages
        annual_return = annual_return * 100
        annual_risk = annual_risk * 100
        
        return annual_return, annual_risk
    except Exception as e:
        logger.error(f"Error calculating fund metrics: {str(e)}")
        # Use fallback values on error
        return 12.0, 15.0

def get_mutual_fund_data():
    """
    Returns a dictionary of mutual fund data from Kaggle dataset
    """
    try:
        # Read mutual fund dataset
        df = pd.read_csv(MUTUAL_FUND_DATASET)
        funds_data = {}

        # Process each fund
        for _, row in df.iterrows():
            try:
                scheme_code = str(row['scheme_code'])
                funds_data[scheme_code] = {
                    "name": row['scheme_name'],
                    "category": row['category'],
                    "nav_history": [
                        {
                            "date": row['date'],
                            "nav": float(row['nav'])
                        }
                    ],
                    "returns": float(row['returns_1yr']),
                    "risk": float(row['risk']),
                    "min_investment": float(row['min_investment']),
                    "expense_ratio": float(row['expense_ratio'])
                }
            except (ValueError, KeyError) as e:
                logger.warning(f"Error processing fund {row.get('scheme_name')}: {str(e)}")
                continue

        return funds_data

    except Exception as e:
        logger.error(f"Error reading mutual fund dataset: {str(e)}")
        return {}

def get_stock_data():
    """
    Returns a dictionary of stock data from Kaggle dataset
    """
    try:
        # Read stock dataset
        df = pd.read_csv(STOCK_DATASET)
        stocks_data = {}

        # Process each stock
        for _, row in df.iterrows():
            try:
                symbol = f"{row['symbol']}.NS"
                stocks_data[symbol] = {
                    "name": row['company_name'],
                    "sector": row['sector'],
                    "price_history": [
                        {
                            "date": row['date'],
                            "close": float(row['close'])
                        }
                    ],
                    "returns": float(row['returns_1yr']),
                    "risk": float(row['volatility']),
                    "market_cap": float(row['market_cap']),
                    "pe_ratio": float(row['pe_ratio'])
                }
            except (ValueError, KeyError) as e:
                logger.warning(f"Error processing stock {row.get('symbol')}: {str(e)}")
                continue

        return stocks_data

    except Exception as e:
        logger.error(f"Error reading stock dataset: {str(e)}")
        return {}

def get_fd_data():
    """
    Returns a dictionary of fixed deposit data from Kaggle dataset
    """
    try:
        # Read FD dataset
        df = pd.read_csv(FD_DATASET)
        fd_data = {}

        # Process each bank's FD
        for _, row in df.iterrows():
            try:
                bank_name = row['bank_name']
                fd_data[f"{bank_name} FD"] = {
                    "rate": float(row['rate']),
                    "duration_months": int(row['duration_months']),
                    "min_amount": float(row['min_amount']),
                    "max_amount": float(row['max_amount']),
                    "historical_rates": [
                        {
                            "date": row['date'],
                            "rate": float(row['rate'])
                        }
                    ]
                }
            except (ValueError, KeyError) as e:
                logger.warning(f"Error processing FD for {row.get('bank_name')}: {str(e)}")
                continue

        return fd_data

    except Exception as e:
        logger.error(f"Error reading FD dataset: {str(e)}")
        return {}

def get_fund_categories(goal: str) -> List[str]:
    """
    Map investment goals to fund categories
    """
    goal = goal.lower()
    if "short term" in goal or "emergency" in goal:
        debt_categories = [
            "Debt Scheme - Banking and PSU Fund",
            "Debt Scheme - Corporate Bond Fund",
            "Debt Scheme - Credit Risk Fund",
            "Debt Scheme - Dynamic Bond Fund",
            "Debt Scheme - Gilt Fund",
            "Debt Scheme - Money Market Fund",
            "Debt Scheme - Ultra Short Duration Fund",
            "Debt Scheme - Low Duration Fund",
            "Debt Scheme - Short Duration Fund"
        ]
        logger.info(f"Returning debt categories for short term goal: {debt_categories}")
        return debt_categories
    elif "balanced" in goal or "moderate" in goal or "medium term" in goal:
        hybrid_categories = [
            "Hybrid Scheme - Balanced Advantage Fund",
            "Hybrid Scheme - Multi Asset Allocation Fund",
            "Hybrid Scheme - Dynamic Asset Allocation Fund",
            "Hybrid Scheme - Balanced Fund",
            "Hybrid Scheme - Conservative Hybrid Fund",
            "Hybrid Scheme - Equity Savings Fund",
            "Hybrid Scheme - Arbitrage Fund",
            "Hybrid Scheme - Equity Oriented Fund"
        ]
        logger.info(f"Returning hybrid categories for medium term goal: {hybrid_categories}")
        return hybrid_categories
    elif "wealth" in goal or "growth" in goal or "long term" in goal:
        equity_categories = [
            "Equity Scheme - Multi Cap Fund",
            "Equity Scheme - Large Cap Fund",
            "Equity Scheme - Mid Cap Fund",
            "Equity Scheme - Small Cap Fund",
            "Equity Scheme - Flexi Cap Fund",
            "Equity Scheme - Value Fund",
            "Equity Scheme - Contra Fund",
            "Equity Scheme - Focused Fund"
        ]
        logger.info(f"Returning equity categories for long term goal: {equity_categories}")
        return equity_categories
    elif "income" in goal or "regular" in goal:
        income_categories = [
            "Debt Scheme - Banking and PSU Fund",
            "Debt Scheme - Corporate Bond Fund",
            "Debt Scheme - Credit Risk Fund",
            "Debt Scheme - Dynamic Bond Fund",
            "Debt Scheme - Gilt Fund",
            "Hybrid Scheme - Conservative Hybrid Fund",
            "Hybrid Scheme - Equity Savings Fund"
        ]
        logger.info(f"Returning income categories for regular income goal: {income_categories}")
        return income_categories
    else:
        # Default to balanced categories for medium-term goals
        default_categories = [
            "Hybrid Scheme - Balanced Advantage Fund",
            "Hybrid Scheme - Multi Asset Allocation Fund",
            "Hybrid Scheme - Dynamic Asset Allocation Fund",
            "Hybrid Scheme - Balanced Fund",
            "Hybrid Scheme - Conservative Hybrid Fund",
            "Hybrid Scheme - Equity Savings Fund"
        ]
        logger.info(f"Returning default categories: {default_categories}")
        return default_categories

def search_mutual_funds(category: str, min_returns: float = 0, max_risk: float = 100) -> Dict[str, Dict]:
    """
    Search mutual funds with parallel processing and optimized data structures
    """
    try:
        funds = defaultdict(dict)
        nav_file = get_latest_nav_file()
        if not nav_file:
            logger.warning("No NAV file found")
            return {}

        # Get matching fund categories for the goal
        target_categories = get_fund_categories(category)
        logger.info(f"Searching for funds in categories: {target_categories}")

        # Use memory mapping for faster file reading
        with open(nav_file, 'r+b') as f:
            mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            
            # Process file in chunks
            chunk = []
            current_category = None
            
            for line in iter(mm.readline, b''):
                line_str = line.decode('utf-8')
                
                # Skip empty lines
                if not line_str.strip():
                    continue
                    
                # Check if this is a category header
                if line_str.startswith('Open Ended'):
                    # Extract the actual category from the header
                    if '(' in line_str and ')' in line_str:
                        current_category = line_str.split('(')[1].split(')')[0].strip()
                        logger.debug(f"Found category: {current_category}")
                    continue
                    
                # Skip header row
                if line_str.startswith('Scheme Code'):
                    continue
                    
                # Process fund data
                if ';' in line_str:
                    parts = line_str.strip().split(';')
                    if len(parts) >= 5:
                        scheme_code = parts[0].strip()
                        scheme_name = parts[1].strip()
                        
                        # Check if current category matches any target category
                        if current_category and any(target in current_category for target in target_categories):
                            try:
                                nav = float(parts[4].strip())
                                returns, risk = calculate_fund_metrics(scheme_code)
                                
                                # Log fund details for debugging
                                logger.debug(f"Found fund: {scheme_name} (Category: {current_category}, Returns: {returns}, Risk: {risk})")
                                
                                if returns >= min_returns and risk <= max_risk:
                                    # Check if this is a balanced advantage or multi-asset fund
                                    is_balanced_advantage = "balanced advantage" in current_category.lower()
                                    is_multi_asset = "multi asset" in current_category.lower()
                                    is_dynamic_asset = "dynamic asset" in current_category.lower()
                                    
                                    if is_balanced_advantage or is_multi_asset or is_dynamic_asset:
                                        logger.info(f"Found balanced advantage/multi-asset fund: {scheme_name}")
                                    
                                    funds[scheme_name] = {
                                        'nav': nav,
                                        'returns_1yr': returns,
                                        'risk': risk,
                                        'min_investment': 5000,
                                        'expense_ratio': get_expense_ratio(scheme_code),
                                        'source': 'historical',
                                        'scheme_code': scheme_code,
                                        'category': current_category,
                                        'data_sources': ['historical'],
                                        'last_updated': datetime.now().isoformat(),
                                        'is_balanced_advantage': is_balanced_advantage,
                                        'is_multi_asset': is_multi_asset,
                                        'is_dynamic_asset': is_dynamic_asset
                                    }
                            except (ValueError, KeyError) as e:
                                logger.warning(f"Error processing fund {scheme_name}: {str(e)}")
                                continue
            
            mm.close()

        if not funds:
            logger.warning(f"No mutual funds found matching criteria: category={category}, min_returns={min_returns}, max_risk={max_risk}")
            logger.info(f"Searched in categories: {target_categories}")
            
        return dict(funds)

    except Exception as e:
        logger.error(f"Error searching mutual funds: {str(e)}")
        return {}

def get_fund_category(scheme_name: str) -> str:
    """
    Determine fund category based on scheme name
    """
    name_lower = scheme_name.lower()
    if 'large cap' in name_lower or 'bluechip' in name_lower:
        return 'Equity'
    elif 'debt' in name_lower or 'income' in name_lower:
        return 'Debt'
    elif 'hybrid' in name_lower or 'balanced' in name_lower:
        return 'Hybrid'
    else:
        return 'Equity'  # Default to Equity

def get_expense_ratio(scheme_code: str) -> float:
    """
    Get expense ratio for a fund (using standard ratios based on category)
    """
    # These are typical expense ratios for different fund types
    return 1.15  # Default to 1.15% for most funds

def get_fallback_mutual_funds() -> Dict[str, Dict]:
    """
    Get fallback mutual fund options when real data is unavailable
    """
    return {
        "119551": {
            "name": "SBI Bluechip Fund",
            "nav": 100.0,
            "returns_1yr": 12.0,
            "risk": 15.0,
            "min_investment": 5000,
            "expense_ratio": 1.15,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        },
        "119552": {
            "name": "HDFC Top 100 Fund",
            "nav": 150.0,
            "returns_1yr": 14.0,
            "risk": 18.0,
            "min_investment": 5000,
            "expense_ratio": 1.25,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        },
        "119553": {
            "name": "ICICI Prudential Bluechip Fund",
            "nav": 200.0,
            "returns_1yr": 13.0,
            "risk": 16.0,
            "min_investment": 5000,
            "expense_ratio": 1.20,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        }
    }

def calculate_mfapi_returns(mf_data: Dict) -> float:
    """Calculate returns from MFAPI data"""
    try:
        navs = [float(entry['nav']) for entry in mf_data['data']]
        if len(navs) >= 2:
            return ((navs[0] - navs[-1]) / navs[-1]) * 100
        return 0.0
    except Exception:
        return 0.0

def calculate_mfapi_risk(mf_data: Dict) -> float:
    """Calculate risk from MFAPI data"""
    try:
        navs = [float(entry['nav']) for entry in mf_data['data']]
        if len(navs) >= 2:
            daily_returns = [(navs[i] - navs[i+1])/navs[i+1] for i in range(len(navs)-1)]
            return np.std(daily_returns) * 100
        return 0.0
    except Exception:
        return 0.0

def parse_bankbazaar_rates(html: str) -> List[Tuple[str, float]]:
    """Parse bank rates from BankBazaar HTML"""
    # This is a placeholder. In practice, you'd need proper HTML parsing
    return []

def search_stocks(sector: str, min_market_cap: float = 0, max_risk: float = 100) -> Dict[str, Dict]:
    """
    Search stocks with improved error handling and fallback data
    """
    try:
        stocks = {}
        
        # 1. Get data from our dataset first
        if os.path.exists(STOCK_DATASET):
            df = pd.read_csv(STOCK_DATASET)
            for _, row in df.iterrows():
                try:
                    # Use NSE symbol for Yahoo Finance
                    symbol = row['symbol']
                    nse_symbol = INDIAN_STOCK_SYMBOLS.get(symbol, f"{symbol}.NS")
                    company_name = row['company_name']
                    sector_name = row['sector']
                    price = float(row['close'])
                    returns = float(row['returns_1yr'])
                    risk = float(row['volatility'])
                    market_cap = float(row['market_cap'])
                    pe_ratio = float(row['pe_ratio'])
                    
                    if sector.lower() in sector_name.lower() and \
                       market_cap >= min_market_cap and risk <= max_risk:
                        stocks[symbol] = {
                            'name': company_name,
                            'sector': sector_name,
                            'price': price,
                            'returns_1yr': returns,
                            'risk': risk,
                            'market_cap': market_cap,
                            'pe_ratio': pe_ratio,
                            'ticker': nse_symbol,  # Add ticker for Yahoo Finance
                            'source': 'dataset',
                            'data_sources': ['dataset'],
                            'last_updated': datetime.now().isoformat()
                        }
                except (ValueError, KeyError) as e:
                    logger.warning(f"Error processing stock {row.get('symbol')}: {str(e)}")
                    continue
        
        # 2. Get real-time data from Yahoo Finance with improved error handling
        for symbol in list(stocks.keys()):
            try:
                ticker = stocks[symbol].get('ticker')
                if not ticker:
                    logger.warning(f"No ticker found for {symbol}, skipping Yahoo Finance update")
                    continue
                    
                hist = get_yfinance_data(ticker)
                if hist is not None and not hist.empty:
                    # Calculate metrics
                    returns = ((hist['Close'][-1] - hist['Close'][0]) / hist['Close'][0]) * 100
                    risk = hist['Close'].pct_change().std() * 100
                    volume = hist['Volume'].mean()
                    
                    # Update stock data with real-time information
                    stocks[symbol].update({
                        'realtime_price': hist['Close'][-1],
                        'realtime_returns': returns,
                        'realtime_risk': risk,
                        'volume': volume,
                        'data_sources': stocks[symbol].get('data_sources', []) + ['realtime'],
                        'last_updated': datetime.now().isoformat()
                    })
                    
                    # Update main metrics with real-time data if it's more recent
                    if 'last_updated' not in stocks[symbol] or \
                       datetime.fromisoformat(stocks[symbol]['last_updated']) < datetime.now() - timedelta(days=1):
                        stocks[symbol].update({
                            'price': hist['Close'][-1],
                            'returns_1yr': returns,
                            'risk': risk,
                            'source': 'realtime'
                        })
            except Exception as e:
                logger.warning(f"Yahoo Finance error for {symbol}: {str(e)}")
                continue
        
        # If no stocks found, use fallback data
        if not stocks:
            logger.warning("No stocks found, using fallback data")
            return get_fallback_stocks()
            
        return stocks
        
    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        return get_fallback_stocks()

def search_fixed_deposits(min_rate: float = 0, max_duration: int = 60) -> Dict[str, Dict]:
    """
    Search fixed deposits using all available data sources
    """
    try:
        fds = {}
        
        # 1. Get data from our dataset first
        if os.path.exists(FD_DATASET):
            df = pd.read_csv(FD_DATASET)
            for _, row in df.iterrows():
                try:
                    bank_name = row['bank_name']
                    rate = float(row['rate'])
                    duration = int(row['duration_months'])
                    min_amount = float(row['min_amount'])
                    max_amount = float(row['max_amount'])
                    
                    if rate >= min_rate and duration <= max_duration:
                        fds[f"{bank_name} FD"] = {
                            'rate': rate,
                            'duration_months': duration,
                            'min_amount': min_amount,
                            'max_amount': max_amount,
                            'source': 'dataset',
                            'last_updated': datetime.now().isoformat()
                        }
                except (ValueError, KeyError) as e:
                    logger.warning(f"Error processing FD for {row.get('bank_name')}: {str(e)}")
                    continue
        
        # 2. Get data from Alpha Vantage (Bank Nifty as proxy)
        try:
            alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
            if alpha_vantage_key:
                url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=BANKNIFTY.NS&apikey={alpha_vantage_key}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if 'Time Series (Daily)' in data:
                        # Calculate average rate based on Bank Nifty performance
                        rates = []
                        for date, values in data['Time Series (Daily)'].items():
                            close = float(values['4. close'])
                            rates.append(close)
                        avg_rate = sum(rates) / len(rates)
                        base_rate = 7.0 + (avg_rate - 40000) / 1000  # Adjust base rate based on Bank Nifty
                        
                        # Generate FD options for major banks
                        banks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank']
                        for bank in banks:
                            if f"{bank} FD" not in fds:
                                fds[f"{bank} FD"] = {
                                    'rate': base_rate + (0.25 * banks.index(bank)),  # Slightly higher rates for private banks
                                    'duration_months': 12,
                                    'min_amount': 5000 if bank != 'SBI' else 1000,
                                    'max_amount': 10000000,
                                    'source': 'alphavantage',
                                    'last_updated': datetime.now().isoformat()
                                }
        except Exception as e:
            logger.warning(f"Alpha Vantage error for FD rates: {str(e)}")
        
        return fds
        
    except Exception as e:
        logger.error(f"Error searching fixed deposits: {str(e)}")
        return {}

def get_market_data(user_profile=None):
    """
    Get market data with better fallback handling
    """
    try:
        if user_profile is None:
            user_profile = {
                "risk_tolerance": "Medium",
                "time_horizon_months": 60,
                "investment_goal": "Wealth Growth"
            }

        # Get risk parameters
        risk_tolerance = user_profile.get("risk_tolerance", "Medium")
        time_horizon = user_profile.get("time_horizon_months", 60)
        
        # Set investment goal based on time horizon
        if time_horizon <= 36:  # Short term (0-3 years)
            investment_goal = "Short Term"
        elif time_horizon <= 84:  # Medium term (4-7 years)
            investment_goal = "Medium Term"  # Changed from "Balanced" to "Medium Term"
        else:  # Long term (7+ years)
            investment_goal = "Long Term"  # Changed from "Wealth Growth" to "Long Term"

        # Define risk map
        risk_map = {
            "Low": {"max_risk": 15, "min_returns": 8},
            "Medium": {"max_risk": 25, "min_returns": 12},
            "High": {"max_risk": 35, "min_returns": 15}
        }

        risk_params = risk_map.get(risk_tolerance, risk_map["Medium"])
        max_risk = risk_params["max_risk"]
        min_returns = risk_params["min_returns"]

        # Fetch data in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Pass the investment goal to search_mutual_funds
            mf_future = executor.submit(search_mutual_funds, investment_goal)
            stock_future = executor.submit(search_stocks, "all", 0, max_risk)
            fd_future = executor.submit(search_fixed_deposits, min_returns, time_horizon)

            mutual_funds = mf_future.result()
            stocks = stock_future.result()
            fixed_deposits = fd_future.result()

        # Log results
        logger.info(f"Found {len(mutual_funds)} mutual funds")
        logger.info(f"Found {len(stocks)} stocks")
        logger.info(f"Found {len(fixed_deposits)} fixed deposits")

        # Use fallback options if no data found
        if not any([mutual_funds, stocks, fixed_deposits]):
            logger.warning("No investment options found, using fallback options")
            return {
                "mutual_funds": get_fallback_mutual_funds(),
                "stocks": get_fallback_stocks(),
                "fixed_deposits": get_fallback_fixed_deposits()
            }

        # Combine results
        market_data = {
            "mutual_funds": mutual_funds or get_fallback_mutual_funds(),
            "stocks": stocks or get_fallback_stocks(),
            "fixed_deposits": fixed_deposits or get_fallback_fixed_deposits()
        }

        return market_data

    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        return {
            "mutual_funds": get_fallback_mutual_funds(),
            "stocks": get_fallback_stocks(),
            "fixed_deposits": get_fallback_fixed_deposits()
        }

def get_fallback_options():
    """
    Get fallback investment options with improved data
    """
    return {
        "mutual_funds": {
            "119551": {
                "name": "SBI Bluechip Fund",
                "nav": 100.0,
                "returns_1yr": 12.0,
                "risk": 15.0,
                "min_investment": 5000,
                "expense_ratio": 1.15,
                "source": "fallback",
                "data_sources": ["fallback"],
                "last_updated": datetime.now().isoformat()
            },
            "119552": {
                "name": "HDFC Top 100 Fund",
                "nav": 150.0,
                "returns_1yr": 14.0,
                "risk": 18.0,
                "min_investment": 5000,
                "expense_ratio": 1.25,
                "source": "fallback",
                "data_sources": ["fallback"],
                "last_updated": datetime.now().isoformat()
            }
        },
        "stocks": {
            "RELIANCE": {
                "name": "Reliance Industries",
                "sector": "Energy",
                "price": 2500.0,
                "returns_1yr": 15.0,
                "risk": 20.0,
                "market_cap": 1000000000,
                "pe_ratio": 25.0,
                "source": "fallback",
                "data_sources": ["fallback"],
                "last_updated": datetime.now().isoformat()
            },
            "TCS": {
                "name": "Tata Consultancy Services",
                "sector": "Technology",
                "price": 3500.0,
                "returns_1yr": 12.0,
                "risk": 18.0,
                "market_cap": 1200000000,
                "pe_ratio": 30.0,
                "source": "fallback",
                "data_sources": ["fallback"],
                "last_updated": datetime.now().isoformat()
            }
        },
        "fixed_deposits": {
            "SBI FD": {
                "rate": 7.0,
                "duration_months": 12,
                "min_amount": 1000,
                "max_amount": 10000000,
                "source": "fallback",
                "last_updated": datetime.now().isoformat()
            },
            "HDFC Bank FD": {
                "rate": 7.5,
                "duration_months": 12,
                "min_amount": 5000,
                "max_amount": 10000000,
                "source": "fallback",
                "last_updated": datetime.now().isoformat()
            }
        }
    }

def get_mfapi_nav(scheme_code: str) -> Optional[float]:
    """
    Get NAV for a mutual fund from MFAPI
    """
    try:
        url = f"https://api.mfapi.in/mf/{scheme_code}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and 'data' in data and len(data['data']) > 0:
                return float(data['data'][0]['nav'])
        return None
    except Exception as e:
        logger.error(f"Error getting NAV from MFAPI for {scheme_code}: {str(e)}")
        return None

def get_yfinance_history_with_retry(symbol: str, period: str = "1y", max_retries: int = 3) -> Optional[pd.DataFrame]:
    """
    Get historical data from Yahoo Finance with retry logic and rate limit handling
    """
    for attempt in range(max_retries):
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period)
            if not hist.empty:
                return hist
            time.sleep(2 ** attempt)  # Exponential backoff
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {symbol}: {str(e)}")
            if "429" in str(e) or "Too Many Requests" in str(e):
                # Longer sleep for rate limits
                time.sleep(30 * (attempt + 1))
            elif attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            continue
    return None

def get_alpha_vantage_time_series(symbol: str, interval: str = "daily") -> Optional[Dict]:
    """
    Get time series data from Alpha Vantage
    """
    try:
        alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
        if not alpha_vantage_key:
            logger.error("Alpha Vantage API key not found")
            return None
            
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_{interval.upper()}&symbol={symbol}&apikey={alpha_vantage_key}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'Time Series' in data:
                return data
        return None
    except Exception as e:
        logger.error(f"Error getting time series from Alpha Vantage for {symbol}: {str(e)}")
        return None

def get_fallback_stocks() -> Dict[str, Dict]:
    """
    Get fallback stock options when real data is unavailable
    """
    return {
        "RELIANCE": {
            "name": "Reliance Industries",
            "sector": "Energy",
            "price": 2500.0,
            "returns_1yr": 15.0,
            "risk": 20.0,
            "market_cap": 1000000000,
            "pe_ratio": 25.0,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        },
        "TCS": {
            "name": "Tata Consultancy Services",
            "sector": "Technology",
            "price": 3500.0,
            "returns_1yr": 12.0,
            "risk": 18.0,
            "market_cap": 1200000000,
            "pe_ratio": 30.0,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        },
        "HDFCBANK": {
            "name": "HDFC Bank",
            "sector": "Banking",
            "price": 1600.0,
            "returns_1yr": 10.0,
            "risk": 15.0,
            "market_cap": 800000000,
            "pe_ratio": 20.0,
            "source": "fallback",
            "data_sources": ["fallback"],
            "last_updated": datetime.now().isoformat()
        }
    }

def get_fallback_fixed_deposits() -> Dict[str, Dict]:
    """
    Get fallback fixed deposit options when real data is unavailable
    """
    return {
        "SBI FD": {
            "rate": 7.0,
            "duration_months": 12,
            "min_amount": 1000,
            "max_amount": 10000000,
            "source": "fallback",
            "last_updated": datetime.now().isoformat()
        },
        "HDFC Bank FD": {
            "rate": 7.5,
            "duration_months": 12,
            "min_amount": 5000,
            "max_amount": 10000000,
            "source": "fallback",
            "last_updated": datetime.now().isoformat()
        },
        "ICICI Bank FD": {
            "rate": 7.25,
            "duration_months": 12,
            "min_amount": 5000,
            "max_amount": 10000000,
            "source": "fallback",
            "last_updated": datetime.now().isoformat()
        }
    }

# ---------- Example Usage ----------
if __name__ == "__main__":
    # Test market data fetching with a sample user profile
    user_profile = {
        "risk_tolerance": "Medium",
        "time_horizon_months": 36,
        "goal": "Retirement",
        "investment_experience": "Intermediate"
    }
    
    market_data = get_market_data(user_profile)
    print("\nFound investment options:")
    print(f"Mutual Funds: {len(market_data['mutual_funds'])}")
    print(f"Stocks: {len(market_data['stocks'])}")
    print(f"Fixed Deposits: {len(market_data['fixed_deposits'])}")

"""
Core investment recommendation functionality
"""

from .allocator import allocate_investments
from .drift_alerts import detect_drift
from .micro_invest import suggest_micro_investments
from .risk_simulator import simulate_growth
from .glide_path import get_glide_weights, classify_fund_type
from .collaborative_recommender import recommend_collaborative

__all__ = [
    'allocate_investments',
    'detect_drift',
    'suggest_micro_investments',
    'simulate_growth',
    'get_glide_weights',
    'classify_fund_type',
    'recommend_collaborative'
] 
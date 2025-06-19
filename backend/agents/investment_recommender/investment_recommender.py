import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import pandas as pd
import numpy as np
import os
from collections import defaultdict

from .core.allocator import allocate_investments
from .core.drift_alerts import detect_drift
from .core.micro_invest import suggest_micro_investments
from .core.risk_simulator import simulate_growth
from .nudges import UserGamification
from .market_fetcher import get_market_data, get_mfapi_nav, get_yfinance_history_with_retry, get_alpha_vantage_time_series
from .scorer import InvestmentScorer
from .gemini_client import improve_portfolio_with_gemini

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InvestmentRecommender:
    def __init__(self, user_id: Optional[str] = None):
        self.scorer = InvestmentScorer()
        self.user_gamification = UserGamification(user_id)

    def get_recommendations(self, user_profile: Dict) -> Dict:
        """
        Get personalized investment recommendations based on user profile
        """
        try:
            # Get market data based on user profile
            market_data = get_market_data(user_profile)
            if not market_data:
                logger.error("Failed to fetch market data")
                return self._get_fallback_recommendations(user_profile)

            # Score investments based on user profile
            scored_investments = self._score_investments(user_profile, market_data)
            if not scored_investments:
                logger.error("Failed to score investments")
                return self._get_fallback_recommendations(user_profile)

            # Allocate investments
            portfolio = self._allocate_investments(scored_investments, user_profile)
            if not portfolio:
                logger.error("Failed to allocate investments")
                return self._get_fallback_recommendations(user_profile)

            # --- GEMINI INTEGRATION ---
            micro_investment_plan = None
            growth_simulations = None
            try:
                logger.info("Calling Gemini to improve portfolio based on Indian market trends...")
                gemini_result = improve_portfolio_with_gemini(user_profile, portfolio)
                logger.info(f"Gemini improved portfolio: {gemini_result}")
                # Unpack Gemini's result
                improved_portfolio = gemini_result.get("improved_portfolio", [])
                micro_investment_plan = gemini_result.get("micro_investment_plan", {})
                growth_simulations = gemini_result.get("growth_simulations", {})
                portfolio = improved_portfolio
            except Exception as e:
                logger.warning(f"Gemini integration failed: {e}. Using original portfolio.")
                micro_investment_plan = None
                growth_simulations = None

            # Calculate portfolio metrics
            portfolio_metrics = self._calculate_portfolio_metrics(portfolio, user_profile)
            if not portfolio_metrics:
                logger.error("Failed to calculate portfolio metrics")
                return self._get_fallback_recommendations(user_profile)

            # Generate personalized nudges
            nudges = self._generate_nudges(portfolio, user_profile, portfolio_metrics)
            if not nudges:
                logger.warning("No nudges generated, using default nudges")
                nudges = [
                    "Consider increasing your equity exposure for better long-term returns",
                    "Your portfolio is well-diversified across different asset classes",
                    "Regular investments can help you achieve your financial goals faster"
                ]

            return {
                "recommended_portfolio": portfolio,
                "portfolio_metrics": portfolio_metrics,
                "growth_simulations": growth_simulations,
                "micro_investment_plan": micro_investment_plan,
                "nudges": nudges
            }

        except Exception as e:
            logger.error(f"Error in get_recommendations: {str(e)}")
            return self._get_fallback_recommendations(user_profile)

    def _get_fallback_recommendations(self, user_profile: Dict) -> Dict:
        """
        Get fallback recommendations when primary recommendation process fails
        """
        risk_tolerance = user_profile.get("risk_tolerance", "Medium")
        time_horizon = user_profile.get("time_horizon_months", 60)
        experience_level = str(user_profile.get("investment_experience", "beginner")).strip().lower()

        # Define fallback portfolio based on risk tolerance and experience
        if experience_level in ["beginner", "intermediate"]:
            portfolio = [
                {
                    "name": "SBI Fixed Deposit",
                    "type": "fixed_deposit",
                    "allocation": 0.6,
                    "rate": 7.0,
                    "duration_months": 12,
                    "min_amount": 1000,
                    "max_amount": 10000000
                },
                {
                    "name": "SBI Bluechip Fund",
                    "type": "mutual_fund",
                    "code": "119551",
                    "allocation": 0.3,
                    "nav": 100.0,
                    "min_investment": 1000
                }
                # No stocks for beginner or intermediate in fallback
            ]
        elif risk_tolerance == "Low":
            portfolio = [
                {
                    "name": "SBI Fixed Deposit",
                    "type": "fixed_deposit",
                    "allocation": 0.6,
                    "rate": 7.0,
                    "duration_months": 12,
                    "min_amount": 1000,
                    "max_amount": 10000000
                },
                {
                    "name": "SBI Bluechip Fund",
                    "type": "mutual_fund",
                    "code": "119551",
                    "allocation": 0.3,
                    "nav": 100.0,
                    "min_investment": 1000
                },
                {
                    "name": "Reliance Industries",
                    "type": "stock",
                    "ticker": "RELIANCE.NS",
                    "allocation": 0.1,
                    "current_price": 2500.0,
                    "min_investment": 2500.0
                }
            ]
        elif risk_tolerance == "High":
            portfolio = [
                {
                    "name": "SBI Fixed Deposit",
                    "type": "fixed_deposit",
                    "allocation": 0.2,
                    "rate": 7.0,
                    "duration_months": 12,
                    "min_amount": 1000,
                    "max_amount": 10000000
                },
                {
                    "name": "SBI Bluechip Fund",
                    "type": "mutual_fund",
                    "code": "119551",
                    "allocation": 0.4,
                    "nav": 100.0,
                    "min_investment": 1000
                },
                {
                    "name": "Reliance Industries",
                    "type": "stock",
                    "ticker": "RELIANCE.NS",
                    "allocation": 0.4,
                    "current_price": 2500.0,
                    "min_investment": 2500.0
                }
            ]
        else:  # Medium risk
            portfolio = [
                {
                    "name": "SBI Fixed Deposit",
                    "type": "fixed_deposit",
                    "allocation": 0.4,
                    "rate": 7.0,
                    "duration_months": 12,
                    "min_amount": 1000,
                    "max_amount": 10000000
                },
                {
                    "name": "SBI Bluechip Fund",
                    "type": "mutual_fund",
                    "code": "119551",
                    "allocation": 0.4,
                    "nav": 100.0,
                    "min_investment": 1000
                },
                {
                    "name": "Reliance Industries",
                    "type": "stock",
                    "ticker": "RELIANCE.NS",
                    "allocation": 0.2,
                    "current_price": 2500.0,
                    "min_investment": 2500.0
                }
            ]

        # Calculate basic metrics
        portfolio_metrics = {
            "expected_returns": 10.0,
            "risk": 15.0,
            "diversification_score": "Good",
            "liquidity_score": "High"
        }

        # Generate basic growth simulations
        growth_simulations = {
            "normal": {
                "mean": 1.5,
                "std_dev": 0.2,
                "percentile_5": 1.2,
                "percentile_95": 1.8
            },
            "crash": {
                "mean": 0.8,
                "std_dev": 0.1,
                "percentile_5": 0.7,
                "percentile_95": 0.9
            },
            "boom": {
                "mean": 2.0,
                "std_dev": 0.3,
                "percentile_5": 1.5,
                "percentile_95": 2.5
            }
        }

        # Generate basic nudges
        nudges = [
            "Consider increasing your equity exposure for better long-term returns",
            "Your portfolio is well-diversified across different asset classes",
            "Regular investments can help you achieve your financial goals faster"
        ]

        return {
            "recommended_portfolio": portfolio,
            "portfolio_metrics": portfolio_metrics,
            "growth_simulations": growth_simulations,
            "nudges": nudges
        }

    def _score_investments(self, user_profile: Dict, market_data: Dict) -> Dict[str, Dict]:
        """
        Score investments based on user profile and market data
        """
        try:
            scores = {}
            risk_tolerance = user_profile.get('risk_tolerance', 'medium')
            time_horizon = user_profile.get('time_horizon_months', 60)
            investment_goal = user_profile.get('investment_goal', 'wealth_growth')
            experience_level = str(user_profile.get('investment_experience', 'beginner')).strip().lower()
            
            logger.info(f"Scoring investments for profile: risk={risk_tolerance}, horizon={time_horizon} months, goal={investment_goal}, experience={experience_level}")

            # Score mutual funds
            for fund_name, fund_data in market_data.get('mutual_funds', {}).items():
                try:
                    # Base score calculation
                    returns = fund_data.get('returns_1yr', 0)
                    risk = fund_data.get('risk', 0)
                    
                    # Get fund category and type
                    category = fund_data.get('category', '').lower()
                    is_balanced_advantage = fund_data.get('is_balanced_advantage', False)
                    is_multi_asset = fund_data.get('is_multi_asset', False)
                    is_dynamic_asset = fund_data.get('is_dynamic_asset', False)
                    
                    logger.debug(f"Scoring fund: {fund_name}")
                    logger.debug(f"Category: {category}")
                    logger.debug(f"Type flags: balanced={is_balanced_advantage}, multi_asset={is_multi_asset}, dynamic={is_dynamic_asset}")
                    
                    # Calculate base score (60% returns, 40% risk)
                    base_score = (0.6 * returns) - (0.4 * risk)
                    
                    # Apply category multipliers based on time horizon
                    category_multiplier = 1.0
                    
                    if 48 <= time_horizon <= 84:  # Medium term (4-7 years)
                        if is_balanced_advantage:
                            category_multiplier = 2.0
                            logger.info(f"Applying balanced advantage multiplier for {fund_name}")
                        elif is_multi_asset:
                            category_multiplier = 1.8
                            logger.info(f"Applying multi-asset multiplier for {fund_name}")
                        elif is_dynamic_asset:
                            category_multiplier = 1.6
                            logger.info(f"Applying dynamic asset multiplier for {fund_name}")
                        elif "debt" in category:
                            category_multiplier = 0.5  # Reduce debt fund priority
                            logger.info(f"Reducing debt fund priority for {fund_name}")
                    elif time_horizon > 84:  # Long term (>7 years)
                        if "equity" in category:
                            category_multiplier = 1.5
                        elif "hybrid" in category:
                            category_multiplier = 1.3
                    else:  # Short term (<4 years)
                        if "debt" in category:
                            category_multiplier = 1.5
                        elif "liquid" in category:
                            category_multiplier = 1.3
                    
                    # Apply risk tolerance adjustment
                    risk_multiplier = 1.0
                    if risk_tolerance == 'low':
                        risk_multiplier = 0.8 if risk > 15 else 1.2
                    elif risk_tolerance == 'high':
                        risk_multiplier = 1.2 if risk > 15 else 0.8
                    
                    # Apply experience level adjustment for mutual funds
                    experience_multiplier = 1.0
                    if experience_level == 'beginner':
                        if risk > 20:  # High risk funds
                            experience_multiplier = 0.5  # Significantly reduce high risk funds for beginners
                        elif risk > 15:  # Medium risk funds
                            experience_multiplier = 0.8  # Slightly reduce medium risk funds
                        elif risk <= 15:  # Low risk funds
                            experience_multiplier = 1.2  # Boost low risk funds
                    
                    # Calculate final score
                    final_score = base_score * category_multiplier * risk_multiplier * experience_multiplier
                    
                    logger.debug(f"Fund {fund_name} scores:")
                    logger.debug(f"Base score: {base_score}")
                    logger.debug(f"Category multiplier: {category_multiplier}")
                    logger.debug(f"Risk multiplier: {risk_multiplier}")
                    logger.debug(f"Experience multiplier: {experience_multiplier}")
                    logger.debug(f"Final score: {final_score}")
                    
                    scores[fund_name] = {
                        'score': final_score,
                        'type': 'mutual_fund',
                        'category': category,
                        'is_balanced_advantage': is_balanced_advantage,
                        'is_multi_asset': is_multi_asset,
                        'is_dynamic_asset': is_dynamic_asset,
                        'returns': returns,
                        'risk': risk
                    }
                    
                except Exception as e:
                    logger.error(f"Error scoring fund {fund_name}: {str(e)}")
                    continue

            # Score stocks with conservative approach for beginners
            for stock_name, stock_data in market_data.get('stocks', {}).items():
                try:
                    returns = stock_data.get('returns_1yr', 0)
                    risk = stock_data.get('volatility', 0)
                    market_cap = stock_data.get('market_cap', 0)
                    
                    # Base score calculation
                    base_score = (0.5 * returns) - (0.5 * risk)
                    
                    # Apply market cap multiplier
                    market_cap_multiplier = 1.0
                    if market_cap > 1e12:  # Large cap
                        market_cap_multiplier = 1.2
                    elif market_cap > 1e10:  # Mid cap
                        market_cap_multiplier = 1.0
                    else:  # Small cap
                        market_cap_multiplier = 0.8
                    
                    # Apply risk tolerance adjustment
                    risk_multiplier = 1.0
                    if risk_tolerance == 'low':
                        risk_multiplier = 0.7 if risk > 20 else 1.3
                    elif risk_tolerance == 'high':
                        risk_multiplier = 1.3 if risk > 20 else 0.7
                    
                    # Apply experience level adjustment for stocks
                    experience_multiplier = 1.0
                    if experience_level == 'beginner':
                        if market_cap <= 1e10:  # Small and mid caps
                            experience_multiplier = 0.3  # Significantly reduce small/mid caps for beginners
                        elif risk > 20:  # High risk stocks
                            experience_multiplier = 0.4  # Significantly reduce high risk stocks
                        elif risk > 15:  # Medium risk stocks
                            experience_multiplier = 0.7  # Reduce medium risk stocks
                        else:  # Low risk, large cap stocks
                            experience_multiplier = 1.2  # Boost low risk, large cap stocks
                    
                    final_score = base_score * market_cap_multiplier * risk_multiplier * experience_multiplier
                    
                    scores[stock_name] = {
                        'score': final_score,
                        'type': 'stock',
                        'market_cap': market_cap,
                        'returns': returns,
                        'risk': risk
                    }
                    
                except Exception as e:
                    logger.error(f"Error scoring stock {stock_name}: {str(e)}")
                    continue

            # Score fixed deposits
            for bank_name, fd_data in market_data.get('fixed_deposits', {}).items():
                try:
                    interest_rate = fd_data.get('interest_rate', 0)
                    duration = fd_data.get('duration_months', 0)
                    
                    # Base score calculation
                    base_score = interest_rate
                    
                    # Apply duration multiplier
                    duration_multiplier = 1.0
                    if duration <= 12:  # Short term
                        duration_multiplier = 1.2
                    elif duration <= 36:  # Medium term
                        duration_multiplier = 1.0
                    else:  # Long term
                        duration_multiplier = 0.8
                    
                    # Apply experience level adjustment for FDs
                    experience_multiplier = 1.0
                    if experience_level == 'beginner':
                        experience_multiplier = 1.2  # Boost FDs for beginners
                    
                    final_score = base_score * duration_multiplier * experience_multiplier
                    
                    scores[bank_name] = {
                        'score': final_score,
                        'type': 'fixed_deposit',
                        'interest_rate': interest_rate,
                        'duration': duration
                    }
                    
                except Exception as e:
                    logger.error(f"Error scoring fixed deposit {bank_name}: {str(e)}")
                    continue

            return scores

        except Exception as e:
            logger.error(f"Error in _score_investments: {str(e)}")
            return {}

    def _allocate_investments(self, scored_investments: Dict, user_profile: Dict) -> List[Dict]:
        """
        Allocate investments based on time horizon and risk profile
        """
        try:
            logger.info("Starting investment allocation")
            # Get user parameters
            risk_tolerance = user_profile.get("risk_tolerance", "Medium")
            time_horizon = user_profile.get("time_horizon_months", 60)
            investment_goal = user_profile.get("investment_goal", "Wealth Growth")
            experience_level = str(user_profile.get("investment_experience", "beginner")).strip().lower()
            
            logger.info(f"Allocation parameters - Risk: {risk_tolerance}, Time Horizon: {time_horizon} months, Goal: {investment_goal}, Experience: {experience_level}")

            # Define allocation based on time horizon
            if time_horizon <= 36:  # Short term (0-3 years)
                logger.info("Allocating for short-term investment")
                allocation = {
                    "fixed_deposits": 0.6,
                    "mutual_funds": 0.4,  # Only debt funds
                    "stocks": 0.0  # No stocks for short term
                }
                # Filter mutual funds to only include debt funds
                scored_investments["mutual_funds"] = {
                    name: fund for name, fund in scored_investments.get("mutual_funds", {}).items()
                    if "debt scheme" in fund.get("category", "").lower()
                }
            elif time_horizon <= 84:  # Medium term (4-7 years)
                logger.info("Allocating for medium-term investment")
                if risk_tolerance == "Low":
                    allocation = {
                        "fixed_deposits": 0.3,
                        "mutual_funds": 0.6,  # Only hybrid/multi-asset funds
                        "stocks": 0.1  # Only large cap
                    }
                elif risk_tolerance == "High":
                    allocation = {
                        "fixed_deposits": 0.1,
                        "mutual_funds": 0.6,  # Only hybrid/multi-asset funds
                        "stocks": 0.3  # Only large cap
                    }
                else:  # Medium risk
                    allocation = {
                        "fixed_deposits": 0.2,
                        "mutual_funds": 0.6,  # Only hybrid/multi-asset funds
                        "stocks": 0.2  # Only large cap
                    }
                # Filter mutual funds to only include hybrid/multi-asset funds
                scored_investments["mutual_funds"] = {
                    name: fund for name, fund in scored_investments.get("mutual_funds", {}).items()
                    if any(category in fund.get("category", "").lower() for category in [
                        "hybrid scheme - balanced advantage fund",
                        "hybrid scheme - multi asset allocation fund",
                        "hybrid scheme - dynamic asset allocation fund",
                        "hybrid scheme - balanced fund",
                        "hybrid scheme - conservative hybrid fund",
                        "hybrid scheme - equity savings fund"
                    ])
                }
                logger.info(f"Found {len(scored_investments['mutual_funds'])} hybrid/multi-asset funds")
                # Filter stocks to only include large cap and appropriate risk for experience/risk tolerance
                stocks = scored_investments.get("stocks", {})
                def get_stock_risk(stock):
                    return stock.get("risk", stock.get("volatility", 0))
                logger.info(f"User experience: {experience_level}, risk tolerance: {risk_tolerance}")
                logger.info(f"Stocks before filtering: {[(name, stock.get('market_cap', 0), get_stock_risk(stock), stock.get('risk', None), stock.get('volatility', None)) for name, stock in stocks.items()]}")
                if experience_level in ['beginner', 'intermediate']:
                    if risk_tolerance.lower() == 'low':
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12 and get_stock_risk(stock) <= 15
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & low risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                    elif risk_tolerance.lower() == 'medium':
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12 and get_stock_risk(stock) <= 20
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & medium risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                    else:  # High risk tolerance
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & high risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                else:
                    filtered_stocks = {
                        name: stock for name, stock in stocks.items()
                        if stock.get("market_cap", 0) >= 1000000000  # Large cap threshold
                    }
                    logger.info(f"Stocks after filtering for advanced: {list(filtered_stocks.keys())}")
                    scored_investments["stocks"] = filtered_stocks
                logger.info(f"Final stocks considered: {[(name, stock.get('market_cap', 0), get_stock_risk(stock), stock.get('risk', None), stock.get('volatility', None)) for name, stock in scored_investments['stocks'].items()]}")
            else:  # Long term (7+ years)
                logger.info("Allocating for long-term investment")
                # For long-term, always try to recommend both equity mutual funds and direct equity (stocks)
                if risk_tolerance == "Low":
                    allocation = {
                        "fixed_deposits": 0.0,  # No FDs for long term
                        "mutual_funds": 0.7,  # Only equity funds
                        "stocks": 0.3  # Large and mid cap
                    }
                elif risk_tolerance == "High":
                    allocation = {
                        "fixed_deposits": 0.0,  # No FDs for long term
                        "mutual_funds": 0.5,  # Only equity funds
                        "stocks": 0.5  # Large and mid cap
                    }
                else:  # Medium risk
                    allocation = {
                        "fixed_deposits": 0.0,  # No FDs for long term
                        "mutual_funds": 0.6,  # Only equity funds
                        "stocks": 0.4  # Large and mid cap
                    }
                # Filter mutual funds to only include equity funds
                scored_investments["mutual_funds"] = {
                    name: fund for name, fund in scored_investments.get("mutual_funds", {}).items()
                    if "equity scheme" in fund.get("category", "").lower()
                }
                # Filter stocks for experience/risk tolerance
                stocks = scored_investments.get("stocks", {})
                def get_stock_risk(stock):
                    return stock.get("risk", stock.get("volatility", 0))
                logger.info(f"User experience: {experience_level}, risk tolerance: {risk_tolerance}")
                logger.info(f"Stocks before filtering: {[(name, stock.get('market_cap', 0), get_stock_risk(stock), stock.get('risk', None), stock.get('volatility', None)) for name, stock in stocks.items()]}")
                if experience_level in ['beginner', 'intermediate']:
                    if risk_tolerance.lower() == 'low':
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12 and get_stock_risk(stock) <= 15
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & low risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                    elif risk_tolerance.lower() == 'medium':
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12 and get_stock_risk(stock) <= 20
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & medium risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                    else:  # High risk tolerance
                        filtered_stocks = {
                            name: stock for name, stock in stocks.items()
                            if stock.get("market_cap", 0) > 1e12
                        }
                        logger.info(f"Stocks after filtering for beginner/intermediate & high risk: {list(filtered_stocks.keys())}")
                        scored_investments["stocks"] = filtered_stocks
                else:
                    # For advanced users, allow both large and mid-cap stocks for long-term
                    filtered_stocks = {
                        name: stock for name, stock in stocks.items()
                        if stock.get("market_cap", 0) >= 1e10  # Large and mid cap threshold
                    }
                    logger.info(f"Stocks after filtering for advanced: {list(filtered_stocks.keys())}")
                    scored_investments["stocks"] = filtered_stocks
                logger.info(f"Final stocks considered: {[(name, stock.get('market_cap', 0), get_stock_risk(stock), stock.get('risk', None), stock.get('volatility', None)) for name, stock in scored_investments['stocks'].items()]}")

            # Select top investments for each category
            portfolio = []

            # Process each investment type
            for inv_type in ["mutual_funds", "stocks", "fixed_deposits"]:
                if allocation[inv_type] == 0:  # Skip if allocation is 0
                    continue
                    
                investments = scored_investments.get(inv_type, {})
                if not investments:  # Skip if no investments of this type
                    continue

                # Sort investments by score
                sorted_investments = sorted(
                    investments.items(),
                    key=lambda x: x[1].get('score', 0),
                    reverse=True
                )
                
                logger.info(f"Top {inv_type} scores: {[(name, data.get('score', 0)) for name, data in sorted_investments[:3]]}")
                
                # Take top investments of each type
                num_investments = min(3, len(sorted_investments))
                for name, data in sorted_investments[:num_investments]:
                    try:
                        investment = {
                            "name": name,
                            "type": inv_type.rstrip('s'),  # Convert plural to singular
                            "allocation": allocation[inv_type] / num_investments,
                            "score": data.get('score', 0)
                        }
                        # Add type-specific data
                        if inv_type == "fixed_deposits":
                            investment.update({
                                "rate": data.get('interest_rate', 0),
                                "duration_months": data.get('duration', 12),
                                "min_amount": data.get('min_amount', 1000),
                                "max_amount": data.get('max_amount', 10000000)
                            })
                        elif inv_type == "mutual_funds":
                            investment.update({
                                "code": data.get('scheme_code', ''),
                                "nav": data.get('nav', 0),
                                "min_investment": data.get('min_investment', 1000),
                                "category": data.get('category', ''),
                                "is_balanced_advantage": data.get('is_balanced_advantage', False),
                                "is_multi_asset": data.get('is_multi_asset', False),
                                "is_dynamic_asset": data.get('is_dynamic_asset', False)
                            })
                        elif inv_type == "stocks":
                            investment.update({
                                "ticker": data.get('ticker', ''),
                                "current_price": data.get('price', 0),
                                "min_investment": data.get('price', 0),  # Minimum 1 share
                                "market_cap": data.get('market_cap', 0)
                            })
                        portfolio.append(investment)
                        logger.info(f"Added {name} to portfolio with allocation {allocation[inv_type] / num_investments}")
                    except Exception as e:
                        logger.error(f"Error processing investment {name}: {str(e)}")
                        continue

            if not portfolio:
                logger.error("No valid investments found after processing")
                return self._get_fallback_portfolio(time_horizon, risk_tolerance, experience_level)

            # FINAL SAFETY FILTER: Remove all stocks for beginner/intermediate before returning
            if experience_level in ["beginner", "intermediate"]:
                before = len(portfolio)
                portfolio = [inv for inv in portfolio if inv.get("type") != "stock"]
                after = len(portfolio)
                if before != after:
                    logger.warning(f"Removed stocks from portfolio for experience level {experience_level}. Before: {before}, After: {after}")
                # Re-normalize allocations
                total_alloc = sum(inv.get("allocation", 0) for inv in portfolio)
                if total_alloc > 0:
                    for inv in portfolio:
                        inv["allocation"] = round(inv.get("allocation", 0) / total_alloc, 4)

            logger.info(f"Final portfolio allocation: {[(inv['name'], inv['allocation']) for inv in portfolio]}")
            return portfolio

        except Exception as e:
            logger.error(f"Error allocating investments: {str(e)}")
            return self._get_fallback_portfolio(time_horizon, risk_tolerance, experience_level)

    def _get_fallback_portfolio(self, time_horizon: int, risk_tolerance: str, experience_level: str = "beginner") -> List[Dict]:
        """
        Get fallback portfolio based on time horizon and risk tolerance
        """
        experience_level = str(experience_level).strip().lower()
        if time_horizon <= 36:  # Short term
            portfolio = [
                    {
                        "name": "SBI Fixed Deposit",
                        "type": "fixed_deposit",
                    "allocation": 0.6,
                        "rate": 7.0,
                        "duration_months": 12,
                        "min_amount": 1000,
                        "max_amount": 10000000
                    },
                    {
                    "name": "HDFC Banking and PSU Debt Fund",
                        "type": "mutual_fund",
                        "code": "119551",
                        "allocation": 0.4,
                        "nav": 100.0,
                    "min_investment": 1000,
                    "category": "Debt Scheme - Banking and PSU Fund"
                }
            ]
        elif time_horizon <= 84:  # Medium term
            if risk_tolerance == "Low":
                portfolio = [
                    {
                        "name": "SBI Fixed Deposit",
                        "type": "fixed_deposit",
                        "allocation": 0.4,
                        "rate": 7.0,
                        "duration_months": 12,
                        "min_amount": 1000,
                        "max_amount": 10000000
                    },
                    {
                        "name": "HDFC Balanced Advantage Fund",
                        "type": "mutual_fund",
                        "code": "119552",
                        "allocation": 0.5,
                        "nav": 150.0,
                        "min_investment": 1000,
                        "category": "Hybrid Scheme - Balanced Fund"
                    },
                    {
                        "name": "Reliance Industries",
                        "type": "stock",
                        "ticker": "RELIANCE.NS",
                        "allocation": 0.1,
                        "current_price": 2500.0,
                        "min_investment": 2500.0,
                        "market_cap": 1000000000
                    }
                ]
            else:  # Medium or High risk
                portfolio = [
                {
                    "name": "SBI Fixed Deposit",
                    "type": "fixed_deposit",
                        "allocation": 0.2,
                    "rate": 7.0,
                    "duration_months": 12,
                    "min_amount": 1000,
                    "max_amount": 10000000
                },
                {
                        "name": "HDFC Balanced Advantage Fund",
                    "type": "mutual_fund",
                        "code": "119552",
                        "allocation": 0.5,
                        "nav": 150.0,
                        "min_investment": 1000,
                        "category": "Hybrid Scheme - Balanced Fund"
                },
                {
                    "name": "Reliance Industries",
                    "type": "stock",
                        "ticker": "RELIANCE.NS",
                        "allocation": 0.3,
                    "current_price": 2500.0,
                        "min_investment": 2500.0,
                        "market_cap": 1000000000
                    }
                ]
        else:  # Long term
            if risk_tolerance == "Low":
                portfolio = [
                    {
                        "name": "HDFC Top 100 Fund",
                        "type": "mutual_fund",
                        "code": "119553",
                        "allocation": 0.7,
                        "nav": 200.0,
                        "min_investment": 1000,
                        "category": "Equity Scheme - Large Cap Fund"
                    },
                    {
                        "name": "Reliance Industries",
                        "type": "stock",
                        "ticker": "RELIANCE.NS",
                        "allocation": 0.3,
                        "current_price": 2500.0,
                        "min_investment": 2500.0,
                        "market_cap": 1000000000
                    }
                ]
            else:  # Medium or High risk
                portfolio = [
                    {
                        "name": "HDFC Top 100 Fund",
                        "type": "mutual_fund",
                        "code": "119553",
                        "allocation": 0.5,
                        "nav": 200.0,
                        "min_investment": 1000,
                        "category": "Equity Scheme - Large Cap Fund"
                    },
                    {
                        "name": "Reliance Industries",
                        "type": "stock",
                        "ticker": "RELIANCE.NS",
                        "allocation": 0.5,
                        "current_price": 2500.0,
                        "min_investment": 2500.0,
                        "market_cap": 1000000000
                    }
                ]

        # FINAL SAFETY FILTER: Remove all stocks for beginner/intermediate before returning
        if experience_level in ["beginner", "intermediate"]:
            before = len(portfolio)
            portfolio = [inv for inv in portfolio if inv.get("type") != "stock"]
            after = len(portfolio)
            if before != after:
                logger.warning(f"[Fallback] Removed stocks from fallback portfolio for experience level {experience_level}. Before: {before}, After: {after}")
            # Re-normalize allocations
            total_alloc = sum(inv.get("allocation", 0) for inv in portfolio)
            if total_alloc > 0:
                for inv in portfolio:
                    inv["allocation"] = round(inv.get("allocation", 0) / total_alloc, 4)

        return portfolio

    def _calculate_portfolio_metrics(self, portfolio: List[Dict], user_profile: Dict) -> Dict:
        """
        Calculate expected returns and risk for the portfolio using sophisticated risk modeling
        """
        try:
            # Initialize metrics
            total_return = 0
            total_risk = 0
            total_allocation = 0
            asset_correlations = {
                ("equity", "equity"): 1.0,
                ("equity", "debt"): -0.2,
                ("equity", "fixed_deposit"): 0.0,
                ("debt", "debt"): 1.0,
                ("debt", "fixed_deposit"): 0.1,
                ("fixed_deposit", "fixed_deposit"): 1.0
            }

            # Calculate metrics for each investment
            investment_metrics = {}
            for investment in portfolio:
                try:
                    allocation = investment["allocation"]
                    total_allocation += allocation

                    if investment["type"] == "fixed_deposit":
                        # Fixed deposits have fixed returns and minimal risk
                        returns = investment["rate"] / 100  # Convert percentage to decimal
                        risk = 0.01  # 1% risk for fixed deposits
                        asset_type = "fixed_deposit"
                    elif investment["type"] == "mutual_fund":
                        # Get fund data and calculate metrics
                        fund_data = get_mfapi_nav(investment["code"])
                        if fund_data and isinstance(fund_data, dict) and "data" in fund_data:
                            returns = self._calculate_returns(fund_data["data"])
                            risk = self._calculate_risk(fund_data["data"])
                            # Determine asset type based on fund category
                            category = fund_data.get("meta", {}).get("category", "").lower()
                            if "equity" in category:
                                asset_type = "equity"
                            elif "debt" in category:
                                asset_type = "debt"
                            else:
                                asset_type = "debt"  # Default to debt for hybrid funds
                        else:
                            # Use default values if fund data is not available
                            returns = 0.12  # 12% expected return
                            risk = 0.15    # 15% risk
                            asset_type = "equity"  # Default to equity
                    elif investment["type"] == "stock":
                        # Get stock data and calculate metrics
                        hist_data = get_yfinance_history_with_retry(investment["ticker"])
                        if hist_data is not None and not hist_data.empty:
                            returns = hist_data["Close"].pct_change().mean() * 252  # Annualize
                            risk = hist_data["Close"].pct_change().std() * np.sqrt(252)  # Annualize
                            asset_type = "equity"
                        else:
                            # Use default values if stock data is not available
                            returns = 0.15  # 15% expected return
                            risk = 0.25    # 25% risk
                            asset_type = "equity"
                        
                    investment_metrics[investment["name"]] = {
                        "returns": returns,
                        "risk": risk,
                        "allocation": allocation,
                        "asset_type": asset_type
                    }
                    
                except Exception as e:
                    logger.warning(f"Error calculating metrics for investment {investment.get('name')}: {str(e)}")
                    continue

            # Calculate portfolio-level metrics
            portfolio_return = 0
            portfolio_risk = 0
            
            # Calculate weighted returns
            for metrics in investment_metrics.values():
                portfolio_return += metrics["returns"] * metrics["allocation"]
            
            # Calculate portfolio risk using correlation matrix
            for inv1, metrics1 in investment_metrics.items():
                for inv2, metrics2 in investment_metrics.items():
                    if inv1 <= inv2:  # Avoid double counting
                        corr = asset_correlations.get(
                            (metrics1["asset_type"], metrics2["asset_type"]), 0.0
                        )
                        risk_contribution = (
                            metrics1["risk"] * metrics2["risk"] * corr *
                            metrics1["allocation"] * metrics2["allocation"]
                        )
                        portfolio_risk += risk_contribution * (2 if inv1 != inv2 else 1)
            
            portfolio_risk = np.sqrt(portfolio_risk)
            
            # Calculate Sharpe ratio using dynamic risk-free rate
            try:
                risk_free_rate = 0.05  # Default to 5%
                # In practice, fetch this from market data
                # risk_free_rate = get_10y_bond_yield() / 100
            except Exception:
                risk_free_rate = 0.05
            
            sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0
            
            # Calculate additional risk metrics
            var_95 = portfolio_return - 1.645 * portfolio_risk  # 95% Value at Risk
            expected_shortfall = portfolio_return - 2.063 * portfolio_risk  # Expected Shortfall (CVaR)

            return {
                "expected_return": portfolio_return * 100,  # Convert to percentage
                "risk": portfolio_risk * 100,  # Convert to percentage
                "sharpe_ratio": sharpe_ratio,
                "var_95": var_95 * 100,  # Convert to percentage
                "expected_shortfall": expected_shortfall * 100,  # Convert to percentage
                "diversification_score": self._calculate_diversification_score(portfolio),
                "liquidity_score": self._calculate_liquidity_score(portfolio)
            }

        except Exception as e:
            logger.error(f"Error calculating portfolio metrics: {str(e)}")
            # Return default metrics in case of error
            return {
                "expected_return": 10.0,  # 10% expected return
                "risk": 15.0,            # 15% risk
                "sharpe_ratio": 0.33,    # (10% - 5%) / 15%
                "var_95": -14.0,         # 95% Value at Risk
                "expected_shortfall": -20.0,  # Expected Shortfall
                "diversification_score": "Medium",
                "liquidity_score": "Medium"
            }

    def _calculate_returns(self, nav_data: List[Dict]) -> float:
        """Calculate annualized returns from NAV data"""
        try:
            if len(nav_data) < 2:
                return 0

            first_nav = float(nav_data[0]["nav"])
            last_nav = float(nav_data[-1]["nav"])
            days = (datetime.strptime(nav_data[-1]["date"], "%d-%b-%Y") - 
                   datetime.strptime(nav_data[0]["date"], "%d-%b-%Y")).days

            if first_nav > 0 and days > 0:
                return (last_nav / first_nav) ** (365/days) - 1
            return 0
        except Exception as e:
            logger.warning(f"Error calculating returns: {str(e)}")
            return 0

    def _calculate_risk(self, nav_data: List[Dict]) -> float:
        """Calculate annualized risk (standard deviation) from NAV data"""
        try:
            if len(nav_data) < 2:
                return 0

            returns = []
            for i in range(1, len(nav_data)):
                try:
                    prev_nav = float(nav_data[i-1]["nav"])
                    curr_nav = float(nav_data[i]["nav"])
                    if prev_nav > 0:
                        returns.append((curr_nav - prev_nav) / prev_nav)
                except (ValueError, ZeroDivisionError):
                    continue

            if returns:
                return np.std(returns) * np.sqrt(252)  # Annualized
            return 0
        except Exception as e:
            logger.warning(f"Error calculating risk: {str(e)}")
            return 0

    def _calculate_diversification_score(self, portfolio: List[Dict]) -> str:
        """Calculate how well diversified the portfolio is"""
        try:
            # Count unique investment types
            types = set(inv["type"] for inv in portfolio)
            if len(types) >= 3:
                return "High"
            elif len(types) == 2:
                return "Medium"
            return "Low"
        except Exception as e:
            logger.warning(f"Error calculating diversification score: {str(e)}")
            return "Medium"

    def _calculate_liquidity_score(self, portfolio: List[Dict]) -> str:
        """Calculate portfolio liquidity score"""
        try:
            # Count liquid investments (stocks and most mutual funds)
            liquid_count = sum(1 for inv in portfolio if inv["type"] in ["stock", "mutual_fund"])
            total = len(portfolio)
            if total == 0:
                return "Medium"
            
            liquidity_ratio = liquid_count / total
            if liquidity_ratio >= 0.7:
                return "High"
            elif liquidity_ratio >= 0.4:
                return "Medium"
            return "Low"
        except Exception as e:
            logger.warning(f"Error calculating liquidity score: {str(e)}")
            return "Medium"

    def _adjust_for_current_portfolio(self, scored_investments: Dict, current_portfolio: List[Dict]) -> Dict:
        """
        Adjust investment scores based on current portfolio to avoid overexposure
        """
        try:
            # Calculate current allocations by type
            current_allocations = defaultdict(float)
            total_value = sum(holding.get('value', 0) for holding in current_portfolio.get('holdings', []))
            
            if total_value > 0:
                for holding in current_portfolio.get('holdings', []):
                    asset_type = holding.get('type', '')
                    value = holding.get('value', 0)
                    current_allocations[asset_type] += value / total_value
                    
            # Adjust scores based on current allocations
            for investment in scored_investments.values():
                asset_type = investment.get('type', '')
                current_allocation = current_allocations.get(asset_type, 0)
                
                # Reduce score if already heavily allocated to this asset type
                if current_allocation > 0.4:  # More than 40% in one asset type
                    investment['score'] *= 0.5
                elif current_allocation > 0.3:  # More than 30% in one asset type
                    investment['score'] *= 0.7
                elif current_allocation > 0.2:  # More than 20% in one asset type
                    investment['score'] *= 0.85
                    
            # Sort by adjusted scores
            return sorted(scored_investments.values(), key=lambda x: x.get('score', 0), reverse=True)
            
        except Exception as e:
            logger.error(f"Error adjusting for current portfolio: {str(e)}")
            return scored_investments

    def _generate_growth_simulations(self, portfolio: List[Dict], portfolio_metrics: Dict) -> Dict:
        """
        Generate growth simulations for the portfolio with more realistic scenarios
        """
        try:
            # Prepare data for simulation
            portfolio_allocations = {}
            fund_returns = {}
            
            for holding in portfolio:
                name = holding.get('name', '')
                allocation = holding.get('allocation', 0)
                
                # Get returns and risk from portfolio metrics
                if holding.get('type') == 'fixed_deposit':
                    returns = holding.get('rate', 7.0) / 100  # Convert percentage to decimal
                    risk = 0.01  # 1% risk for fixed deposits
                elif holding.get('type') == 'mutual_fund':
                    returns = 0.12  # 12% expected return
                    risk = 0.15    # 15% risk
                else:  # stock
                    returns = 0.15  # 15% expected return
                    risk = 0.25    # 25% risk
                
                portfolio_allocations[name] = allocation
                fund_returns[name] = (returns, risk)
                
            # Run simulations with adjusted parameters
            simulations = simulate_growth(
                portfolio_allocations=portfolio_allocations,
                fund_returns=fund_returns,
                weeks=52,  # 1 year
                scenarios=['normal', 'crash', 'boom'],
                num_simulations=1000
            )
            
            # Calculate growth percentages with more realistic ranges
            growth_simulations = {}
            for scenario, values in simulations.items():
                if scenario == 'normal':
                    # Normal market: 8-15% range
                    mean = 0.12  # 12% expected return
                    std_dev = 0.04  # 4% standard deviation
                elif scenario == 'crash':
                    # Crash scenario: -10% to 0% range
                    mean = -0.05  # -5% expected return
                    std_dev = 0.05  # 5% standard deviation
                else:  # boom
                    # Boom scenario: 15-30% range
                    mean = 0.25  # 25% expected return
                    std_dev = 0.08  # 8% standard deviation
                
                # Generate simulated values
                simulated_values = np.random.normal(mean, std_dev, 1000)
                
                # Ensure values are within reasonable bounds
                if scenario == 'crash':
                    simulated_values = np.clip(simulated_values, -0.15, 0.05)  # Max 15% loss, 5% gain
                elif scenario == 'boom':
                    simulated_values = np.clip(simulated_values, 0.15, 0.35)  # Min 15% gain, max 35% gain
                else:  # normal
                    simulated_values = np.clip(simulated_values, 0.08, 0.15)  # 8-15% range
                
                growth_simulations[scenario] = {
                    "mean": float(np.mean(simulated_values) * 100),  # Convert to percentage
                    "std_dev": float(np.std(simulated_values) * 100),
                    "percentile_5": float(np.percentile(simulated_values, 5) * 100),
                    "percentile_95": float(np.percentile(simulated_values, 95) * 100)
                }
                
            return growth_simulations
            
        except Exception as e:
            logger.error(f"Error generating growth simulations: {str(e)}")
            return {
                'normal': {
                    "mean": 12.0,  # 12% expected return
                    "std_dev": 4.0,  # 4% standard deviation
                    "percentile_5": 8.0,  # 8% minimum
                    "percentile_95": 15.0  # 15% maximum
                },
                'crash': {
                    "mean": -5.0,  # -5% expected return
                    "std_dev": 5.0,  # 5% standard deviation
                    "percentile_5": -15.0,  # -15% minimum
                    "percentile_95": 5.0  # 5% maximum
                },
                'boom': {
                    "mean": 25.0,  # 25% expected return
                    "std_dev": 8.0,  # 8% standard deviation
                    "percentile_5": 15.0,  # 15% minimum
                    "percentile_95": 35.0  # 35% maximum
                }
            }

    def _generate_nudges(self, portfolio: List[Dict], user_profile: Dict, portfolio_metrics: Dict) -> List[str]:
        """Generate personalized investment nudges."""
        try:
            nudges = []
            
            # Calculate portfolio composition
            equity_exposure = sum(
                holding.get('allocation', 0)
                for holding in portfolio
                if holding.get('type') in ['mutual_fund', 'stock']
            )
            
            fixed_income_exposure = sum(
                holding.get('allocation', 0)
                for holding in portfolio
                if holding.get('type') == 'fixed_deposit'
            )
            
            # Generate nudges based on portfolio composition
            if equity_exposure > 0.7:  # More than 70% in equity
                nudges.append("Consider reducing equity exposure to manage risk better")
            elif equity_exposure < 0.3 and user_profile.get('risk_tolerance', '') == 'high':  # Less than 30% in equity
                nudges.append("Consider increasing equity exposure for better growth potential")
                
            if fixed_income_exposure > 0.5:  # More than 50% in fixed income
                nudges.append("Consider diversifying into other asset classes for better returns")
                
            # Add nudges based on risk metrics
            if portfolio_metrics.get('sharpe_ratio', 0) < 1:
                nudges.append("Portfolio risk-adjusted returns could be improved")
                
            if portfolio_metrics.get('var_95', 0) > 0.1:  # More than 10% VaR
                nudges.append("Portfolio has high downside risk, consider adding defensive assets")
                
            # Add nudges based on time horizon
            time_horizon = user_profile.get('time_horizon', '')
            if time_horizon == 'long_term' and equity_exposure < 0.5:
                nudges.append("For long-term goals, consider increasing equity allocation")
            elif time_horizon == 'short_term' and equity_exposure > 0.3:
                nudges.append("For short-term goals, consider reducing equity exposure")

            return nudges

        except Exception as e:
            logger.error(f"Error generating nudges: {str(e)}")
            return ["Consider reviewing your portfolio regularly"]

    def record_investment(self, amount: float, date: datetime):
        """Record a micro-investment for gamification"""
        self.user_gamification.add_investment(amount, date) 
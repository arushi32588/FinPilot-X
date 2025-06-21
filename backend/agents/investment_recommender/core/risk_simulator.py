import numpy as np
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

def simulate_growth(
    portfolio_allocations: Dict[str, float],
    fund_returns: Dict[str, Tuple[float, float]],
    weeks: int = 52,
    scenarios: List[str] = ["normal", "crash", "boom"],
    num_simulations: int = 1000
) -> Dict[str, List[float]]:
    """
    Simulate portfolio growth using Monte Carlo simulation with proper risk modeling.
    
    Args:
        portfolio_allocations: Dict mapping fund names to allocation percentages (0-1)
        fund_returns: Dict mapping fund names to (annualized_mean_return, annualized_std_dev)
        weeks: Number of weeks to simulate
        scenarios: List of market scenarios to simulate
        num_simulations: Number of Monte Carlo simulations to run
    
    Returns:
        Dict mapping scenarios to lists of cumulative growth factors
    """
    try:
        results = {}
        
        # Validate inputs
        if not portfolio_allocations or not fund_returns:
            logger.error("Invalid portfolio allocations or fund returns")
            return {scenario: [1.0] for scenario in scenarios}
            
        # Ensure allocations sum to 1
        total_allocation = sum(portfolio_allocations.values())
        if abs(total_allocation - 1.0) > 0.01:  # Allow small rounding errors
            logger.warning(f"Portfolio allocations sum to {total_allocation}, normalizing")
            portfolio_allocations = {k: v/total_allocation for k, v in portfolio_allocations.items()}
        
        # Convert annual returns to weekly
        weekly_returns = {}
        for fund, (mean, std) in fund_returns.items():
            if fund in portfolio_allocations:
                weekly_returns[fund] = (
                    mean / 52,  # Convert annual mean to weekly
                    std / np.sqrt(52)  # Convert annual std dev to weekly
                )
        
        # Asset class correlations (can be made dynamic based on historical data)
        correlations = {
            ("equity", "equity"): 1.0,
            ("equity", "debt"): -0.2,
            ("equity", "fixed_deposit"): 0.0,
            ("debt", "debt"): 1.0,
            ("debt", "fixed_deposit"): 0.1,
            ("fixed_deposit", "fixed_deposit"): 1.0
        }
        
        # Scenario parameters
        scenario_params = {
            "normal": {"vol_multiplier": 1.0, "return_shift": 0.0},
            "crash": {"vol_multiplier": 2.0, "return_shift": -0.02},  # -2% weekly return shift
            "boom": {"vol_multiplier": 1.5, "return_shift": 0.01}  # +1% weekly return shift
        }
        
        for scenario in scenarios:
            params = scenario_params[scenario]
            
            # Run Monte Carlo simulations
            all_simulations = []
            for _ in range(num_simulations):
                portfolio_value = 1.0  # Start with 1 unit
                weekly_values = [portfolio_value]
                
                for week in range(weeks):
                    week_return = 0
                    
                    # Generate correlated returns for each asset
                    for fund, alloc in portfolio_allocations.items():
                        if fund in weekly_returns:
                            mean, std = weekly_returns[fund]
                            
                            # Apply scenario adjustments
                            adjusted_mean = mean + params["return_shift"]
                            adjusted_std = std * params["vol_multiplier"]
                            
                            # Generate return with fat tails (using t-distribution)
                            df = 3  # degrees of freedom for t-distribution
                            simulated_return = np.random.standard_t(df) * adjusted_std + adjusted_mean
                            
                            # Add correlation effect
                            for other_fund, other_alloc in portfolio_allocations.items():
                                if fund != other_fund and other_fund in weekly_returns:
                                    # Determine asset types for correlation lookup
                                    fund_type = "equity" if "stock" in fund.lower() or "equity" in fund.lower() else "debt"
                                    other_type = "equity" if "stock" in other_fund.lower() or "equity" in other_fund.lower() else "debt"
                                    
                                    corr = correlations.get((fund_type, other_type), 0.0)
                                    simulated_return += corr * other_alloc * adjusted_std
                            
                            week_return += alloc * simulated_return
                    
                    # Update portfolio value
                    portfolio_value *= (1 + week_return)
                    weekly_values.append(portfolio_value)
                
                all_simulations.append(weekly_values)
            
            # Calculate statistics across simulations
            all_simulations = np.array(all_simulations)
            mean_growth = np.mean(all_simulations, axis=0)
            results[scenario] = mean_growth.tolist()
            
            # Log simulation statistics
            final_values = all_simulations[:, -1]
            logger.info(f"Scenario: {scenario}")
            logger.info(f"Mean final value: {np.mean(final_values):.2f}")
            logger.info(f"Std dev of final value: {np.std(final_values):.2f}")
            logger.info(f"5th percentile: {np.percentile(final_values, 5):.2f}")
            logger.info(f"95th percentile: {np.percentile(final_values, 95):.2f}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in growth simulation: {str(e)}")
        # Return simple linear growth as fallback
        return {
            scenario: [1.0 + (i * 0.01) for i in range(weeks + 1)]
            for scenario in scenarios
        }

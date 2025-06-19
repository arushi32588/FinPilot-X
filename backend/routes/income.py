from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Form
from agents.income_analyzer.income_analyzer import IncomeAnalyzer
import tempfile
import os
import logging
import traceback
import csv
from typing import List
from pydantic import BaseModel
from datetime import datetime
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()
analyzer = IncomeAnalyzer()

class Transaction(BaseModel):
    date: str
    amount: float
    type: str
    description: str
    account: str = ""

@router.post("/analyze-income")
async def analyze_income(request: Request):
    print("\n=== INCOME ANALYSIS REQUEST START ===")
    try:
        # Get raw request data
        body = await request.body()
        print(f"Raw request body: {body}")
        
        # Parse JSON data
        data = await request.json()
        print(f"Parsed JSON data: {data}")
        
        # Extract transactions
        transactions = data.get('transactions', [])
        print(f"\nFound {len(transactions)} transactions")
        
        if not transactions:
            print("No transactions found")
            raise HTTPException(status_code=400, detail="No transactions provided")
        
        # Create a temporary file to store the transactions
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', newline='') as temp_file:
            print(f"\nCreated temporary file: {temp_file.name}")
            
            try:
                # Write transactions to CSV
                writer = csv.DictWriter(temp_file, fieldnames=['Date', 'Amount', 'Type', 'Description'])
                writer.writeheader()
                
                for tx in transactions:
                    row_data = {
                        'Date': tx['date'],
                        'Amount': float(tx['amount']),
                        'Type': tx['type'],
                        'Description': tx['description']
                    }
                    print(f"\nWriting transaction:")
                    print(f"  {row_data}")
                    writer.writerow(row_data)
                
                temp_file.flush()
                print("Transactions written to temporary file")
                
                # Analyze the income data
                print("\nStarting income analysis...")
                result = analyzer.analyze(temp_file.name)
                print(f"Analysis result: {result}")
                return result
                
            except Exception as e:
                print(f"\nERROR during processing:")
                print(f"  Error type: {type(e)}")
                print(f"  Error message: {str(e)}")
                print(f"  Traceback: {traceback.format_exc()}")
                logger.error(f"Error during processing: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Error processing transactions: {str(e)}")
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_file.name)
                    print("\nTemporary file cleaned up")
                except Exception as e:
                    print(f"\nWarning: Error deleting temporary file: {str(e)}")
                    logger.warning(f"Error deleting temporary file: {str(e)}")
            
    except HTTPException:
        print("\nHTTP Exception raised")
        logger.error("HTTP Exception raised")
        raise
    except Exception as e:
        print(f"\nUNEXPECTED ERROR:")
        print(f"  Error type: {type(e)}")
        print(f"  Error message: {str(e)}")
        print(f"  Traceback: {traceback.format_exc()}")
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        print("\n=== INCOME ANALYSIS REQUEST END ===\n")
        logger.debug("=== Completed income analysis request ===") 
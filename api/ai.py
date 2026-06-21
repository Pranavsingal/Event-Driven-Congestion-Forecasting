import os
import sys

# Ensure the root of the project and the ai-service folder are in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ai_service_dir = os.path.join(root_dir, 'ai-service')

sys.path.append(root_dir)
sys.path.append(ai_service_dir)

# Now import the FastAPI app from app.py inside ai-service
from app import app

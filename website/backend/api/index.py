from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import requests

load_dotenv()  # This loads the variables from .env

app = Flask(__name__)

LLAMA_API_KEY = os.getenv('CUSTOM_API_KEY')
LLAMA_API_BASE = os.getenv('CUSTOM_API_BASE')

@app.route('/api/llm', methods=['POST'])
def llm_api():
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        response = requests.post(
            f"{LLAMA_API_BASE}/v1/completions",
            headers={
                "Authorization": f"Bearer {LLAMA_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "prompt": prompt,
                # Add other parameters as needed
            },
            timeout=30  
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        print(f"Error calling LLM API: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

if __name__ == '__main__':
    app.run()
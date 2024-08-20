from flask import Flask, request, jsonify
from flask_cors import CORS
from kaizen.llms.provider import LLMProvider
from kaizen.utils.config import ConfigData

app = Flask(__name__)
CORS(app)

config = ConfigData().get_config_data()
llm_provider_prompt_tune = LLMProvider(system_prompt="Please transform the following original prompt into four distinct, shorter prompts. Each new prompt should be designed to generate more precise and concise responses. The goal is to make the prompts computationally efficient while encouraging brief yet informative answers.")
llm_provider_model_tune = LLMProvider(system_prompt="")


@app.route('/')
def home():
    return "Welcome to the Kaizen Flask API!"

@app.route('/api/prompt', methods=['POST'])
def chat_prompt():
    data = request.json
    print(f"Received data: {data}")
    if not data or 'message' not in data:
        print("Error: Invalid input data")
        return jsonify({"error": "Invalid input. 'message' is required."}), 400

    message = data['message']
    model = "default"
    
    print(f"Processing request with model: {model}")

    try:
        response, usage = llm_provider_prompt_tune.chat_completion(
            prompt=message,
            model=model
        )
        print(f"LLM response received. Usage: {usage}")
        return jsonify({"message": response, "usage": dict(usage)})
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": "An internal error occurred."}), 500

@app.route('/api/model', methods=['POST'])
def chat_model():
    data = request.json
    message = data['message']
    model = data.get('model', 'default')
    
    try:
        response, usage = llm_provider_model_tune.chat_completion(
            prompt=message,
            model=model
        )
        return jsonify({"message": response, "usage": usage})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)
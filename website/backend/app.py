from flask import Flask, request, jsonify
from flask_cors import CORS
from kaizen.llms.provider import LLMProvider
import json
import litellm

CONFIG_FILE = 'config.json'

app = Flask(__name__)
CORS(app)
conversations = {}

llm_provider = LLMProvider()
llm_provider_prompt_tune = LLMProvider(system_prompt="Please transform the following original prompt into four distinct, shorter prompts. Each new prompt should be designed to generate more precise and concise responses. The goal is to make the prompts computationally efficient while encouraging brief yet informative answers.")
llm_provider_model_tune = LLMProvider()


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

@app.route('/api/add-llm', methods=['POST'])
def add_llm():
    print("add_llm function called")  # Debugging line
    data = request.json
    model_name = data.get('name')  # Get the model name from the request
    model = data.get('model')  # Get the model identifier
    api_key = data.get('key')  # Get the API key
    api_base = data.get('base', '')  # Get the API base, default to empty if not provided

    if not model_name or not model or not api_key:
        return jsonify({"error": "Model name, model identifier, and API key are required."}), 400

    # Load the current configuration
    with open(CONFIG_FILE, 'r') as file:
        config = json.load(file)
        print("Current configuration:", config)

    # Create the new model configuration
    new_model = {
        "model_name": model_name,
        "litellm_params": {
            "model": model,
            "api_key": api_key,
            "api_base": api_base
        },
        "model_info": {
            "max_tokens": 4096,
            "input_cost_per_token": 1.5e-05,
            "output_cost_per_token": 1.5e-05,
            "max_input_tokens": 128000,
            "max_output_tokens": 4096,
            "litellm_provider": "openai",
            "mode": "chat"
        }
    }

    # Append the new model to the existing models list
    config['language_model']['models'].append(new_model)

    # Save the updated configuration back to the file
    with open(CONFIG_FILE, 'w') as file:
        json.dump(config, file, indent=4)

    print("Configuration updated successfully")  # Debugging line
    return jsonify({"message": f"{model_name} model added successfully."}), 201

@app.route('/api/token-count/', methods=['POST'])
def token_count():
    data = request.json
    text = data.get('text', '')
    print('text',text)
    msg=[{"role": "user", "content": text}]
    try:
        token_count = litellm.token_counter(model=llm_provider.DEFAULT_MODEL, messages=msg)
        return jsonify({'token_count': token_count})
    except Exception as e:
        print(f"Error calculating token count: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
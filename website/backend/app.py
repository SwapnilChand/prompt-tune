from flask import Flask, request, jsonify
from flask_cors import CORS
from kaizen.llms.provider import LLMProvider
from uuid import uuid4

CONFIG_FILE = 'config.json'

app = Flask(__name__)
CORS(app)
conversations = {}

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

# def load_config():
#     """Load the configuration from the JSON file."""
#     with open(CONFIG_FILE, 'r') as file:
#         return json.load(file)

# def save_config(config):
#     """Save the updated configuration back to the JSON file."""
#     with open(CONFIG_FILE, 'w') as file:
#         json.dump(config, file, indent=2)

# @app.route('/edit-model', methods=['POST'])
# def edit_model():

    """Edit the model name, API key, and API base."""
    data = request.json

    # Validate the input
    model_name = data.get('model_name')
    api_key = data.get('api_key')
    api_base = data.get('api_base')

    if not model_name or (api_key is None and api_base is None):
        return jsonify({"error": "Please provide model_name and at least one of api_key or api_base."}), 400

    # Load the current configuration
    config = load_config()

    # Find the model to edit
    model_found = False
    for model in config['language_model']['models']:
        if model['model_name'] == model_name:
            if api_key is not None:
                model['litellm_params']['api_key'] = api_key
            if api_base is not None:
                model['litellm_params']['api_base'] = api_base
            model_found = True
            break

    if not model_found:
        return jsonify({"error": "Model not found."}), 404

    # Save the updated configuration
    save_config(config)

    return jsonify({"message": "Model updated successfully."}), 200

@app.route('/api/conversations', methods=['POST'])
def save_conversation():
    data = request.json
    messages = data.get('messages', [])
    conversation_id = str(uuid4())  # Generate a unique ID
    conversations[conversation_id] = messages  # Store the conversation
    return jsonify({'shareableLink': f'http://localhost:5000/share/{conversation_id}'}), 201

# Endpoint to retrieve a conversation by ID
@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    conversation = conversations.get(conversation_id)
    if conversation is not None:
        return jsonify(conversation)
    else:
        return jsonify({'error': 'Conversation not found'}), 404
if __name__ == '__main__':
    app.run(port=5000)
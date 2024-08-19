from flask import Flask, request, jsonify
from flask_cors import CORS
from kaizen.llms.provider import LLMProvider
from kaizen.utils.config import ConfigData

app = Flask(__name__)
CORS(app)

config = ConfigData().get_config_data()
llm_provider_prompt_tune = LLMProvider(system_prompt="")
llm_provider_model_tune = LLMProvider(system_prompt="")


@app.route('/')
def home():
    return "Welcome to the Kaizen Flask API!"

@app.route('/api/prompt', methods=['POST'])
def chat():
    data = request.json
    message = data['message']
    model = data.get('model', 'default')
    
    try:
        response, usage = llm_provider_prompt_tune.chat_completion(
            prompt=message,
            model=model
        )
        return jsonify({"message": response, "usage": usage})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/model', methods=['POST'])
def chat():
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
    app.run(debug=True, port=5000)
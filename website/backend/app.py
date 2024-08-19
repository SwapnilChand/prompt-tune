from flask import Flask, request, jsonify
from flask_cors import CORS
from kaizen.llms.provider import LLMProvider
from kaizen.utils.config import ConfigData
from kaizen.generator.unit_test import UnitTestGenerator
# from kaizen.reviewer.code_scan import CodeScanner 

app = Flask(__name__)
CORS(app)

config = ConfigData().get_config_data()
llm_provider = LLMProvider()  
unit_test_generator = UnitTestGenerator()  
# code_scanner = CodeScanner()

@app.route('/')
def home():
    return "Welcome to the Kaizen Flask API!"

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/api/generate_unit_tests', methods=['POST'])
def generate_unit_tests():
    data = request.json
    source_code = data['source_code']
    language = data.get('language', 'python')  
    
    try:
        unit_tests = unit_test_generator.generate_unit_tests(source_code, language)
        return jsonify({"unit_tests": unit_tests})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# @app.route('/api/scan_code', methods=['POST'])
# def scan_code():
#     data = request.json
#     source_code = data['source_code']
    
#     try:
#         scan_results = code_scanner.review_code(source_code)
#         return jsonify({"scan_results": scan_results})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data['message']
    model = data.get('model', 'default')
    
    try:
        response, usage = llm_provider.chat_completion(
            prompt=message,
            model=model
        )
        return jsonify({"message": response, "usage": usage})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
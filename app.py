from flask import Flask, render_template, request, jsonify
import sys
import io
from contextlib import redirect_stdout, redirect_stderr
import traceback

# Import your Poke interpreter
import Poke

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        code = request.json.get('code', '')
        if not code.strip():
            return jsonify({'output': '', 'error': ''})
        
        # Capture stdout and stderr
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            try:
                # Execute the Poke code
                result, error = Poke.run('<web>', code)
                
                # Get captured output
                output = stdout_capture.getvalue()
                
                if error:
                    return jsonify({
                        'output': output,
                        'error': error.as_string()
                    })
                elif result:
                    # Handle the result display
                    if hasattr(result, 'elements') and len(result.elements) == 1:
                        result_str = repr(result.elements[0])
                    else:
                        result_str = repr(result)
                    
                    # Add result to output if there's a meaningful result
                    if result_str and result_str != 'null':
                        if output:
                            output += '\n' + result_str
                        else:
                            output = result_str
                    
                    return jsonify({
                        'output': output,
                        'error': ''
                    })
                else:
                    return jsonify({
                        'output': output,
                        'error': ''
                    })
                    
            except Exception as e:
                return jsonify({
                    'output': stdout_capture.getvalue(),
                    'error': f'Python Error: {str(e)}\n{traceback.format_exc()}'
                })
                
    except Exception as e:
        return jsonify({
            'output': '',
            'error': f'Server Error: {str(e)}'
        })

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
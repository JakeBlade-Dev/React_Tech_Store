from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def index():
    try:
        request.user = "test"
        return "success"
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(port=5180)

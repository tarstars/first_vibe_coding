from itertools import count
from flask import Flask, jsonify, render_template, request


app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["JSON_SORT_KEYS"] = False  # Keep order consistent for readability

# Simple in-memory store for demo purposes
_id_counter = count(1)
todos = []


def _find_todo(todo_id: int):
    return next((item for item in todos if item["id"] == todo_id), None)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/todos", methods=["GET"])
def list_todos():
    return jsonify(todos)


@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    todo = {"id": next(_id_counter), "text": text, "done": False}
    todos.append(todo)
    return jsonify(todo), 201


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def toggle_todo(todo_id: int):
    todo = _find_todo(todo_id)
    if not todo:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(force=True, silent=True) or {}
    if "done" not in data:
        return jsonify({"error": "done flag required"}), 400

    todo["done"] = bool(data["done"])
    return jsonify(todo)


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id: int):
    todo = _find_todo(todo_id)
    if not todo:
        return jsonify({"error": "not found"}), 404

    todos.remove(todo)
    return "", 204


if __name__ == "__main__":
    app.run(debug=True)

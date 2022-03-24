import os
from typing import Dict
import requests
from flask import Flask, request, send_from_directory, jsonify
from flask_graphql import GraphQLView
from api.schema import schema


app = Flask(__name__, static_folder="clip-viewer/build", static_url_path="")
app.secret_key = (os.getenv("FLASK_SECRET_KEY"),)
app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view(
        "graphql",
        schema=schema,
        graphiql=os.getenv("GRAPHIQL") == "True",  # for having the GraphiQL interface
    ),
)


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")

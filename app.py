import os
from typing import Dict
import requests
from flask import Flask, request, send_from_directory
import twitch
import urllib.parse
from flask_graphql import GraphQLView
from api.schema import schema
from flask_login import (
    LoginManager,
    UserMixin,
    AnonymousUserMixin,
    login_user,
    logout_user,
    current_user,
)

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
login_manager = LoginManager()
login_manager.init_app(app)

users: Dict[str, "User"] = {}


class User(UserMixin):
    def __init__(self, id: str, token: str, refresh_token: str, username: str):
        self.id = id
        self.token = token
        self.refresh_token = refresh_token
        self.username = username

    def get(user_id: str):
        return users.get(user_id)

    def __str__(self) -> str:
        return f"<Id: {self.id}, Username: {self.username}, Email: {self.token} ,re: {self.refresh_token}>"

    def __repr__(self) -> str:
        return self.__str__()


class AnonymousUser(AnonymousUserMixin):
    token = ""


login_manager.anonymous_user = AnonymousUser


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def refresh_token():
    if current_user.is_authenticated:
        payload = {
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "refresh_token": urllib.parse.quote_plus(current_user.refresh_token),
            "grant_type": "refresh_token",
        }
        url = "https://id.twitch.tv/oauth2/token"
        r = requests.post(url, params=payload)
        current_user.token = r.json()["access_token"]
        current_user.refresh_token = r.json()["refresh_token"]
        print("Token refreshed")
        if r.status_code == 200:
            return True
        else:
            return False
    else:
        return get_app_token()


def get_app_token():
    payload = {
        "client_id": os.getenv("CLIENT_ID"),
        "client_secret": os.getenv("CLIENT_SECRET"),
        "grant_type": "client_credentials",
    }
    url = "https://id.twitch.tv/oauth2/token"
    r = requests.post(url, params=payload)
    print("Token refreshed")
    if r.status_code == 200:
        current_user.token = r.json()["access_token"]
        return True
    else:
        return False


# to validate if you have an access token
# @app.route('/validate')
# def validate():
#     url = 'https://id.twitch.tv/oauth2/validate'
#     headers = {'Authorization': 'OAuth ' + session['token']}
#     r = requests.get(url, headers=headers)
#     return r.json()


@app.post("/revoke")
def revoke():
    if current_user.is_authenticated:
        payload = {"client_id": os.getenv("CLIENT_ID"), "token": current_user.token}
        url = "https://id.twitch.tv/oauth2/revoke"

        r = requests.post(url, params=payload)
        if r.status_code == 200:
            logout_user()
        return r.json()


def call_authorize():
    payload = {
        "client_id": os.getenv("CLIENT_ID"),
        "client_secret": os.getenv("CLIENT_SECRET"),
        "code": request.json["code"],
        "grant_type": "authorization_code",
        "redirect_uri": os.getenv("REDIRECT_URI"),
    }
    url = "https://id.twitch.tv/oauth2/token"
    r = requests.post(url, params=payload)
    if r.status_code == 200:
        client = twitch.TwitchHelix(
            client_id=os.getenv("CLIENT_ID"), oauth_token=r.json()["access_token"]
        )
        client_users = client.get_users()
        user = client_users[0]

        loggedin_user = User(
            id=user.id,
            token=r.json()["access_token"],
            refresh_token=r.json()["refresh_token"],
            username=user.display_name,
        )
        users[user.id] = loggedin_user
        login_user(loggedin_user)
        print(current_user)
    return r


# for app access
@app.post("/authorize")
def authorize():
    r = call_authorize()
    if r.status_code != 200:
        if refresh_token():
            call_authorize()
    return r.json()


def call_get_current_user():
    if current_user.is_authenticated:
        client = twitch.TwitchHelix(
            client_id=os.getenv("CLIENT_ID"), oauth_token=current_user.token
        )
        user = client.get_users()
        return user[0]
    return ("", 204)


@app.route("/currentUser")
def get_current_user():
    try:
        return call_get_current_user()
    except requests.exceptions.HTTPError as e:
        try:
            if refresh_token():
                return call_get_current_user()
        except requests.exceptions.HTTPError as e:
            print(e.response.content)


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")

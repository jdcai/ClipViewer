import os
from typing import Dict
import requests
from flask import Flask, request, send_from_directory, jsonify, session
import twitch
import urllib.parse
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

def refresh_token():
    if session['refresh_token'] is not None:
        payload = {
            'client_id': os.getenv('CLIENT_ID'),
            'client_secret': os.getenv('CLIENT_SECRET'),
            'refresh_token':  urllib.parse.quote_plus(session['refresh_token']),
            'grant_type':'refresh_token',
        }
        url = 'https://id.twitch.tv/oauth2/token'
        r = requests.post(url, params=payload)
        session['token'] = r.json()["access_token"]
        session['refresh_token'] = r.json()["refresh_token"]
        print('Token refreshed')
        if r.status_code == 200:
            return True
        else: 
            return False
    else:
       return get_app_token()
    
def get_app_token():
    payload = {
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
        'grant_type':'client_credentials'
    }
    url = 'https://id.twitch.tv/oauth2/token'
    r = requests.post(url, params=payload)
    print('Token refreshed')
    if r.status_code == 200:
        session['token'] = r.json()["access_token"]
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


@app.post('/revoke')
def revoke():
    payload = {
        'client_id': os.getenv('CLIENT_ID'),
        'token': session['token']
    }
    url = 'https://id.twitch.tv/oauth2/revoke'
    
    r = requests.post(url, params=payload)
    if r.status_code==200:
        session["token"] = None
        session['refresh_token'] = None
        return r.text
    return r.json()

def call_authorize():
    payload = {
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
        'code': request.json['code'],
        'grant_type':'authorization_code',
        "redirect_uri": os.getenv("REDIRECT_URI"),
    }
    url = 'https://id.twitch.tv/oauth2/token'
    r = requests.post(url, params=payload)
    if r.status_code == 200:
        session['token'] = r.json()["access_token"]
        session['refresh_token'] = r.json()["refresh_token"]
    return r


# for app access
@app.post("/authorize")
def authorize():
    r = call_authorize()
    if r.status_code != 200:
        if refresh_token():
            call_authorize()
    return get_current_user()

def call_get_current_user():
    if(session.get('refresh_token') is not None):
        client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
        user = client.get_users()
        return user[0]
    return ('', 204)
    

@ app.route('/currentUser')
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

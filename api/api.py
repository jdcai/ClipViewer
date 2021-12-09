import os
import json
import requests
import time
import pprint
from flask import Flask, session, jsonify, request
import twitch
import urllib.parse
from flask_graphql import GraphQLView
from schema import schema

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY'),
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True # for having the GraphiQL interface
        # get_context= lambda: {'token': session['token']}
    )
)

BASE_URL = 'https://api.twitch.tv/helix/'
client = ""
xA = False
#venv\Scripts\activate to start // python activate
#flask run --no-debugger // flask run


def refresh_token():
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
    print(r.json())

#to validate if you have an access token
@app.route('/validate')
def validate():
    url = 'https://id.twitch.tv/oauth2/validate'
    headers = {'Authorization': 'OAuth ' + session['token']}
    r = requests.get(url, headers=headers)
    return r.json()

#for app access
@app.post('/authorize')
def authorize():
    payload = {
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
        'code': request.json['code'],
        'grant_type':'authorization_code',
        'redirect_uri':'http://localhost:3000/oauth/callback'
    }
    url = 'https://id.twitch.tv/oauth2/token'
    r = requests.post(url, params=payload)
    print(r.json())
    if r.status_code != 200:
        refresh_token()
    else:
        session['token'] = r.json()["access_token"]
        session['refresh_token'] = r.json()["refresh_token"]
    client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    user = client.get_users()
    session['currentUser'] = user[0]
    return r.json()

@app.route('/session')
def get_session():
    return jsonify(list(session.items()))  # .get('user_id')


def validate():
    return {'time': time.time()}


def get_headers():
    return {'Client-ID': os.getenv('CLIENT_ID'), 'Authorization': 'Bearer ' + session['token']}


@ app.route('/setuser/<username>')
def set_user(username):
    r = requests.get(f'{BASE_URL}users/?login={username}', headers=get_headers())
    session['user_id'] = r.json()['data'][0]['id']
    return session.get('user_id')
    # # show the user profile for that user
    # return 'User %s' % escape(username)

@ app.route('/currentUser')
def get_current_user():
    try:
            if(session.get('token') is not None):
                client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
                user = client.get_users()
            else:
                refresh_token()
                get_current_user()
    except requests.exceptions.HTTPError as e:
        # return e.response.content, e.response.status_code
        refresh_token()
        get_current_user()
    return user[0]

@ app.route('/streams')
def get_streams():
    client=twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    streams = client.get_streams()
    return jsonify(streams._queue)

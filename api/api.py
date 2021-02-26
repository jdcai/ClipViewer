import os
import json
import requests
import time
import pprint
from flask import Flask, session, jsonify, request
import twitch
import urllib.parse

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
BASE_URL = 'https://api.twitch.tv/helix/'
client = ""
xA = False
#venv\Scripts\activate to start
#flask run --no-debugger

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
@app.route('/authorize',methods=['POST'])
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
    session['token'] = r.json()["access_token"]
    session['refresh_token'] = r.json()["refresh_token"]
    client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    user = client.get_users()
    session['currentUser'] = user[0]
    return r.json()

# @app.route('/authorize')
# def authorize():
#     payload = {
#         'client_id': os.getenv('CLIENT_ID'),
#         'redirect_uri':'http://localhost:3000',
#         'response_type': "code"
#     }
#     url = 'https://id.twitch.tv/oauth2/authorize'
#     r = requests.get(url, params=payload)
#     return r.json()


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
    client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    user = client.get_users()
    return user[0]

@ app.route('/streams')
def get_streams():
    client=twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    streams = client.get_streams()
    return jsonify(streams._queue)

@ app.route('/follows')
def get_follows():
    # user_id = session.get('user_id')
    # params = {'from_id': user_id, 'first': 100}
    # r = requests.get(f'{BASE_URL}users/follows', params=params,
    #                  headers=get_headers())
    # return r.json()
    # session['follows'] = r.json()['data']  # .append(follows2)

    # if r.json()['pagination']['cursor']:
    #     params = {'from_id': user_id, 'first': 100,
    #               'after': r.json()['pagination']['cursor']}
    #     r = requests.get(f'{BASE_URL}users/follows', params=params,
    #                      headers=get_headers())
    #     session['follows'] = session['follows'] + r.json()['data']
    print(session['token'])
    try:
        client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
        cursor = client.get_user_follows(page_size=100,from_id=(session.get('currentUser')['id']))
        follows = cursor._queue
        while follows.__len__() != cursor.total:
            follows.extend(cursor.next_page())
    except requests.exceptions.HTTPError:
        refresh_token()
        return get_follows()
    
    return jsonify(follows)
    # return jsonify([])


@ app.route('/clips')
def get_clips():
    # r = requests.get(f'{BASE_URL}clips', params=request.args,
    #                  headers=get_headers())
    # # user = r.json()['data'][0]['id']
    # return jsonify(r.json())

    try:
        client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
        cursor = client.get_clips(page_size=100,broadcaster_id=request.args['broadcaster_id'],started_at=request.args.get('started_at'),ended_at=request.args.get('ended_at'))
    except requests.exceptions.HTTPError:
        refresh_token()
        return get_clips()

    # follows = cursor._queue
    # while follows.__len__() != cursor.total:
    #     print(follows.__len__())
    #     follows.extend(cursor.next_page())

    return jsonify(cursor._queue)

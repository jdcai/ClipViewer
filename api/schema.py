from typing import Any
from graphene import ObjectType, String, Schema, JSONString, List, Int
import twitch
import json
import os
from flask import session, jsonify, json
import urllib.parse
import requests
import operator

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

def get_follows(user_id):
    client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
    if user_id:
        cursor = client.get_user_follows(page_size=100,from_id=(user_id))
    else:
        cursor = client.get_user_follows(page_size=100,from_id=(session.get('currentUser')['id']))
    follows = cursor._queue
    while follows.__len__() != cursor.total:
        follows.extend(cursor.next_page())
    return json.dumps(follows)

def get_clips(broadcaster_ids, started_at, ended_at):
    clips = []
    if len(broadcaster_ids)!=0:
        client = twitch.TwitchHelix(client_id=os.getenv('CLIENT_ID'), oauth_token=session['token'])
        for broadcaster_id in broadcaster_ids:
            # clips.append()
            cursor = client.get_clips(page_size=100,broadcaster_id=broadcaster_id,started_at=started_at,ended_at=ended_at)
            # clips.append(cursor._queue)
            clips+=cursor._queue
        clips.sort(key=operator.attrgetter("view_count"), reverse=True)

    return json.dumps(clips)

class Query(ObjectType):
    # this defines a Field `hello` in our Schema with a single Argument `name`
    hello = String(name=String(default_value="stranger"))
    goodbye = String()
    clips = String(broadcaster_ids=List(String), started_at=String(),ended_at=String())
    follows = String(user_id=String())

    # our Resolver method takes the GraphQL context (root, info) as well as
    # Argument (name) for the Field and returns data for the query Response
    def resolve_hello(root, info, name):
        return session.get('currentUser')['id']

    def resolve_goodbye(root, info):
        return 'See ya!'


    def resolve_follows(root, info, user_id):
        try:    
            return get_follows(user_id)
        except requests.exceptions.HTTPError:
            refresh_token()
            return get_follows(user_id)

    def resolve_clips(root, info, broadcaster_ids, started_at, ended_at):
        try:
            return get_clips(broadcaster_ids, started_at, ended_at)
        except requests.exceptions.HTTPError:
            refresh_token()
            return get_clips(broadcaster_ids, started_at, ended_at)
        
schema = Schema(query=Query)
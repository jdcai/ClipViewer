from typing import Any
from graphene import ObjectType, String, Schema, List
import twitch
import json
import os
from flask import json
import urllib.parse
import requests
import operator
from flask_login import current_user


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


def get_follows(user_id):
    client = twitch.TwitchHelix(
        client_id=os.getenv("CLIENT_ID"), oauth_token=current_user.token
    )
    if user_id:
        cursor = client.get_user_follows(page_size=100, from_id=(user_id))
    follows = cursor._queue
    while follows.__len__() != cursor.total:
        follows.extend(cursor.next_page())
    return json.dumps(follows)


def get_clips(broadcaster_ids, started_at, ended_at):
    clips = []
    if len(broadcaster_ids) != 0:
        client = twitch.TwitchHelix(
            client_id=os.getenv("CLIENT_ID"), oauth_token=current_user.token
        )
        for broadcaster_id in broadcaster_ids:
            # clips.append()
            cursor = client.get_clips(
                page_size=100,
                broadcaster_id=broadcaster_id,
                started_at=started_at,
                ended_at=ended_at,
            )
            # clips.append(cursor._queue)
            clips += cursor._queue
        clips.sort(key=operator.attrgetter("view_count"), reverse=True)

    return json.dumps(clips)


def get_users(login_names):
    if len(login_names) != 0:
        client = twitch.TwitchHelix(
            client_id=os.getenv("CLIENT_ID"), oauth_token=current_user.token
        )
        channel = client.get_users(login_names=login_names)
    return json.dumps(channel)


class Query(ObjectType):
    clips = String(broadcaster_ids=List(String), started_at=String(), ended_at=String())
    follows = String(user_id=String())
    users = String(login_names=List(String))

    # our Resolver method takes the GraphQL context (root, info) as well as
    # Argument (name) for the Field and returns data for the query Response
    def resolve_follows(root, info, user_id):
        try:
            if current_user.is_authenticated:
                return get_follows(user_id)
        except requests.exceptions.HTTPError:
            try:
                if refresh_token():
                    return get_follows(user_id)
            except requests.exceptions.HTTPError as e:
                print(e.response.content)

    def resolve_clips(root, info, broadcaster_ids, started_at=None, ended_at=None):
        try:
            return get_clips(broadcaster_ids, started_at, ended_at)
        except requests.exceptions.HTTPError:
            try:
                if refresh_token():
                    return get_clips(broadcaster_ids, started_at, ended_at)
            except requests.exceptions.HTTPError as e:
                print(e.response.content)

    def resolve_users(root, info, login_names):
        try:
            return get_users(login_names)
        except requests.exceptions.HTTPError:
            try:
                if refresh_token():
                    return get_users(login_names)
            except requests.exceptions.HTTPError as e:
                print(e.response.content)


schema = Schema(query=Query)

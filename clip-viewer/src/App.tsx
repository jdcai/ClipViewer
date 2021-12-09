import React, { useEffect, useReducer, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { Button, AppBar, Toolbar, Typography } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';

import ClipsDirectory from './components/ClipsDirectory';
import Clip from './components/Clip';
import Groups from './components/Groups';
import useUserStore from './stores/UserStore';

const GrowContainer = styled.div`
    flex-grow: 1;
`;

const Header = () => {
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const currentUser: any = useUserStore((state) => state.currentUser);
    useEffect(() => {
        axios
            .get('/currentUser')
            .then((result) => {
                setCurrentUser(result.data);
                //Add a login here if current user is not existant?
                console.log('success', result);
            })
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log(error);
                }
            });
    }, []);
    const login = () => {
        //todo add uuid state to url https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow
        window.location.replace(
            'https://id.twitch.tv/oauth2/authorize?client_id=4ii276qiixepu2v4uoazmgzaf060r3&redirect_uri=http://localhost:3000/oauth/callback&response_type=code',
        );
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">Clips</Typography>
                <GrowContainer></GrowContainer>
                {currentUser ? (
                    <Typography variant="h6">{currentUser?.display_name}</Typography>
                ) : (
                    <Button color="inherit" onClick={() => login()}>
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

const App = () => {
    return (
        <Router>
            <Header></Header>

            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/clips">Clips</Link>
                        </li>
                        <li>
                            <Link to="/groups">Groups</Link>
                        </li>
                    </ul>
                </nav>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/clip">
                        <Clip></Clip>
                    </Route>
                    <Route path="/oauth/callback">
                        <Authorize />
                    </Route>
                    <Route path="/clips">
                        <ClipsDirectory></ClipsDirectory>
                    </Route>
                    <Route path="/groups">
                        <Groups />
                    </Route>
                    <Route path="/">
                        <ClipsDirectory></ClipsDirectory>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

const Authorize = () => {
    const params = new URLSearchParams(useLocation().search);
    useEffect(() => {
        const code = params.has('code') ? params.get('code') : '';
        fetch('/authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        })
            .then((res) => res.json())
            .then(
                (result) => {
                    //TODO: Do a get current user here so that username shows up in top right
                    console.log('success', result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log('error', error);
                },
            );
    }, []);

    return <></>;
};

export default App;

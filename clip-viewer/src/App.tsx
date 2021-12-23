import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'fontsource-roboto';
// Do https://mui.com/guides/minimizing-bundle-size/
import Toolbar from '@mui/material/Toolbar';
import styled from 'styled-components';

import ClipsDirectory from './components/ClipsDirectory';
import Clip from './components/Clip';
import Groups from './components/Groups';
import Header from './components/Header';

const Container = styled.div``;

const App = () => {
    return (
        <Router>
            <Header></Header>
            <Toolbar />
            <Container>
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
            </Container>
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

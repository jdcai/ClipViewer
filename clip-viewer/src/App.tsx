import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { Button, TextField, AppBar, Toolbar, Typography, Select, InputLabel, MenuItem } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import styled from 'styled-components';
// import { Button, TextField, Select, InputLabel, MenuItem } from '@material-ui/core';/

// import Autocomplete from '@material-ui/lab/Autocomplete'

// import MomentUtils from '@date-io/moment';
// import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'

import moment, { Moment } from 'moment';

const GrowContainer = styled.div`
    flex-grow: 1;
`;

const Header = () => {
    const [currentUser, setCurrentUser] = useState<any>(undefined);
    useEffect(() => {
        fetch('/currentUser')
            .then((res) => res.json())
            .then(
                (result) => {
                    setCurrentUser(result);
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
    const timeIntervalsArr = ['Day', 'Week', 'Month', 'Year', 'All Time', 'Custom'];
    const [broadcaster, setBroadcaster] = useState<any>({});
    const [follows, setFollows] = useState([]);
    const [clips, setClips] = useState<any>([]);
    const [clipIndex, setClipIndex] = useState(0);
    const [startDate, setStartDate] = useState<Moment | undefined>(moment().subtract(1, 'month'));
    const [endDate, setEndDate] = useState<Moment | undefined>(moment());
    const [startDateInput, setStartDateInput] = useState<Moment | undefined>(moment().subtract(1, 'month'));
    const [endDateInput, setEndDateInput] = useState<Moment | undefined>(moment());
    const [timeInterval, setTimeInterval] = useState('Month');

    const getClips = () => {
        const params: { [k: string]: any } = {
            broadcaster_id: broadcaster.to_id,
            first: 100,
        };

        if (startDate && endDate) {
            params.started_at = startDate.toISOString();
            params.ended_at = endDate.toISOString();
        }

        const esc = encodeURIComponent;
        const query = Object.entries(params)
            .map(([k, v]) => esc(k) + '=' + esc(v))
            .join('&');

        fetch('/clips?' + query)
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(result);
                    setClips(result);
                    setClipIndex(0);
                    console.log(clipIndex);
                    console.log(clips);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                },
            );
    };

    const handleintervalChange = (e: any) => {
        const timeIntervals = {
            Day: 'Day',
            Week: 'Week',
            Month: 'Month',
            Year: 'Year',
            All: 'All Time',
            Custom: 'Custom',
        };
        setTimeInterval(e.target.value);

        switch (e.target.value) {
            case timeIntervals.Day:
                setStartDate(moment().subtract(1, 'day'));
                setEndDate(moment());

                break;
            case timeIntervals.Week:
                setStartDate(moment().subtract(1, 'week'));
                setEndDate(moment());

                break;
            case timeIntervals.Month:
                setStartDate(moment().subtract(1, 'month'));
                setEndDate(moment());

                break;
            case timeIntervals.Year:
                setStartDate(moment().subtract(1, 'year'));
                setEndDate(moment());

                break;
            case timeIntervals.All:
                setStartDate(undefined);
                setEndDate(undefined);

                break;
            case timeIntervals.Custom:
                setStartDate(startDateInput);
                setEndDate(endDateInput);

                break;

            default:
                break;
        }
    };

    let globalf: NodeJS.Timeout;
    const handleKey = (e: KeyboardEvent) => {
        console.log(e.code);
        // console.log(clipIndex);
        // console.log(clips.length);
        if (e.code === 'ArrowRight') {
            // if (clipIndex < clips.length - 1) {
            setClipIndex(clipIndex + 1);
            console.log(clipIndex);
            // }
            // } else if (e.code === 'ArrowLeft') {
            //     if (clipIndex > 0) {
            //         setClipIndex(clipIndex - 1);
            //         console.log(clipIndex);
            //     }
            // } else if (e.code === 'ArrowUp') {
            //     console.log(clipIndex);
            //     if (clipIndex < clips.length - 1) {
            //         console.log('autoplay started');
            //         globalf = setInterval(() => {
            //             setClipIndex(clipIndex + 1);
            //         }, 30000);
            //     }
            // } else if (e.code === 'ArrowDown') {
            //     clearInterval(globalf);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
    }, [clips]);

    useEffect(() => {
        fetch('/follows')
            .then((res) => res.json())
            .then(
                (result) => {
                    setFollows(result);
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

    return (
        <Router>
            <Header></Header>
            <Autocomplete
                id="combo-box-demo"
                options={follows}
                getOptionLabel={(option: any) => option.to_name}
                style={{ width: 300 }}
                onChange={(_0, value: any) => setBroadcaster(value)}
                value={follows[0]}
                renderInput={(params: unknown) => <TextField {...params} label="Combo box" variant="outlined" />}
            />
            <InputLabel id="label">Top</InputLabel>
            <Select labelId="label" id="select" onChange={(e) => handleintervalChange(e)} defaultValue={timeInterval}>
                {timeIntervalsArr.map((v) => {
                    return (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    );
                })}
            </Select>
            <Button variant="contained" color="primary" onClick={() => getClips()}>
                Get Clips
            </Button>
            {clips.length > 0 && (
                <div>
                    <h1>{clipIndex}</h1>
                    <h1>{clips[clipIndex]?.title}</h1>
                    <div>Views: {clips[clipIndex]?.view_count}</div>
                    <div>Created: {clips[clipIndex]?.created_at}</div>

                    <iframe
                        src={
                            'https://clips.twitch.tv/embed?clip=' +
                            clips[clipIndex].id +
                            '&parent=localhost&autoplay=true'
                        }
                        height="720"
                        width="1280"
                        title="test"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={true}
                        id="if"
                    ></iframe>
                </div>
            )}
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/about">Get streams</Link>
                        </li>
                        <li>
                            <Link to="/users">Users</Link>
                        </li>
                    </ul>
                </nav>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/about">
                        <About />
                    </Route>
                    <Route path="/oauth/callback">
                        <Authorize />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

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

    return <h2></h2>;
};

export default App;

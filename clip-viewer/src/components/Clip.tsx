import React, { useCallback, useRef, useEffect, useReducer, useState } from 'react';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { Switch } from '@mui/material';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
// import { Button, TextField, Select, InputLabel, MenuItem } from '@mui/material';/

// import Autocomplete from '@mui/lab/Autocomplete'

// import MomentUtils from '@date-io/moment';
// import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'

const CreatedDate = styled.div`
    bottom: 0;
    right: 0;
`;

function clipIndexReducer(state: number, action: string) {
    switch (action) {
        case 'reset':
            return 0;
        case 'increment':
            return state + 1;
        case 'decrement':
            return state - 1;
        default:
            throw new Error();
    }
}

function useStateRef(initialValue: number) {
    const [value, setValue] = useState(initialValue);

    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return [value, setValue, ref] as const;
}

let globalf: NodeJS.Timeout;
const Clip = (props: any) => {
    const location = useLocation<any>();
    const clips = location.state.clips;
    // const [clipIndex, setClipIndex] = useState(location.state.index ?? 0);
    // const clipIndex = useRef(0);
    // const [clipIndex, setClipIndex, clipIndexRef] = useStateRef(0);
    // console.log(clipIndex2);
    // console.log(setClipIndex(5));
    // console.log(clipIndexRef);

    // console.log(test2);
    const [clipIndex, setClipIndex] = useReducer(clipIndexReducer, location.state.index ?? 0);
    // const [autoPlay, setAutoPlay] = useReducer(autoPlayReducer, false);
    const [autoPlay, setAutoPlay] = useState(false);
    const [test, setTest] = useState(0);
    console.log(props);

    console.log(location);

    // Try putting inside useEffect
    const handleKey = useCallback((e: KeyboardEvent) => {
        console.log(e.code);
        // console.log(clipIndex);
        // console.log(clips.length);
        if (e.code === 'ArrowRight') {
            if (clipIndex < clips.length - 1) {
                console.log(clipIndex);
                // setClipIndex(0)
                setClipIndex('increment');
                // setClipIndex(clipIndexRef.current + 1);
                // setClipIndex(clipIndex + 1);
                // clipIndex.current++;
            }
        } else if (e.code === 'ArrowLeft') {
            if (clipIndex > 0) {
                setClipIndex('decrement');
                // console.log(clipIndexRef.current);
                // setClipIndex(clipIndexRef.current - 1);
                // setClipIndex(clipIndex - 1);
                // clipIndex.current--;
            }
        }
    }, []);
    useEffect(() => {
        console.log('test');
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [clips, clipIndex, handleKey]);

    useEffect(() => {
        if (autoPlay) {
            clearInterval(globalf);
            console.log(globalf);
            // setTest(clips[clipIndexRef.current].duration * 1000);
            globalf = setInterval(() => {
                setClipIndex('increment');
                // setClipIndex((clipIndex: number) => clipIndex + 1);
                // clipIndexRef.current++;
            }, clips[clipIndex].duration * 1000 + 5000);
        } else {
            clearInterval(globalf);
        }
        return () => clearInterval(globalf);
    }, [clipIndex, autoPlay]);

    return (
        <div>
            {location.state.clips.length > 0 && (
                <div>
                    <Switch
                        checked={autoPlay}
                        onChange={(e) => setAutoPlay(e.target.checked)}
                        color="primary"
                        name="checkedB"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    <h1>{test}</h1>
                    <h1>{clips[clipIndex].duration * 1000 + 5000}</h1>
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
                        width="100%"
                        title="test"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={true}
                        id="if"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default Clip;

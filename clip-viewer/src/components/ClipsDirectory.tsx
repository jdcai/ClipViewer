import React, { useEffect, useReducer, useState } from 'react';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { Button, TextField, Select, InputLabel, MenuItem, Autocomplete } from '@mui/material/';
import styled from 'styled-components';
// import { Button, TextField, Select, InputLabel, MenuItem } from '@mui/material';/

// import Autocomplete from '@mui/lab/Autocomplete'

// import MomentUtils from '@date-io/moment';
// import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import 'moment-duration-format';

import moment, { Moment } from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';

// Try making a group of 5 streamer ids and merge clips

const GrowContainer = styled.div`
    flex-grow: 1;
`;

const ClipContainer = styled.div`
    padding: 0.5rem;
    display: inline-block;
`;

const ClipImageContainer = styled.div`
    position: relative;
    cursor: pointer;
`;

const ClipInfo = styled.div`
    position: absolute;
    background-color: #12121299;
    margin: 1rem;
    padding: 0px 0.4rem;
`;

const Duration = styled(ClipInfo)`
    top: 0;
`;

const ViewCount = styled(ClipInfo)`
    bottom: 0;
`;

const CreatedDate = styled(ClipInfo)`
    bottom: 0;
    right: 0;
`;

const ClipsDirectory = () => {
    const location = useLocation<any>();
    const timeIntervalsArr = ['Day', 'Week', 'Month', 'Year', 'All Time', 'Custom'];
    const [broadcaster, setBroadcaster] = useState<any>({});
    console.log('b', location?.state?.broadcasters);
    const [broadcasters, setBroadcasters] = useState<string[]>(location?.state?.broadcasters ?? []);
    const [follows, setFollows] = useState([]);
    const [clips, setClips] = useState<any[]>([]);
    // const [clipIndex, setClipIndex] = useState(0);
    // const [clipIndex, setClipIndex] = useReducer(clipIndexReducer, 0);
    // const [autoPlay, setAutoPlay] = useReducer(autoPlayReducer, false);
    const [startDate, setStartDate] = useState<Moment | undefined>(moment().subtract(2, 'day'));
    const [endDate, setEndDate] = useState<Moment | undefined>(moment());
    const [startDateInput, setStartDateInput] = useState<Moment | undefined>(moment().subtract(1, 'month'));
    const [endDateInput, setEndDateInput] = useState<Moment | undefined>(moment());
    const [timeInterval, setTimeInterval] = useState('Week');
    const history = useHistory();

    const getClips = (multi = false) => {
        const params: { [k: string]: any } = {
            broadcaster_id: [broadcaster.to_id],
            first: 100,
        };

        if (multi) {
            // Nyanners 82350088
            // BoxBox 38881685
            // Lily 31106024
            // Ironmouse 175831187
            // Haruka 483194031
            // Silvervale 515567425
            // Snuffy 56938961
            // Projektmelody 478575546
            // Zentreya 128440061
            // Sykkuno 26154978
            // Veibae 97245742
            // Apricot 151054406
            // params.broadcaster_id = ['82350088', '31106024', '38881685'];
            params.broadcaster_id = broadcasters;
            // [
            //     '82350088',
            //     '83402203',
            //     // '175831187',
            //     // '483194031',
            //     // '515567425',
            //     // '56938961',
            //     // '478575546',
            //     // '128440061',
            //     // '26154978',
            //     // '97245742',
            //     // '151054406',
            // ];
        }
        params.broadcaster_id = params.broadcaster_id.map((id: any) => `"${id}"`).join(',');

        if (startDate && endDate) {
            params.started_at = startDate.toISOString();
            params.ended_at = endDate.toISOString();
        }

        const esc = encodeURIComponent;
        // const query = Object.entries(params)
        //     .map(([k, v]) => esc(k) + '=' + esc(v))
        //     .join('&');

        fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
            {
                clips(broadcasterIds: [${params.broadcaster_id}], startedAt: "${params.started_at}", endedAt: "${params.ended_at}")
            }
            `,
            }),
        })
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(JSON.parse(result.data.clips));
                    setClips(JSON.parse(result.data.clips));
                    // console.log(result);
                    // setClips(result);
                    // setClipIndex('reset');
                    // console.log(clipIndex);
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
                setStartDate(moment().subtract(2, 'day'));
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

    useEffect(() => {
        console.log(moment.duration(Math.round(59.9), 'seconds').format('m:ss'));
        axios
            .post('/graphql', {
                method: 'POST',
                query: `
            {
                follows(userId:"")
            }
            `,
            })
            .then((result) => {
                setFollows(JSON.parse(result.data.data.follows));
            })
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.

            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log(error);
                }
            });

        getClips(true);
    }, []);

    return (
        <div>
            <Autocomplete
                freeSolo={true}
                id="combo-box-demo"
                options={follows ?? []}
                getOptionLabel={(option: any) => option.to_name ?? ''}
                style={{ width: 300 }}
                onChange={(_0, value: any) => setBroadcaster(value)}
                value={follows.length ? follows[0] : {}}
                renderInput={(params: unknown) => <TextField {...params} label="Following" variant="outlined" />}
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
            <div>
                {clips &&
                    clips.map((clip, index) => (
                        <ClipContainer key={clip.id}>
                            <ClipImageContainer
                                onClick={() => history.push('clip', { clips: clips, currentClip: clip, index: index })}
                            >
                                <img src={clip?.thumbnail_url}></img>
                                <Duration>
                                    {moment
                                        .duration(Math.round(clip?.duration), 'seconds')
                                        .format('m:ss', { trim: false })}
                                </Duration>
                                <ViewCount>{clip?.view_count} views</ViewCount>
                                <CreatedDate>{moment(clip?.created_at).fromNow()}</CreatedDate>
                            </ClipImageContainer>
                            <div>{clip?.title}</div>
                            <div>{clip?.broadcaster_name}</div>
                        </ClipContainer>
                    ))}
            </div>
        </div>
    );
};

export default ClipsDirectory;

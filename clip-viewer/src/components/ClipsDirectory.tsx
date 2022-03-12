import React, { useEffect, useState } from 'react';
import 'fontsource-roboto';

import { Button, TextField, Select, InputLabel, MenuItem, Modal } from '@mui/material/';
import styled from 'styled-components';

import DateAdapter from '@mui/lab/AdapterMoment';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import 'moment-duration-format';

import moment, { Moment } from 'moment';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import axios from 'axios';

import Clip from './Clip';

const ClipContainer = styled.div`
    margin: 0.5rem;
    display: inline-block;
    width: 30rem;
`;

const ClipImageContainer = styled.div`
    position: relative;
    cursor: pointer;
`;
const ClipTitle = styled.div`
    display: flex;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 24px;
`;
const ClipBroadcaster = styled.div`
    display: flex;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 24px;
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

const ModalContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #121212;
    border: 2px solid #000;
    width: 90%;
    max-width: 90%;
    transform: translate(-50%, -50%);
    height: 80%;
    max-height: 80%;
    outline: 0;
`;

interface LocationState {
    broadcasters: string[];
}

let globalf: NodeJS.Timeout;

const ClipsDirectory = () => {
    const location = useLocation();
    const locationState = location.state as LocationState;
    const timeIntervalsArr = ['Day', 'Week', 'Month', 'Year', 'All Time', 'Custom'];
    const [broadcasters, setBroadcasters] = useState<string[]>([]);

    const [clips, setClips] = useState<any[]>([]);
    const [clipIndex, setClipIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [startDate, setStartDate] = useState<Moment | null>(moment().subtract(1, 'month'));
    const [endDate, setEndDate] = useState<Moment | null>(moment());

    const [timeInterval, setTimeInterval] = useState('Month');
    const navigate = useNavigate();

    const getClips = () => {
        if (broadcasters.length > 0) {
            const params: { [k: string]: any } = {
                broadcaster_id: broadcasters.map((id: string) => `"${id}"`).join(','),
                first: 100,
            };

            if (startDate && endDate) {
                params.started_at = startDate.toISOString();
                params.ended_at = endDate.toISOString();
            }

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
                        setClips(JSON.parse(result.data.clips));
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        console.log(error);
                    },
                );
        }
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
                setStartDate(null);
                setEndDate(null);

                break;
            case timeIntervals.Custom:
                setStartDate(null);
                setEndDate(null);

                break;

            default:
                break;
        }
    };

    useEffect(() => {
        getClips();
    }, [broadcasters]);

    useEffect(() => {
        setBroadcasters(locationState?.broadcasters ?? []);
    }, [locationState.broadcasters]);

    const handleKey = (e: KeyboardEvent) => {
        if (e.code === 'ArrowRight') {
            if (clipIndex < clips.length - 1) {
                setClipIndex((clipIndex) => clipIndex + 1);
            }
        } else if (e.code === 'ArrowLeft') {
            if (clipIndex > 0) {
                setClipIndex((clipIndex) => clipIndex - 1);
            }
        }
    };

    const handleModalClose = () => {
        setOpenModal(false);
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [clips, clipIndex, handleKey]);

    useEffect(() => {
        if (autoPlay) {
            clearInterval(globalf);

            globalf = setInterval(() => {
                setClipIndex((clipIndex) => clipIndex + 1);
            }, clips[clipIndex].duration * 1000 + 5000);
        } else {
            clearInterval(globalf);
        }
        return () => clearInterval(globalf);
    }, [clipIndex, autoPlay]);

    return (
        <div>
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
            {timeInterval === 'Custom' && (
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                        label="Start date"
                        value={startDate}
                        onChange={(newValue) => {
                            setStartDate(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <DatePicker
                        label="End date"
                        value={endDate}
                        onChange={(newValue) => {
                            const endOfDay = newValue?.endOf('day');
                            setEndDate(endOfDay ?? null);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            )}

            <div>
                {clips &&
                    clips.map((clip, index) => (
                        <ClipContainer key={clip.id}>
                            <ClipImageContainer
                                onClick={() => {
                                    setClipIndex(index);
                                    setOpenModal(true);
                                }}
                                // onClick={() => navigate.push('clip', { clips: clips, currentClip: clip, index: index })}
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
                            <ClipTitle title={clip?.title}>{clip?.title}</ClipTitle>
                            <ClipBroadcaster>{clip?.broadcaster_name}</ClipBroadcaster>
                        </ClipContainer>
                    ))}
            </div>
            <Modal open={openModal} onClose={handleModalClose}>
                <ModalContainer>
                    <Clip clip={clips[clipIndex]} autoPlay={autoPlay} setAutoPlay={setAutoPlay} />
                </ModalContainer>
            </Modal>
        </div>
    );
};

export default ClipsDirectory;

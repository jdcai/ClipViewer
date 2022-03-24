import React, { useEffect, useRef, useState } from 'react';
import { Button, TextField, Select, InputLabel, MenuItem, Modal } from '@mui/material/';
import styled from 'styled-components';
import DateAdapter from '@mui/lab/AdapterMoment';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import 'moment-duration-format';
import moment, { Moment } from 'moment';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import axios from 'axios';

import Clip from './Clip';
import { getClips } from '../services/ClipService';

const ClipContainer = styled.div`
    margin: 0.5rem;
    display: inline-block;
    width: 300px;
`;

const ClipImageContainer = styled.div`
    position: relative;
    cursor: pointer;
`;
const ClipTitle = styled.div`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 24px;
`;
const Title = styled.h1`
    min-height: 48px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;
const ClipBroadcaster = styled.div`
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
const TopContainer = styled.div`
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
`;

const TopLabel = styled(InputLabel)`
    margin-right: 0.5rem;
    display: inline-block;
`;

const DateTextField = styled(TextField)`
    width: 160px;
`;
const ClipThumbnail = styled.img`
    width: 300px;
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

enum TimeInterval {
    Day = 'Day',
    Week = 'Week',
    Month = 'Month',
    Year = 'Year',
    All = 'All Time',
    Custom = 'Custom',
}
interface LocationState {
    title: string;
    broadcasters: string[];
}

let globalf: NodeJS.Timeout;

const ClipsDirectory = () => {
    const location = useLocation();
    const locationState = location.state as LocationState;

    const [title, setTitle] = useState<string>('');
    const [broadcasters, setBroadcasters] = useState<string[]>([]);
    const [clips, setClips] = useState<any[]>([]);
    const [clipIndex, setClipIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [startDate, setStartDate] = useState<Moment | null>(moment().subtract(1, 'month'));
    const [endDate, setEndDate] = useState<Moment | null>(moment());
    const previousDates = useRef({ startDate, endDate });
    const [timeInterval, setTimeInterval] = useState('Month');
    const navigate = useNavigate();

    const getClipsFromService = () => {
        if (broadcasters.length) {
            getClips(broadcasters, startDate, endDate).then((result) => {
                setClips(result);
            });
        }
    };

    const handleintervalChange = (e: any) => {
        setTimeInterval(e.target.value);

        switch (e.target.value) {
            case TimeInterval.Day:
                setStartDate(moment().subtract(1, 'day'));
                setEndDate(moment());

                break;
            case TimeInterval.Week:
                setStartDate(moment().subtract(1, 'week'));
                setEndDate(moment());

                break;
            case TimeInterval.Month:
                setStartDate(moment().subtract(1, 'month'));
                setEndDate(moment());

                break;
            case TimeInterval.Year:
                setStartDate(moment().subtract(1, 'year'));
                setEndDate(moment());

                break;
            case TimeInterval.All:
                setStartDate(null);
                setEndDate(null);

                break;
            default:
                break;
        }
        setTimeInterval(e.target.value);
    };

    useEffect(() => {
        if (
            (timeInterval !== TimeInterval.Custom && previousDates.current.startDate !== startDate) ||
            (timeInterval == TimeInterval.Custom &&
                (previousDates.current.startDate !== startDate || previousDates.current.endDate !== endDate))
        ) {
            getClipsFromService();
            previousDates.current = { startDate, endDate };
        }
    });

    useEffect(() => {
        getClipsFromService();
    }, [broadcasters]);

    useEffect(() => {
        setTitle(locationState?.title);
        setBroadcasters(locationState?.broadcasters ?? []);
    }, [locationState]);

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
            <TopContainer>
                <Title title={title}>{title}</Title>
                {broadcasters.length > 0 && (
                    <Controls>
                        <TopLabel id="label">Top</TopLabel>
                        <Select
                            labelId="label"
                            id="select"
                            onChange={(event) => handleintervalChange(event)}
                            size="small"
                            defaultValue={timeInterval}
                        >
                            {Object.values(TimeInterval).map((intervals) => {
                                return (
                                    <MenuItem key={intervals} value={intervals}>
                                        {intervals}
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
                                    renderInput={(params) => <DateTextField {...params} size="small" />}
                                />
                                <DatePicker
                                    label="End date"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        const endOfDay = newValue?.endOf('day');
                                        setEndDate(endOfDay ?? null);
                                    }}
                                    renderInput={(params) => <DateTextField {...params} size="small" />}
                                />
                            </LocalizationProvider>
                        )}
                    </Controls>
                )}
            </TopContainer>
            {broadcasters.length > 0 && (
                <>
                    <div>
                        {clips &&
                            clips.map((clip, index) => (
                                <ClipContainer key={clip.id}>
                                    <ClipImageContainer
                                        onClick={() => {
                                            setClipIndex(index);
                                            setOpenModal(true);
                                        }}
                                    >
                                        <ClipThumbnail src={clip?.thumbnail_url}></ClipThumbnail>
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
                        <>
                            <ModalContainer>
                                {clips && (
                                    <Clip
                                        clip={clips[clipIndex]}
                                        autoPlay={autoPlay}
                                        setAutoPlay={setAutoPlay}
                                        handleModalClose={handleModalClose}
                                    />
                                )}
                            </ModalContainer>
                        </>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default ClipsDirectory;

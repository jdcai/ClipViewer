import React, { useEffect, useRef, useState } from 'react';
import { TextField, Select, InputLabel, MenuItem, Modal, CircularProgress, IconButton } from '@mui/material/';
import styled from 'styled-components';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import 'moment-duration-format';
import moment, { Moment } from 'moment';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import Clip from './Clip';
import { getClips } from '../services/ClipService';

const Container = styled.section`
    padding: 0 20px;
`;

const ClipContainer = styled.div`
    display: inline-block;
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
    font-weight: 600;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ClipsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 1rem;
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
    width: 100%;
`;

const LoadingContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`;

const ModalContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%;
    max-width: 90%;
    transform: translate(-50%, -50%);
    height: 80%;
    max-height: 80%;
    outline: 0;
`;

const ModalNavigationLeftButton = styled(IconButton)`
    position: absolute;
    top: 50%;
`;
const ModalNavigationRightButton = styled(IconButton)`
    position: absolute;
    top: 50%;
    right: 0;
`;

enum TimeInterval {
    Day = 'Day',
    Week = 'Week',
    Month = 'Month',
    Year = 'Year',
    All = 'All Time',
    Custom = 'Custom',
}

enum Sort {
    Top = 'Top',
    TopEach = 'Top each',
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
    const [sort, setSort] = useState(Sort.Top);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [startDate, setStartDate] = useState<Moment | null>(moment().subtract(1, 'week'));
    const [endDate, setEndDate] = useState<Moment | null>(moment());
    const previousDates = useRef({ startDate, endDate });
    const [timeInterval, setTimeInterval] = useState(TimeInterval.Week);
    const navigate = useNavigate();

    const getClipsFromService = async () => {
        if (broadcasters.length) {
            try {
                setIsLoading(true);
                const result = await getClips(
                    broadcasters,
                    startDate,
                    endDate,
                    sort === Sort.TopEach && broadcasters.length > 1,
                );

                setClips(JSON.parse(result?.data?.data?.clips) ?? []);
            } catch (error) {
                console.error(error);
            }
        }
        setIsLoading(false);
    };

    const handleintervalChange = (e: any) => {
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

    const handleSortChange = (event: any) => {
        setSort(event.target.value);
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
    }, [broadcasters, sort]);

    useEffect(() => {
        setBroadcasters(locationState?.broadcasters ?? []);
        setTitle(locationState?.title);
    }, [locationState]);

    const handleKey = (e: KeyboardEvent) => {
        if (e.code === 'ArrowRight') {
            nextClip();
        } else if (e.code === 'ArrowLeft') {
            previousClip();
        }
    };

    const nextClip = () => {
        if (clipIndex < clips.length - 1) {
            setClipIndex((clipIndex) => clipIndex + 1);
        }
    };
    const previousClip = () => {
        if (clipIndex > 0) {
            setClipIndex((clipIndex) => clipIndex - 1);
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
            if (clips[clipIndex]?.duration) {
                globalf = setInterval(() => {
                    setClipIndex((clipIndex) => clipIndex + 1);
                }, clips[clipIndex].duration * 1000 + 5000);
            }
        } else {
            clearInterval(globalf);
        }
        return () => clearInterval(globalf);
    }, [clipIndex, autoPlay]);

    return (
        <Container>
            <TopContainer>
                {broadcasters.length > 0 && (
                    <>
                        <Title title={title}>{title}</Title>
                        <Controls>
                            {broadcasters.length > 1 ? (
                                <Select onChange={(event) => handleSortChange(event)} size="small" defaultValue={sort}>
                                    {Object.values(Sort).map((sort) => {
                                        return (
                                            <MenuItem key={sort} value={sort}>
                                                {sort}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            ) : (
                                <TopLabel id="label">Top</TopLabel>
                            )}
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
                    </>
                )}
            </TopContainer>
            {isLoading && (
                <LoadingContainer>
                    <CircularProgress size={60} />
                </LoadingContainer>
            )}
            {!isLoading && broadcasters.length > 0 && (
                <>
                    <ClipsContainer>
                        {clips &&
                            clips.map((clip, index) => (
                                <ClipContainer key={clip.id}>
                                    <ClipImageContainer
                                        onClick={() => {
                                            setClipIndex(index);
                                            setOpenModal(true);
                                        }}
                                    >
                                        <ClipThumbnail src={clip?.thumbnail_url} alt={clip?.title}></ClipThumbnail>
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
                    </ClipsContainer>
                    <Modal open={openModal} onClose={handleModalClose}>
                        <>
                            {clipIndex > 0 && (
                                <ModalNavigationLeftButton
                                    size="large"
                                    aria-label="Previous clip"
                                    title="Previous clip"
                                    onClick={previousClip}
                                >
                                    <ArrowBackIosNewIcon />
                                </ModalNavigationLeftButton>
                            )}
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
                            {clipIndex < clips.length - 1 && (
                                <ModalNavigationRightButton
                                    size="large"
                                    aria-label="Next clip"
                                    title="Next clip"
                                    onClick={nextClip}
                                >
                                    <ArrowForwardIosIcon />
                                </ModalNavigationRightButton>
                            )}
                        </>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default ClipsDirectory;

import React from 'react';
import { Switch, FormControlLabel, IconButton } from '@mui/material';
import styled from 'styled-components';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';

const ClipContainer = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    background-color: #121212;
`;

const ClipInfoContainer = styled.div`
    padding: 1rem;
    width: 24rem;
`;

const CloseModalButton = styled(IconButton)`
    position: absolute;
    top: 0;
    right: 0;
`;

const Clip = (props: {
    clip: any;
    autoPlay: boolean;
    setAutoPlay: React.Dispatch<React.SetStateAction<boolean>>;
    handleModalClose: () => void;
}) => {
    const { clip, autoPlay, setAutoPlay, handleModalClose } = props;

    return (
        <>
            {clip && (
                <ClipContainer>
                    <iframe
                        src={
                            'https://clips.twitch.tv/embed?clip=' +
                            clip.id +
                            '&parent=' +
                            window.location.hostname +
                            '&autoplay=true'
                        }
                        height="100%"
                        width="100%"
                        title="test"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={true}
                        id="if"
                    ></iframe>
                    <ClipInfoContainer>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoPlay}
                                    onChange={(e) => setAutoPlay(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Autoplay"
                        />
                        <CloseModalButton aria-label="Close" title="Close" onClick={handleModalClose}>
                            <CloseIcon />
                        </CloseModalButton>
                        <h2>{clip?.title}</h2>
                        <div>{clip?.view_count} views</div>
                        <div>Clipped {moment(clip?.created_at).fromNow()}</div>
                    </ClipInfoContainer>
                </ClipContainer>
            )}
        </>
    );
};

export default Clip;

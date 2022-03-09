import React from 'react';
import 'fontsource-roboto';
import { Switch, FormControlLabel } from '@mui/material';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const ClipContainer = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
`;

const ClipInfoContainer = styled.div`
    padding: 16px;
`;

const Clip = (props: { clip: any; autoPlay: boolean; setAutoPlay: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { clip, autoPlay, setAutoPlay } = props;

    return (
        <>
            {clip && (
                <ClipContainer>
                    <iframe
                        src={'https://clips.twitch.tv/embed?clip=' + clip.id + '&parent=localhost&autoplay=true'}
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

                        <h1>{clip.duration * 1000 + 5000}</h1>
                        <h1>{clip?.title}</h1>
                        <div>Views: {clip?.view_count}</div>
                        <div>Created: {clip?.created_at}</div>
                    </ClipInfoContainer>
                </ClipContainer>
            )}
        </>
    );
};

export default Clip;

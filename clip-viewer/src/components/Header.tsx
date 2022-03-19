import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Autocomplete, TextField, alpha } from '@mui/material';
import axios from 'axios';
import styled from 'styled-components';
import useUserStore from '../stores/UserStore';
import Drawer from '@mui/material/Drawer';
import Groups from './Groups';
import { withTheme } from '@mui/styles';
import { drawerWidth } from '../Constants';
import MenuIcon from '@mui/icons-material/Menu';
import { getUserFollows, getUsers } from '../services/UserService';
import { useNavigate } from 'react-router';

const ToolbarContainer = styled(Toolbar)`
    align-items: center;
    justify-content: space-between;
`;

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
`;

const Start = styled(HeaderSection)``;
const Center = styled(HeaderSection)``;
const End = styled(HeaderSection)``;

const AutocompleteContainer = styled.div`
    display: flex;
    align-items: center;
`;

const AppBarContainer = styled(withTheme(AppBar))`
    z-index: ${(props) => props.theme.zIndex.drawer + 1};
`;

const DrawerContainer = styled(Drawer)`
    & .MuiDrawer-paper {
        width: ${drawerWidth}px;
        box-sizing: border-box;
    }
`;
const IconButtonContainer = styled(withTheme(IconButton))`
    margin-right: ${(props) => props.theme.spacing(2)};
`;

const CustomTextField = styled(TextField)`
    & .MuiFormHelperText-root.Mui-error {
        position: absolute;
        top: 80%;
    }
`;

const Header = () => {
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const currentUser: any = useUserStore((state) => state.currentUser);
    const userFollows: any = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);
    const [showDrawer, setShowDrawer] = useState(false);
    const [hasUserError, setHasUserError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/currentUser')
            .then((result) => {
                setCurrentUser(result.data);
                if (!userFollows) {
                    getUserFollows().then((follows) => {
                        setUserFollows(follows);
                    });
                }

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

    const goToBroadcaster = async (value: any) => {
        if (!value) {
            setHasUserError(false);
            return;
        }

        if (typeof value === 'string') {
            const users = await getUsers([value]);

            if (users?.length) {
                navigate('clips', {
                    replace: true,
                    state: { title: users[0].display_name, broadcasters: [users[0].id] },
                });
            } else {
                setHasUserError(true);
            }
        } else {
            navigate('clips', {
                replace: true,
                state: { title: value.to_name, broadcasters: [value.to_id] },
            });
        }
    };

    return (
        <>
            <AppBarContainer position="fixed">
                <ToolbarContainer>
                    <Start>
                        <IconButtonContainer
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => setShowDrawer(!showDrawer)}
                            edge="start"
                        >
                            <MenuIcon />
                        </IconButtonContainer>

                        <Typography variant="h6">Clips</Typography>
                    </Start>
                    <Center>
                        <AutocompleteContainer>
                            <Autocomplete
                                freeSolo
                                id="combo-box-demo"
                                options={userFollows ?? []}
                                getOptionLabel={(option: any) => option.to_name ?? option}
                                style={{ width: 355 }}
                                onChange={(_0: any, value: any) => goToBroadcaster(value)}
                                isOptionEqualToValue={(option: any, value: any) => {
                                    const valueUser = typeof value === 'string' ? value : value.to_login;
                                    return option?.to_login === valueUser?.toLowerCase();
                                }}
                                renderInput={(params: any) => (
                                    <CustomTextField
                                        {...params}
                                        error={hasUserError}
                                        helperText={hasUserError ? 'User does not exist' : ''}
                                        label="Username"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                        </AutocompleteContainer>
                    </Center>
                    <End>
                        {currentUser ? (
                            <Typography variant="h6">{currentUser?.display_name}</Typography>
                        ) : (
                            <Button color="inherit" onClick={() => login()}>
                                Login
                            </Button>
                        )}
                    </End>
                </ToolbarContainer>
            </AppBarContainer>
            <DrawerContainer variant="persistent" hideBackdrop={true} anchor={'left'} open={showDrawer}>
                <Toolbar />
                <Groups />
            </DrawerContainer>
        </>
    );
};

export default Header;

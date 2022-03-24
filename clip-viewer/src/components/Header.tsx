import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Autocomplete,
    TextField,
    MenuItem,
    ClickAwayListener,
    Grow,
    MenuList,
    Paper,
    Popper,
    Drawer,
    createFilterOptions,
} from '@mui/material';
import { withTheme } from '@mui/styles';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import useUserStore from '../stores/UserStore';

import { getUserFollows, getUsers } from '../services/UserService';

const ToolbarContainer = styled(Toolbar)`
    align-items: center;
    justify-content: space-between;
`;

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 1;
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

const IconButtonContainer = styled(withTheme(IconButton))`
    margin-right: ${(props) => props.theme.spacing(2)};
`;

const CustomTextField = styled(TextField)`
    & .MuiFormHelperText-root.Mui-error {
        position: absolute;
        top: 80%;
    }
`;

const Header = (props: { showDrawer: boolean; setShowDrawer: Dispatch<SetStateAction<boolean>> }) => {
    const { showDrawer, setShowDrawer } = props;
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const currentUser: any = useUserStore((state) => state.currentUser);
    const userFollows: any[] = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);
    const [hasUserError, setHasUserError] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const filter = createFilterOptions<any>();

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = useRef(open);

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    useEffect(() => {
        const getLoggedInUserAndFollows = async () => {
            setIsLoadingUser(true);
            try {
                const result = await axios.get('/currentUser');

                const user = result?.data;
                if (user?.id) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error(error);
            }
            setIsLoadingUser(false);
        };

        getLoggedInUserAndFollows();
    }, []);

    useEffect(() => {
        const getFollows = async () => {
            try {
                const result = await getUserFollows(currentUser.id);
                setUserFollows(JSON.parse(result?.data?.data?.follows) ?? []);
            } catch (error) {
                console.error(error);
            }
        };

        if (currentUser && currentUser.id && !userFollows.length) {
            getFollows();
        } else if (!currentUser) {
            setUserFollows([]);
        }
    }, [currentUser]);

    const login = () => {
        //todo add uuid state to url https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow
        window.location.replace(
            `https://id.twitch.tv/oauth2/authorize?client_id=4ii276qiixepu2v4uoazmgzaf060r3&redirect_uri=${window.location.href}oauth/callback&response_type=code`,
        );
    };

    const logout = async () => {
        try {
            await axios.post('/revoke', {
                method: 'POST',
            });
            setCurrentUser(null);
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    const goToBroadcaster = async (value: any) => {
        if (!value) {
            setHasUserError(false);
            return;
        }

        if (typeof value === 'string') {
            try {
                const result = await getUsers([value]);
                console.log(result);
                const users = JSON.parse(result?.data?.data?.users);

                if (users?.length) {
                    setHasUserError(false);
                    navigate('/', {
                        replace: true,
                        state: { title: users[0].display_name, broadcasters: [users[0].id] },
                    });
                } else {
                    setHasUserError(true);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            setHasUserError(false);
            navigate('/', {
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
                                filterOptions={(options: any, params: any) => {
                                    const filtered = filter(options, params);

                                    const { inputValue } = params;

                                    const isExisting = options.some((option: any) => inputValue === option.to_name);

                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push(inputValue);
                                    }

                                    return filtered;
                                }}
                                openOnFocus
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
                </ToolbarContainer>
            </AppBarContainer>
        </>
    );
};

export default Header;

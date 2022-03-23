import React, { useEffect, useRef, useState } from 'react';
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
import Groups from './Groups';
import { drawerWidth } from '../Constants';
import { getUserFollows, getUsers } from '../services/UserService';

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
    const userFollows: any[] = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);
    const [showDrawer, setShowDrawer] = useState(false);
    const [hasUserError, setHasUserError] = useState(false);
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
            try {
                const result = await axios.get('/currentUser');

                const user = result?.data;
                if (user?.id) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error(error);
            }
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
                    navigate('clips', {
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
            navigate('clips', {
                replace: true,
                state: { title: value.to_name, broadcasters: [value.to_id] },
            });
        }
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

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
                    <End>
                        {currentUser ? (
                            <>
                                <Button
                                    ref={anchorRef}
                                    id="composition-button"
                                    aria-controls={open ? 'composition-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-haspopup="true"
                                    onClick={handleToggle}
                                >
                                    {currentUser?.display_name}
                                </Button>
                                <Popper
                                    open={open}
                                    anchorEl={anchorRef.current}
                                    role={undefined}
                                    placement="bottom-start"
                                    transition
                                    disablePortal
                                >
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                            {...TransitionProps}
                                            style={{
                                                transformOrigin:
                                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                                            }}
                                        >
                                            <Paper>
                                                <ClickAwayListener onClickAway={handleClose}>
                                                    <MenuList
                                                        autoFocusItem={open}
                                                        id="composition-menu"
                                                        aria-labelledby="composition-button"
                                                        onKeyDown={handleListKeyDown}
                                                    >
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                logout();
                                                                handleClose(event);
                                                            }}
                                                        >
                                                            Logout
                                                        </MenuItem>
                                                    </MenuList>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )}
                                </Popper>
                            </>
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

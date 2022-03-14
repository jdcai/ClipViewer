import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Autocomplete, InputBase } from '@mui/material';
import axios from 'axios';
import styled from 'styled-components';
import useUserStore from '../stores/UserStore';
import Drawer from '@mui/material/Drawer';
import Groups from './Groups';
import { withTheme } from '@mui/styles';
import { drawerWidth } from '../Constants';
import MenuIcon from '@mui/icons-material/Menu';
import { getUserFollows } from '../services/UserService';
import { useNavigate } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';

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

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: '100%',

    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const AutocompleteContainer = styled.div`
    display: flex;
    align-items: center;
`;

const AppBarContainer = styled(withTheme(AppBar))`
    z-index: ${(props) => props.theme.zIndex.drawer + 1};
`;

const GetClipsButton = styled(Button)`
    margin-left: 0.5rem;
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

const Header = () => {
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const currentUser: any = useUserStore((state) => state.currentUser);
    const userFollows: any = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);
    const [showDrawer, setShowDrawer] = useState(false);
    const [broadcaster, setBroadcaster] = useState<any>({});
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
                                freeSolo={true}
                                id="combo-box-demo"
                                options={userFollows ?? []}
                                getOptionLabel={(option: any) => option.to_name ?? ''}
                                style={{ width: 355 }}
                                onChange={(_0, value: any) => setBroadcaster(value)}
                                renderInput={(params: any) => (
                                    <Search ref={params.InputProps.ref}>
                                        <SearchIconWrapper>
                                            <SearchIcon />
                                        </SearchIconWrapper>
                                        <StyledInputBase inputProps={params.inputProps} placeholder="Search…" />
                                    </Search>
                                )}
                            />
                            <GetClipsButton
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    if (broadcaster?.to_id) {
                                        navigate('clips', {
                                            replace: true,
                                            state: { title: broadcaster.to_name, broadcasters: [broadcaster.to_id] },
                                        });
                                    }
                                }}
                            >
                                Get Clips
                            </GetClipsButton>
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

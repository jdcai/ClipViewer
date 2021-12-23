import React, { useEffect, useState } from 'react';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import axios from 'axios';
import styled from 'styled-components';
import useUserStore from '../stores/UserStore';
import Drawer from '@mui/material/Drawer';
import Groups from './Groups';
import { withTheme } from '@mui/styles';
import { drawerWidth } from '../Constants';
import MenuIcon from '@mui/icons-material/Menu';

const GrowContainer = styled.div`
    flex-grow: 1;
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

const Header = () => {
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const currentUser: any = useUserStore((state) => state.currentUser);
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        axios
            .get('/currentUser')
            .then((result) => {
                setCurrentUser(result.data);
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
                <Toolbar>
                    <IconButtonContainer
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setShowDrawer(!showDrawer)}
                        edge="start"
                    >
                        <MenuIcon />
                    </IconButtonContainer>
                    <Typography variant="h6">Clips</Typography>
                    <GrowContainer></GrowContainer>
                    {currentUser ? (
                        <Typography variant="h6">{currentUser?.display_name}</Typography>
                    ) : (
                        <Button color="inherit" onClick={() => login()}>
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBarContainer>
            <DrawerContainer variant="persistent" hideBackdrop={true} anchor={'left'} open={showDrawer}>
                <Toolbar />
                <Groups />
            </DrawerContainer>
        </>
    );
};

export default Header;

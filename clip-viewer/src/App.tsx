import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Drawer } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import styled from 'styled-components';

import ClipsDirectory from './components/ClipsDirectory';
import Groups from './components/groups/Groups';
import Header from './components/Header';
import Authorize from './components/Authroize';
import { drawerWidth } from './Constants';

const Container = styled.main`
    margin-left: ${(props: { showDrawer: boolean }) => (props.showDrawer ? `${drawerWidth}px` : 0)};
`;

const DrawerContainer = styled(Drawer)`
    & .MuiDrawer-paper {
        width: ${drawerWidth}px;
        box-sizing: border-box;
    }
`;

// TODO: move Authroize outside to a sepearate route so it does not load header
const App = () => {
    const [showDrawer, setShowDrawer] = useState(false);
    return (
        <Router>
            <Header showDrawer={showDrawer} setShowDrawer={setShowDrawer}></Header>
            <Toolbar />
            <DrawerContainer
                role="navigation"
                variant="persistent"
                hideBackdrop={true}
                anchor={'left'}
                open={showDrawer}
            >
                <Toolbar />
                <Groups />
            </DrawerContainer>
            <Container showDrawer={showDrawer}>
                <Routes>
                    <Route path="/" element={<ClipsDirectory />} />
                    <Route path="/oauth/callback" element={<Authorize />} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;

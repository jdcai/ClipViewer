import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Toolbar from '@mui/material/Toolbar';
import styled from 'styled-components';

import ClipsDirectory from './components/ClipsDirectory';
import Groups from './components/Groups';
import Header from './components/Header';
import Authorize from './components/Authroize';

const Container = styled.div``;

// TODO: move Authroize outside to a sepearate route so it does not load header
const App = () => {
    return (
        <Router>
            <Header></Header>
            <Toolbar />
            <Container>
                <Routes>
                    <Route path="/" element={<ClipsDirectory />} />
                    <Route path="/oauth/callback" element={<Authorize />} />
                    <Route path="/clips" element={<ClipsDirectory />} />
                    <Route path="/groups" element={<Groups />} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;

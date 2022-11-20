import React from 'react';
import './index.css';
import 'fontsource-roboto';
import App from './App';
import { createTheme, CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { createRoot } from 'react-dom/client';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <React.StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </StyledEngineProvider>
    </React.StrictMode>,
);

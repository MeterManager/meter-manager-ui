import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Fade } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import ConsentHandler from './components/ConsentHandler';
import Sidebar from './components/Sidebar';
import BlockedUserPage from './components/BlockedUserPage';
import theme from './theme';
import { Scrollbar } from 'react-scrollbars-custom';

import SubmitMetricsPage from './pages/SubmitMetricsPage';
import DashboardPage from './pages/DashboardPage';

const App = () => {
  const { isLoading, error, isBlocked, isAuthenticated } = useAuthContext();

  console.log('🔍 App render:', {
    isLoading,
    error,
    isBlocked,
    isAuthenticated,
  });

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Fade in={true} timeout={500}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
            }}
          >
            <CircularProgress />
          </Box>
        </Fade>
      </ThemeProvider>
    );
  }

  if (error && error.includes('Consent required')) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <ConsentHandler />
        </Box>
      </ThemeProvider>
    );
  }

  if (isBlocked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BlockedUserPage error={error} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {isAuthenticated && <Sidebar />}
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<SubmitMetricsPage />} />
              <Route path="/dashboard/:section?" element={<DashboardPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;

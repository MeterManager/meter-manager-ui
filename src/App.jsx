import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Fade } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ConsentHandler from './components/ConsentHandler';
import Sidebar from './components/Sidebar';
import theme from './theme';

import SubmitMetricsPage from './pages/SubmitMetricsPage';
import DashboardPage from './pages/DashboardPage';
// import ReportsPage from './pages/ReportsPage';
// import SettingsPage from './pages/SettingsPage';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading, error } = useAuth();

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoading ? (
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
      ) : (
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<SubmitMetricsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* <Route path="/reports" element={<ReportsPage />} /> */}
                {/* <Route path="/settings" element={<SettingsPage />} /> */}
              </Routes>
            </Box>
          </Box>
        </Router>
      )}
    </ThemeProvider>
  );
};

export default App;

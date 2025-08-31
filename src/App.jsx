import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Fade } from '@mui/material';
import useAuth from './hooks/useAuth';
import ConsentHandler from './components/ConsentHandler';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import theme from './theme';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
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
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            selectedMenuItem={selectedMenuItem}
            onMenuSelect={setSelectedMenuItem}
          />
          <MainContent selectedMenuItem={selectedMenuItem} collapsed={collapsed} />
        </Box>
      )}
    </ThemeProvider>
  );
};

export default App;

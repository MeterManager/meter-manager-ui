import './App.css';
import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import theme from './theme';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuSelect = (key) => {
    setSelectedMenuItem(key);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          collapsed={collapsed}
          onCollapse={handleCollapse}
          selectedMenuItem={selectedMenuItem}
          onMenuSelect={handleMenuSelect}
        />
        <MainContent selectedMenuItem={selectedMenuItem} collapsed={collapsed} />
      </Box>
    </ThemeProvider>
  );
};

export default App;

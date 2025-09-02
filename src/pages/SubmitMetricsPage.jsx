import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import useAuth from '../hooks/useAuth';

const SubmitMetricsPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <Typography variant="h5" gutterBottom>
          Щоб подавати показники, потрібно увійти
        </Typography>
        <Button onClick={loginWithRedirect} variant="contained" color="primary" href="/register">
          Увійти / Зареєструватися
        </Button>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Подача показників
      </Typography>
      <Typography variant="body1" gutterBottom>
        Тут у майбутньому буде форма для подачі показників лічильників.
      </Typography>
      <Button variant="contained" color="primary" disabled>
        Подати показники
      </Button>
    </Paper>
  );
};

export default SubmitMetricsPage;

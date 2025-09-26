import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';

const SubmitMetricsPage = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 5,
            textAlign: 'center',
            maxWidth: 400,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Доступ обмежено
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Щоб подавати показники, увійдіть у свій акаунт
          </Typography>
          <Button
            onClick={loginWithRedirect}
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Увійти / Зареєструватися
          </Button>
        </Paper>
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
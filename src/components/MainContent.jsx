import { Box, Typography, Paper } from '@mui/material';
import DashboardPage from '../pages/DashboardPage';

const MainContent = ({ selectedMenuItem }) => {
  const getContentByMenuItem = (key) => {
    switch (key) {
      case '1':
        return <DashboardPage />;
      case '2':
      case '2-1':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Всі лічильники
            </Typography>
            <Typography variant="body1">
              Тут буде список всіх лічильників.
            </Typography>
          </div>
        );
      case '2-2':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Лічильники електрики
            </Typography>
            <Typography variant="body1">
              Тут будуть лічильники електроенергії.
            </Typography>
          </div>
        );
      case '2-3':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Лічильники води
            </Typography>
            <Typography variant="body1">
              Тут будуть лічильники води.
            </Typography>
          </div>
        );
      case '2-4':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Лічильники газу
            </Typography>
            <Typography variant="body1">
              Тут будуть лічильники газу.
            </Typography>
          </div>
        );
      case '3':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Звіти
            </Typography>
            <Typography variant="body1">
              Тут будуть звіти по споживанню.
            </Typography>
          </div>
        );
      case '4':
        return (
          <div>
            <Typography variant="h4" gutterBottom>
              Налаштування
            </Typography>
            <Typography variant="body1">
              Тут будуть налаштування системи.
            </Typography>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper 
        sx={{ 
          margin: 3, 
          padding: 3, 
          borderRadius: 2 
        }}
        elevation={1}
      >
        {getContentByMenuItem(selectedMenuItem)}
      </Paper>
    </Box>
  );
};

export default MainContent;
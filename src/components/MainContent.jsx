import { Box, Typography } from '@mui/material';
import DashboardPage from '../pages/DashboardPage';

const MainContent = ({ selectedMenuItem }) => {
  const getContentByMenuItem = (key) => {
    switch (key) {
      case '1':
        return <DashboardPage />;
      case '2':
      case '2-1':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Всі лічильники
            </Typography>
            <Typography variant="body1">Тут буде список всіх лічильників.</Typography>
          </Box>
        );
      case '2-2':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Лічильники електрики
            </Typography>
            <Typography variant="body1">Тут будуть лічильники електроенергії.</Typography>
          </Box>
        );
      case '2-3':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Лічильники води
            </Typography>
            <Typography variant="body1">Тут будуть лічильники води.</Typography>
          </Box>
        );
      case '2-4':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Лічильники газу
            </Typography>
            <Typography variant="body1">Тут будуть лічильники газу.</Typography>
          </Box>
        );
      case '3':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Звіти
            </Typography>
            <Typography variant="body1">Тут будуть звіти по споживанню.</Typography>
          </Box>
        );
      case '4':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Налаштування
            </Typography>
            <Typography variant="body1">Тут будуть налаштування системи.</Typography>
          </Box>
        );
      default:
        return <DashboardPage />;
    }
  };

  return <Box sx={{ flexGrow: 1, p: 3 }}>{getContentByMenuItem(selectedMenuItem)}</Box>;
};

export default MainContent;

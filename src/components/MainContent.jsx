import { Box, Typography } from '@mui/material';
import DashboardPage from '../pages/DashboardPage';

const MainContent = ({ selectedMenuItem }) => {
  const getContentByMenuItem = (key) => {
    switch (key) {
      case '1':
        return <DashboardPage />;
      case '2':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Подача показників
            </Typography>
            <Typography variant="body1">Тут ви можете подати показники лічильників.</Typography>
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
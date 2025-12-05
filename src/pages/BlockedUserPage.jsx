import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Пропс `error` видалено, оскільки він не використовується
const BlockedUserPage = () => {
  const { handleLogout } = useAuthContext();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh',
      bgcolor: 'background.default',
      p: 2
    }}>
      <Paper sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        bgcolor: '#fdecea', 
        borderRadius: 2,
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
        mx: 'auto'
      }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom color="error" fontWeight="bold">
          Доступ заборонено
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, mt: 2, color: 'text.secondary' }}>
          Ваш акаунт деактивовано у системі обліку. Будь ласка, зверніться до адміністратора для активації.
        </Typography>
        
        <Button 
          onClick={handleLogout} 
          variant="contained"
          color="primary"
          size="large"
        >
          Вийти з системи
        </Button>
      </Paper>
    </Box>
  );
};

export default BlockedUserPage;
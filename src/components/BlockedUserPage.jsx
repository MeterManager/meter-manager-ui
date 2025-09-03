import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const BlockedUserPage = ({ error }) => {
  const { handleLogout } = useAuthContext();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Paper sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        bgcolor: '#fdecea', 
        borderRadius: 2,
        maxWidth: 500,
        textAlign: 'center'
      }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom color="error" fontWeight="bold">
          Доступ заборонено
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {error || 'Ваш акаунт деактивовано. Зверніться до адміністратора для активації акаунта.'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          Якщо ви вважаєте, що це помилка, будь ласка, зв'яжіться з технічною підтримкою.
        </Typography>
        
        <Button 
          onClick={handleLogout} 
          variant="contained" 
          color="primary"
          size="large"
        >
          Вийти і увійти під іншим акаунтом
        </Button>
      </Paper>
    </Box>
  );
};

export default BlockedUserPage;
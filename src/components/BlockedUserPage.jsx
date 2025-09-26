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
        
        <Typography variant="body2" sx={{ mb: 3, mt: 2, color: 'text.secondary' }}>
          Ваш акаунт деактивовано. Зверніться до адміністратора для активації акаунта.
        </Typography>
        
        <Button 
          onClick={handleLogout} 
          variant="outlined" 
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

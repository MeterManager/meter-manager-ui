import { Box, Typography, useTheme } from '@mui/material';

const Logo = ({ collapsed }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 64,
        margin: 2,
        backgroundColor: theme.palette.primary.light, // Використовуємо light варіант primary кольору
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.primary.contrastText, // Використовуємо contrastText з теми
        fontWeight: 'bold',
        fontSize: collapsed ? '14px' : '16px',
        transition: 'all 0.2s',
        // Додаємо ефект при наведенні
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          transform: 'scale(1.02)',
        },
      }}
    >
      <Typography 
        variant={collapsed ? "body2" : "body1"}
        sx={{
          fontWeight: 'bold',
          color: theme.palette.primary.contrastText, // Використовуємо contrastText з теми
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? 'MM' : 'MeterManager'}
      </Typography>
    </Box>
  );
};

export default Logo;
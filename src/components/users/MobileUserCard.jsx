import { Card, CardContent, Box, Typography, Chip, Switch } from '@mui/material';

const MobileUserCard = ({ user, onToggleStatus, disabled }) => {
  return (
    <Card
      sx={{
        mb: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {user.full_name}
          </Typography>
          <Chip
            label={user.isActive ? 'Активний' : 'Неактивний'}
            color={user.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Роль:</strong> {user.role}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={user.isActive}
              onChange={onToggleStatus}
              color="primary"
              size="small"
              disabled={disabled}
            />
            <Typography variant="body2">{user.isActive ? 'Активний' : 'Неактивний'}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MobileUserCard;

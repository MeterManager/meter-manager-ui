import { Card, CardContent, Box, Typography, IconButton, Stack, Tooltip, Divider } from '@mui/material';
import { Edit, Delete, LocationOn } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const MobileDeliveryCard = ({ 
  delivery, 
  onEdit, 
  onDelete, 
  getLocationName, 
  getResourceTypeName, 
  getTotalCost, 
  getPricePerUnit,
  isLoading 
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 1.5,
        border: `1px solid ${theme.palette.grey[200]}`,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        backgroundColor: 'white',
      }}
    >
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
              fontSize: '1rem',
            }}
          >
            {getResourceTypeName(delivery.energy_resource_type_id)}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              ml: 1,
            }}
          >
            {new Date(delivery.delivery_date).toLocaleDateString('uk-UA')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LocationOn 
            sx={{ 
              fontSize: '16px', 
              color: 'grey.500', 
              mr: 0.5,
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {getLocationName(delivery)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: 'grey.100' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Кількість
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.875rem',
              }}
            >
              {Number(delivery.quantity).toFixed(2)} {delivery.unit}
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Загальна сума
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'success.main',
                fontSize: '0.875rem',
              }}
            >
              {getTotalCost(delivery).toLocaleString()} ₴
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Ціна за одиницю
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                fontSize: '0.875rem',
              }}
            >
              {Number(getPricePerUnit(delivery)).toFixed(2).toLocaleString()} ₴
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Постачальник
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {delivery.supplier || 'Не вказано'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: 'grey.100' }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(delivery)} 
                  color="primary"
                  sx={{
                    width: 32,
                    height: 32,
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.main',
                    }
                  }}
                  disabled={isLoading}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Видалити">
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(delivery.id)} 
                  color="error"
                  sx={{
                    width: 32,
                    height: 32,
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'error.50',
                      borderColor: 'error.main',
                    }
                  }}
                  disabled={isLoading}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MobileDeliveryCard;
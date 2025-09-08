import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const ResourceDeliveryTable = ({ deliveries, search, setSearch, onEdit, onAdd, removeDelivery, locations = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  const getLocationName = (locationId) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : 'Невідома локація';
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const resourceName = (d.resourceTypeName || '').toLowerCase();
    const locationName = (d.locationName || '').toLowerCase();
    const supplier = (d.supplier || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return resourceName.includes(searchLower) || locationName.includes(searchLower) || supplier.includes(searchLower);
  });

  const MobileDeliveryCard = ({ delivery }) => (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {delivery.resourceTypeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(delivery.deliveryDate).toLocaleDateString('uk-UA')}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Локація:</strong> {delivery.locationName}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Кількість:</strong> {delivery.quantity} {delivery.unit}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Сума:</strong> {delivery.totalCost} грн
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Ціна за одиницю:</strong> {delivery.pricePerUnit} грн
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Постачальник:</strong> {delivery.supplier || '-'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(delivery)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Видалити">
              <IconButton size="small" onClick={() => removeDelivery(delivery.id)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        sx={{
          ...theme.custom?.headerBoxStyles,
          flexDirection: isMobile ? 'column' : theme.custom?.headerBoxStyles?.flexDirection || 'row',
          gap: isMobile ? 2 : theme.custom?.headerBoxStyles?.gap || 2,
          alignItems: isMobile ? 'stretch' : theme.custom?.headerBoxStyles?.alignItems || 'center',
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={onAdd}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : '160px',
            height: '40px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Додати поставку
        </Button>

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            mt: 0,
          }}
        >
          Знайдено: {filteredDeliveries.length} з {deliveries.length}
        </Typography>
      )}

      {isMobile ? (
        <Box sx={{ mt: 0 }}>
          {' '}
          {/* Прибираємо верхній відступ для мобільних карток */}
          {filteredDeliveries.length > 0 ? (
            filteredDeliveries.map((delivery) => <MobileDeliveryCard key={delivery.id} delivery={delivery} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Поставок не знайдено'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 1,
            overflowX: 'auto',
            mt: 0,
          }}
        >
          <Table sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell
                  sx={{
                    width: isTablet ? '12%' : '15%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Локація
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '12%' : '15%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Ресурс
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '8%' : '10%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Кількість
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '8%' : '10%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Одиниця
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '12%' : '15%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Дата поставки
                </TableCell>
                <TableCell
                  sx={{
                    width: '12%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Ціна за од.
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '10%' : '10%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Сума
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '15%' : '15%',
                    fontWeight: 600,
                    fontSize: isTablet ? '0.875rem' : '1rem',
                  }}
                >
                  Постачальник
                </TableCell>
                <TableCell
                  sx={{
                    width: '5%',
                    fontWeight: 600,
                  }}
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <TableRow
                    key={delivery.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {delivery.locationName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.resourceTypeName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(delivery.deliveryDate).toLocaleDateString('uk-UA')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.pricePerUnit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isTablet ? '0.8rem' : '0.875rem' }}>
                        {delivery.totalCost}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.supplier || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Редагувати поставку">
                          <IconButton size="small" onClick={() => onEdit(delivery)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити поставку">
                          <IconButton size="small" onClick={() => removeDelivery(delivery.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : 'Поставок не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати першу поставку
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ResourceDeliveryTable;

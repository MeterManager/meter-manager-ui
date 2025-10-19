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
import MobileDeliveryCard from './MobileDeliveryCard';

const ResourceDeliveryTable = ({
  deliveries,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeDelivery,
  locations = [],
  resourceTypes = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  const getLocationName = (delivery) => {
    if (delivery.locationName) return delivery.locationName;
    const location = locations.find((loc) => loc.id === delivery.location_id);
    return location ? location.name : 'Невідома локація';
  };

  const getResourceTypeName = (resourceTypeId) => {
    const resourceType = resourceTypes.find((rt) => rt.id === resourceTypeId);
    return resourceType ? `${resourceType.name} (${resourceType.unit})` : 'Невідомий тип';
  };

  const getTotalCost = (delivery) => {
    return delivery.total_cost || delivery.totalCost || delivery.quantity * delivery.price_per_unit || 0;
  };

  const getPricePerUnit = (delivery) => {
    return delivery.price_per_unit || delivery.pricePerUnit || 0;
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const locationName = getLocationName(d).toLowerCase();
    const resourceName = getResourceTypeName(d.energy_resource_type_id).toLowerCase();
    const supplier = (d.supplier || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return resourceName.includes(searchLower) || locationName.includes(searchLower) || supplier.includes(searchLower);
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: isMobile ? 'stretch' : 'space-between',
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
          placeholder="Пошук за ресурсом, локацією або постачальником..."
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0, fontWeight: 500 }}>
          Знайдено: {filteredDeliveries.length} з {deliveries.length}
        </Typography>
      )}

      {isMobile ? (
        <Box sx={{ mt: 0 }}>
          {filteredDeliveries.length > 0 ? (
            filteredDeliveries.map((delivery) => (
              <MobileDeliveryCard
                key={delivery.id}
                delivery={delivery}
                onEdit={onEdit}
                onDelete={removeDelivery}
                getLocationName={getLocationName}
                getResourceTypeName={getResourceTypeName}
                getTotalCost={getTotalCost}
                getPricePerUnit={getPricePerUnit}
              />
            ))
          ) : (
            <Card sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: search ? 0 : 2 }}>
                  {search ? 'За вашим запитом нічого не знайдено' : 'Поставок не знайдено'}
                </Typography>
                {!search && (
                  <Button variant="outlined" onClick={onAdd} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 500 }}>
                    Додати першу поставку
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 1, overflowX: 'auto', mt: 0 }}>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ width: isTablet ? '12%' : '15%', fontWeight: 600 }}>Локація</TableCell>
                <TableCell sx={{ width: isTablet ? '12%' : '15%', fontWeight: 600 }}>Ресурс</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Кількість</TableCell>
                <TableCell sx={{ width: isTablet ? '8%' : '10%', fontWeight: 600 }}>Одиниця</TableCell>
                <TableCell sx={{ width: isTablet ? '12%' : '15%', fontWeight: 600 }}>Дата поставки</TableCell>
                <TableCell sx={{ width: '11%', fontWeight: 600 }}>Ціна за од.</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Сума</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Постачальник</TableCell>
                <TableCell sx={{ width: '5%', fontWeight: 600 }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getLocationName(delivery)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {getResourceTypeName(delivery.energy_resource_type_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {Number(delivery.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(delivery.delivery_date).toLocaleDateString('uk-UA')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {Number(getPricePerUnit(delivery)).toFixed(2)} ₴
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {Number(getTotalCost(delivery)).toFixed(2)} ₴
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
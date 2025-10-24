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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import CustomDatePicker from '../ui/DatePicker';
import { useTheme } from '@mui/material/styles';
import MobileDeliveryCard from './MobileDeliveryCard';

const ResourceDeliveryTable = ({
  deliveries,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  resourceTypeFilter,
  setResourceTypeFilter,
  dateFromFilter,
  setDateFromFilter,
  dateToFilter,
  setDateToFilter,
  onEdit,
  onAdd,
  removeDelivery,
  locations = [],
  resourceTypes = [],
  isLoading,
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
    const deliveryDate = new Date(d.delivery_date);
    deliveryDate.setHours(0, 0, 0, 0); // Обнуляємо час для коректного порівняння дат

    const dateFrom = dateFromFilter ? new Date(dateFromFilter) : null;
    if (dateFrom) dateFrom.setHours(0, 0, 0, 0);
    
    const dateTo = dateToFilter ? new Date(dateToFilter) : null;
    if (dateTo) dateTo.setHours(0, 0, 0, 0);

    const locationMatch = locationFilter === '' || d.location_id === locationFilter;
    const resourceTypeMatch = resourceTypeFilter === '' || d.energy_resource_type_id === resourceTypeFilter;
    const dateFromMatch = !dateFrom || deliveryDate >= dateFrom;
    const dateToMatch = !dateTo || deliveryDate <= dateTo;

    const locationName = getLocationName(d).toLowerCase();
    const resourceName = getResourceTypeName(d.energy_resource_type_id).toLowerCase();
    const supplier = (d.supplier || '').toLowerCase();
    const searchLower = search.toLowerCase();
    const searchMatch = searchLower === '' || resourceName.includes(searchLower) || locationName.includes(searchLower) || supplier.includes(searchLower);

    return locationMatch && resourceTypeMatch && dateFromMatch && dateToMatch && searchMatch;
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
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
            disabled={isLoading}
          >
            Додати поставку
          </Button>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isMobile}
            placeholder="Пошук..."
            sx={{
              width: isMobile ? '100%' : '350px',
              maxWidth: isMobile ? '100%' : '400px',
              flexShrink: 1,
            }}
            disabled={isLoading}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <FormControl fullWidth size="small" disabled={isLoading}>
            <InputLabel>Локація</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label="Локація"
            >
              <MenuItem value="">— Всі локації —</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={isLoading}>
            <InputLabel>Тип ресурсу</InputLabel>
            <Select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              label="Тип ресурсу"
            >
              <MenuItem value="">— Всі ресурси —</MenuItem>
              {resourceTypes.map((res) => (
                <MenuItem key={res.id} value={res.id}>
                  {res.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CustomDatePicker
            label="Дата з"
            value={dateFromFilter}
            onChange={(newValue) => setDateFromFilter(newValue)}
            disabled={isLoading}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          <CustomDatePicker
            label="Дата по"
            value={dateToFilter}
            onChange={(newValue) => setDateToFilter(newValue)}
            disabled={isLoading}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Box>
      </Box>

      {(search || locationFilter || resourceTypeFilter || dateFromFilter || dateToFilter) && (
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
                isLoading={isLoading}
              />
            ))
          ) : (
            <Card sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  За вашими фільтрами нічого не знайдено
                </Typography>
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
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Кількість</TableCell>
                <TableCell sx={{ width: isTablet ? '8%' : '10%', fontWeight: 600 }}>Одиниця</TableCell>
                <TableCell sx={{ width: isTablet ? '12%' : '15%', fontWeight: 600 }}>Дата поставки</TableCell>
                <TableCell sx={{ width: '11%', fontWeight: 600 }}>Ціна за од.</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>Сума</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Постачальник</TableCell>
                <TableCell sx={{ width: '5%', fontWeight: 600, textAlign: 'center' }}>Дії</TableCell>
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
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={0} justifyContent="center">
                        <Tooltip title="Редагувати поставку">
                          <span>
                            <IconButton size="small" onClick={() => onEdit(delivery)} color="primary" disabled={isLoading}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Видалити поставку">
                          <span>
                            <IconButton size="small" onClick={() => removeDelivery(delivery.id)} color="error" disabled={isLoading}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      За вашими фільтрами нічого не знайдено
                    </Typography>
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
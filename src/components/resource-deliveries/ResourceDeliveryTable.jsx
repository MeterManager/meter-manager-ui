import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const ResourceDeliveryTable = ({ deliveries, search, setSearch, onEdit, onAdd, removeDelivery, locations = [] }) => {
  const theme = useTheme();

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

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати поставку
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '15%' }}>Локація</TableCell>
              <TableCell sx={{ width: '15%' }}>Ресурс</TableCell>
              <TableCell sx={{ width: '10%' }}>Кількість</TableCell>
              <TableCell sx={{ width: '10%' }}>Одиниця</TableCell>
              <TableCell sx={{ width: '15%' }}>Дата поставки</TableCell>
              <TableCell sx={{ width: '10%' }}>Ціна за од.</TableCell>
              <TableCell sx={{ width: '10%' }}>Сума</TableCell>
              <TableCell sx={{ width: '15%' }}>Постачальник</TableCell>
              <TableCell sx={{ width: '10%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.locationName}</TableCell>
                  <TableCell>{delivery.resourceTypeName}</TableCell>
                  <TableCell>{delivery.quantity}</TableCell>
                  <TableCell>{delivery.unit}</TableCell>
                  <TableCell>{new Date(delivery.deliveryDate).toLocaleDateString('uk-UA')}</TableCell>
                  <TableCell>{delivery.pricePerUnit}</TableCell>
                  <TableCell>{delivery.totalCost}</TableCell>
                  <TableCell>{delivery.supplier}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(delivery)}>
                      Редагувати
                    </Button>
                    <Button size="small" onClick={() => removeDelivery(delivery.id)} color="error">
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Поставок не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResourceDeliveryTable;

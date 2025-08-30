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
  Chip,
} from '@mui/material';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const TariffsTable = ({ tariffs, onEdit, onAdd, onDelete, locationsMap, resourceTypesMap, search, setSearch }) => {
  const theme = useTheme();

  if (!locationsMap || !resourceTypesMap) {
    return <div>Завантаження...</div>;
  }

  const filteredTariffs = (tariffs || []).filter((tariff) => {
    const locationName = locationsMap[tariff.location_id] || '';
    const resourceName = resourceTypesMap[tariff.energy_resource_type_id] || '';
    const searchTerm = search.toLowerCase();

    return locationName.toLowerCase().includes(searchTerm) || resourceName.toLowerCase().includes(searchTerm);
  });

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати тариф
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '20%' }}>Локація</TableCell>
              <TableCell sx={{ width: '20%' }}>Тип ресурсу</TableCell>
              <TableCell sx={{ width: '15%' }}>Ціна</TableCell>
              <TableCell sx={{ width: '15%' }}>Діє з</TableCell>
              <TableCell sx={{ width: '15%' }}>Діє до</TableCell>
              <TableCell sx={{ width: '15%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTariffs.length > 0 ? (
              filteredTariffs.map((tariff) => (
                <TableRow key={tariff.id}>
                  <TableCell>{locationsMap[tariff.location_id] || '—'}</TableCell>
                  <TableCell>{resourceTypesMap[tariff.energy_resource_type_id] || '—'}</TableCell>
                  <TableCell>{tariff.price} ₴</TableCell>
                  <TableCell>{tariff.valid_from}</TableCell>
                  <TableCell>
                    {tariff.valid_to ? tariff.valid_to : <Chip label="Безстроково" color="success" size="small" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(tariff)}>
                      Редагувати
                    </Button>
                    <Button size="small" onClick={() => onDelete(tariff.id)} color="error">
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Тарифів не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TariffsTable;

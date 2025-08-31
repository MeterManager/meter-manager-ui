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
  Switch,
} from '@mui/material';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
const LocationsTable = ({
  locations,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeLocation,
  updateLocationStatus,
  setLocalError,
}) => {
  const theme = useTheme();
  const handleStatusChange = async (location) => {
    try {
      await updateLocationStatus(location.id, !location.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу локації');
    }
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) || loc.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати локацію
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '20%' }}>Назва</TableCell>
              <TableCell sx={{ width: '40%' }}>Адреса</TableCell>
              <TableCell sx={{ width: '20%' }}>Статус</TableCell>
              <TableCell sx={{ width: '20%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>{loc.name}</TableCell>
                  <TableCell>{loc.address}</TableCell>
                  <TableCell>
                    <Switch checked={loc.isActive} onChange={() => handleStatusChange(loc)} color="primary" />
                    {loc.isActive ? 'Активна' : 'Неактивна'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(loc)}>
                      Редагувати
                    </Button>
                    <Button size="small" onClick={() => removeLocation(loc.id)} color="error" disabled={loc.isActive}>
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Локації не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LocationsTable;

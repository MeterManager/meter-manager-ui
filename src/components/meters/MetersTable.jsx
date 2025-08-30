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

const MetersTable = ({
  meters,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeMeter,
  updateMeterStatus,
  setLocalError,
}) => {
  const theme = useTheme();

  const handleStatusChange = async (meter) => {
    try {
      await updateMeterStatus(meter.id, {
        is_active: !meter.isActive,
      });
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу лічільника');
    }
  };

  const filteredMeters = meters.filter(
    (meter) =>
      meter.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      meter.locationName.toLowerCase().includes(search.toLowerCase()) ||
      meter.energyResourceType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати лічільник
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '20%' }}>Серійний номер</TableCell>
              <TableCell sx={{ width: '25%' }}>Локація</TableCell>
              <TableCell sx={{ width: '20%' }}>Тип ресурсу</TableCell>
              <TableCell sx={{ width: '15%' }}>Статус</TableCell>
              <TableCell sx={{ width: '20%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMeters.length > 0 ? (
              filteredMeters.map((meter) => (
                <TableRow key={meter.id}>
                  <TableCell>{meter.serial_number}</TableCell>
                  <TableCell>{meter.locationName}</TableCell>
                  <TableCell>{meter.energyResourceType}</TableCell>
                  <TableCell>
                    <Switch
                      checked={meter.isActive}
                      onChange={() => handleStatusChange(meter)}
                      color="primary"
                    />
                    {meter.isActive ? 'Активний' : 'Неактивний'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(meter)}>
                      Редагувати
                    </Button>
                    <Button
                      size="small"
                      onClick={() => removeMeter(meter.id)}
                      color="error"
                      disabled={meter.isActive}
                    >
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Лічільники не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MetersTable;
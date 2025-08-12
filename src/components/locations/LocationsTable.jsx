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
} from '@mui/material';
import SearchField from '../ui/SearchField';

const LocationsTable = ({
  locations,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeLocation,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button variant="contained" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати локацію
        </Button>
        <Box sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}>
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Адреса</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>{loc.id}</TableCell>
                <TableCell>{loc.name}</TableCell>
                <TableCell>{loc.address}</TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(loc)}>Редагувати</Button>
                  <Button onClick={() => removeLocation(loc.id)} color="error">
                    Видалити
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {locations.length === 0 && (
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

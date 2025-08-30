import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
} from '@mui/material';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const MeterTenantsTable = ({ meterTenants, onEdit, onDelete, onAdd, search, setSearch }) => {
  const theme = useTheme();

  const filteredMeterTenants = meterTenants.filter((mt) => {
    const tenantName = (mt.Tenant?.name || mt.tenantId || '').toLowerCase();
    const meterSerial = (mt.Meter?.serialNumber || mt.meterId || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return tenantName.includes(searchLower) || meterSerial.includes(searchLower);
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 2,
        }}
      >
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати зв'язок
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Орендар</TableCell>
              <TableCell>Лічильник</TableCell>
              <TableCell>Дата початку</TableCell>
              <TableCell>Дата завершення</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMeterTenants.length > 0 ? (
              filteredMeterTenants.map((mt) => (
                <TableRow key={mt.id}>
                  <TableCell>{mt.Tenant?.name || mt.tenantId}</TableCell>
                  <TableCell>{mt.Meter?.serialNumber || mt.meterId}</TableCell>
                  <TableCell>{mt.startDate}</TableCell>
                  <TableCell>{mt.endDate || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => onEdit(mt)}>
                        Редагувати
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => onDelete(mt.id)}>
                        Видалити
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'Нічого не знайдено за запитом' : "Зв'язки не знайдено"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MeterTenantsTable;

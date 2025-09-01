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
  Typography,
  Box,
} from '@mui/material';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const MeterTenantsTable = ({ meterTenants, tenants = [], meters = [], onEdit, onDelete, onAdd }) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const getTenantName = (tenantId) => tenants.find((t) => t.id === tenantId)?.name || tenantId;
  const getMeterSerial = (meterId) => meters.find((m) => m.id === meterId)?.serial_number || meterId;

  const filteredMeterTenants = meterTenants.filter((mt) => {
    const tenantName = getTenantName(mt.tenant_id).toLowerCase();
    const meterSerial = getMeterSerial(mt.meter_id).toLowerCase();
    const query = search.toLowerCase();
    return tenantName.includes(query) || meterSerial.includes(query);
  });

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати зв’язок
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
              <TableCell>Лічильник (серійний номер)</TableCell>
              <TableCell>Дата початку</TableCell>
              <TableCell>Дата завершення</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMeterTenants.length > 0 ? (
              filteredMeterTenants.map((mt) => (
                <TableRow key={mt.id}>
                  <TableCell>{getTenantName(mt.tenant_id)}</TableCell>
                  <TableCell>{getMeterSerial(mt.meter_id)}</TableCell>
                  <TableCell>{mt.assigned_from}</TableCell>
                  <TableCell>{mt.assigned_to || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => onEdit(mt)}>
                        Редагувати
                      </Button>
                      <Button size="small" color="error" onClick={() => onDelete(mt.id)}>
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
                    Зв’язки не знайдено
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
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

const MeterTenantsTable = ({ meterTenants, tenants = [], meters = [], onEdit, onDelete, onAdd }) => {
  const getTenantName = (tenantId) => tenants.find((t) => t.id === tenantId)?.name || tenantId;
  const getMeterSerial = (meterId) => meters.find((m) => m.id === meterId)?.serial_number || meterId;

  return (
    <Box>
      <Box mb={2}>
        <Button variant="contained" size="small" onClick={onAdd}>
          Додати зв’язок
        </Button>
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
            {meterTenants.length > 0 ? (
              meterTenants.map((mt) => (
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

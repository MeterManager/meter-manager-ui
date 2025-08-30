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

const MeterTenantsTable = ({ meterTenants, onEdit, onDelete }) => {
  return (
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
          {meterTenants.length > 0 ? (
            meterTenants.map((mt) => (
              <TableRow key={mt.id}>
                <TableCell>{mt.Tenant?.name || mt.tenantId}</TableCell>
                <TableCell>{mt.Meter?.serialNumber || mt.meterId}</TableCell>
                <TableCell>{mt.startDate}</TableCell>
                <TableCell>{mt.endDate || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => onEdit(mt)}>Редагувати</Button>
                    <Button size="small" color="error" onClick={() => onDelete(mt.id)}>Видалити</Button>
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
  );
};

export default MeterTenantsTable;

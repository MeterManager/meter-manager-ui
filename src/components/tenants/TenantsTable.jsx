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
  Typography,
  useTheme,
} from '@mui/material';
import SearchField from '../ui/SearchField';

const TenantsTable = ({
  tenants,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeTenant,
  updateTenantStatus,
  setLocalError,
  locations = [],
}) => {
  const theme = useTheme();

  const handleStatusChange = async (tenant) => {
    try {
      await updateTenantStatus(tenant.id, {
        is_active: !tenant.isActive,
      });
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу орендаря');
    }
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Невідома локація';
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      (tenant.contactPerson && tenant.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (tenant.email && tenant.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button variant="contained" size="small" onClick={onAdd} sx={{ whiteSpace: 'nowrap' }}>
          Додати орендаря
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '20%' }}>Орендар</TableCell>
              <TableCell sx={{ width: '20%' }}>Локація</TableCell>
              <TableCell sx={{ width: '10%' }}>Площа (м²)</TableCell>
              <TableCell sx={{ width: '15%' }}>Контакти</TableCell>
              <TableCell sx={{ width: '15%' }}>Статус</TableCell>
              <TableCell sx={{ width: '20%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {tenant.name}
                      </Typography>
                      {tenant.contactPerson && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {tenant.contactPerson}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getLocationName(tenant.locationId)}</TableCell>
                  <TableCell>
                    {tenant.occupiedArea ? `${tenant.occupiedArea} м²` : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {tenant.phone && (
                        <Typography variant="caption">{tenant.phone}</Typography>
                      )}
                      {tenant.email && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {tenant.email}
                        </Typography>
                      )}
                      {!tenant.phone && !tenant.email && '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch 
                        checked={tenant.isActive} 
                        onChange={() => handleStatusChange(tenant)} 
                        color="primary" 
                        size="small"
                      />
                      <Typography variant="caption">
                        {tenant.isActive ? 'Активний' : 'Неактивний'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(tenant)}>
                      Редагувати
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => removeTenant(tenant.id)} 
                      color="error" 
                      disabled={tenant.isActive}
                    >
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Орендарі не знайдено
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

export default TenantsTable;
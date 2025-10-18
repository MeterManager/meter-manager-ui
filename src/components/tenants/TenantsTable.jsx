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
  IconButton,
  Chip,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Phone, Email } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const TenantsTable = ({
  tenants,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeTenant,
  updateTenantStatus,
  getTenantDependencies,
  setLocalError,
  locations = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  const handleStatusChange = async (tenant) => {
    try {
      if (tenant.isActive) {
        const deps = await getTenantDependencies(tenant.id);
        if (deps?.data?.active_meter_tenants > 0) {
          const confirm = window.confirm(
            `У орендаря "${tenant.name}" є ${deps.data.active_meter_tenants} активних лічильників.\n` +
            `Вони також будуть деактивовані. Продовжити?`
          );
          if (!confirm) return;
        }
      }
      await updateTenantStatus(tenant.id, !tenant.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу орендаря');
    }
  };

  const handleRemove = async (tenant) => {
    try {
      const deps = await getTenantDependencies(tenant.id);
      if (deps?.data?.active_meter_tenants > 0) {
        const confirm = window.confirm(
          `У орендаря "${tenant.name}" є ${deps.data.active_meter_tenants} активних лічильників.\n` +
          `Видалення призведе до втрати цих даних. Ви впевнені?`
        );
        if (!confirm) return;
      }
      await removeTenant(tenant.id);
    } catch (err) {
      setLocalError(err.message || 'Помилка при видаленні орендаря');
    }
  };

  const getTenantLocations = (tenant) => {
    if (!tenant.locations || !Array.isArray(tenant.locations) || tenant.locations.length === 0) {
      return [];
    }
      return tenant.locations.map(loc => loc.name);
    };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      (tenant.contactPerson && tenant.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (tenant.email && tenant.email.toLowerCase().includes(search.toLowerCase())) ||
      getTenantLocations(tenant).some(locationName => 
        locationName.toLowerCase().includes(search.toLowerCase())
      )
  );

  const MobileTenantCard = ({ tenant }) => (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              {tenant.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getTenantLocations(tenant).join(', ') || '—'}
            </Typography>

          </Box>
          <Chip
            label={tenant.isActive ? 'Активний' : 'Неактивний'}
            color={tenant.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        {(tenant.contactPerson) && (
          <Box sx={{ mb: 2 }}>
            {tenant.contactPerson && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Контакт: {tenant.contactPerson}
              </Typography>
            )}
          </Box>
        )}

        {(tenant.phone || tenant.email) && (
          <Box sx={{ mb: 2 }}>
            {tenant.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{tenant.phone}</Typography>
              </Box>
            )}
            {tenant.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{tenant.email}</Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={tenant.isActive}
              onChange={() => handleRemove(tenant)}
              color="primary"
              size="small"
            />
            <Typography variant="body2">{tenant.isActive ? 'Активний' : 'Неактивний'}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(tenant)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={tenant.isActive ? 'Неможливо видалити активного орендаря' : 'Видалити'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => removeTenant(tenant.id)}
                  color="error"
                  disabled={tenant.isActive}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: isMobile ? 'stretch' : 'space-between',
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={onAdd}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : '160px',
            height: '40px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Додати орендаря
        </Button>

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          placeholder="Пошук за назвою, контактом або email..."
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredTenants.length} з {tenants.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => <MobileTenantCard key={tenant.id} tenant={tenant} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Орендарів не знайдено'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell
                  sx={{
                    width: '20%',
                    fontWeight: 600,
                  }}
                >
                  Орендар
                </TableCell>
                <TableCell
                  sx={{
                    width: '20%',
                    fontWeight: 600,
                  }}
                >
                  Локація
                </TableCell>
                <TableCell
                  sx={{
                    width: '18%',
                    fontWeight: 600,
                  }}
                >
                  Контакти
                </TableCell>
                <TableCell
                    sx={{
                    width: '17%',
                    fontWeight: 600,
                  }}
                >
                  Статус
                </TableCell>
                <TableCell
                  sx={{
                    width: '5%',
                    fontWeight: 600,
                  }}
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tenant.name}
                        </Typography>
                        {tenant.contactPerson && (
                          <Typography variant="caption" color="text.secondary">
                            {tenant.contactPerson}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getTenantLocations(tenant).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      ) : (
                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                        {getTenantLocations(tenant).map((loc, idx) => (
                        <li key={idx}>
                        <Typography variant="body2" color="text.secondary">{loc}</Typography>
                          </li>
                      ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {tenant.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone fontSize="1.1rem" color="action" />
                            <Typography variant="caption">{tenant.phone}</Typography>
                          </Box>
                        )}
                        {tenant.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email fontSize="1.1rem" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {tenant.email}
                            </Typography>
                          </Box>
                        )}
                        {!tenant.phone && !tenant.email && (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
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
                        <Chip
                          label={tenant.isActive ? 'Активний' : 'Неактивний'}
                          color={tenant.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати орендаря">
                          <IconButton size="small" onClick={() => onEdit(tenant)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={tenant.isActive ? 'Спочатку деактивуйте орендаря' : 'Видалити орендаря'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => removeTenant(tenant.id)}
                              disabled={tenant.isActive}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : 'Орендарів не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати першого орендаря
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TenantsTable;

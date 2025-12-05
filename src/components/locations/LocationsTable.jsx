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
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const LocationsTable = ({
  locations,
  tenants = [],
  tenantFilter,
  search,
  setTenantFilter,
  setSearch,
  onEdit,
  onAdd,
  onRemove,
  onStatusChange,
  setLocalError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  const handleActionError = (err) => {
    const message = err.message || 'Помилка при виконанні дії';
    setLocalError(message);
  };

  const handleStatusChange = async (location) => {
    try {
      await onStatusChange(location.id, !location.isActive);
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await onRemove(id);
    } catch (err) {
      handleActionError(err);
    }
  };

  const filteredLocations = locations
    .filter((loc) => {
      if (tenantFilter === '') return true;
      if (tenantFilter === 'null') return !loc.tenant?.id;
      return loc.tenant?.id === parseInt(tenantFilter);
    })
    .filter((loc) => {
      const searchText = search.toLowerCase();
      return (
        (loc.name || '').toLowerCase().includes(searchText) ||
        (loc.address || '').toLowerCase().includes(searchText) ||
        (loc.tenant?.name || '— вільна —').toLowerCase().includes(searchText)
      );
    });

  const MobileLocationCard = ({ location }) => (
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
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {location.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {location.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Відсоток Площі: {location.occupied_area ? `${location.occupied_area}%` : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Орендар: <strong>{location.tenant ? location.tenant.name : '— Вільна —'}</strong>
            </Typography>
          </Box>

          <Chip
            label={location.isActive ? 'Активна' : 'Неактивна'}
            color={location.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={location.isActive}
              onChange={() => handleStatusChange(location)}
              color="primary"
              size="small"
            />
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(location)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={location.isActive ? 'Спочатку деактивуйте локацію' : 'Видалити'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(location.id)}
                  color="error"
                  disabled={location.isActive}
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
          Додати локацію
        </Button>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              width: isMobile ? '100%' : '200px',
              flexShrink: 0,
            }}
          >
            <InputLabel>Орендар</InputLabel>
            <Select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} label="Орендар">
              <MenuItem value="">— Всі орендарі —</MenuItem>
              <MenuItem value="null">— Вільні локації —</MenuItem>
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              width: '100%',
              maxWidth: '100%',
            }}
          />
        </Box>
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredLocations.length} з {locations.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => <MobileLocationCard key={location.id} location={location} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Локації не знайдено'}
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
                <TableCell sx={{ width: isTablet ? '20%' : '18%', fontWeight: 600 }}>Назва</TableCell>
                <TableCell sx={{ width: isTablet ? '30%' : '32%', fontWeight: 600 }}>Адреса</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Відсоток Площі (%)</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Орендар</TableCell>
                <TableCell sx={{ width: isTablet ? '20%' : '20%', fontWeight: 600 }}>Статус</TableCell>
                <TableCell sx={{ width: '5%', fontWeight: 600 }}>Дії</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <TableRow
                    key={loc.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {loc.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {loc.address}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{loc.occupied_area ? `${loc.occupied_area}%` : '—'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{loc.tenant ? loc.tenant.name : '— Вільна —'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={loc.isActive}
                          onChange={() => handleStatusChange(loc)}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={loc.isActive ? 'Активна' : 'Неактивна'}
                          color={loc.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати локацію">
                          <IconButton size="small" onClick={() => onEdit(loc)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={loc.isActive ? 'Спочатку деактивуйте локацію' : 'Видалити локацію'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(loc.id)}
                              disabled={loc.isActive}
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
                      {search ? 'За вашим запитом нічого не знайдено' : 'Локації не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати першу локацію
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

export default LocationsTable;

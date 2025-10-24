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
  Chip,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, AttachMoney, LocationOn, Category, CalendarToday } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const TariffsTable = ({
  tariffs,
  onEdit,
  onAdd,
  onDelete,
  locationsMap,
  resourceTypesMap,
  locations,
  resourceTypes,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  resourceTypeFilter,
  setResourceTypeFilter,
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  if (!locationsMap || !resourceTypesMap) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Завантаження...
        </Typography>
      </Box>
    );
  }

  const filteredTariffs = (tariffs || []).filter((tariff) => {
    const locationName = locationsMap[tariff.location_id] || '';
    const resourceName = resourceTypesMap[tariff.energy_resource_type_id] || '';
    const searchTerm = search.toLowerCase();

    const locationMatch = locationFilter === '' || tariff.location_id === locationFilter;
    const resourceTypeMatch = resourceTypeFilter === '' || tariff.energy_resource_type_id === resourceTypeFilter;
    const searchMatch =
      searchTerm === '' ||
      locationName.toLowerCase().includes(searchTerm) ||
      resourceName.toLowerCase().includes(searchTerm) ||
      tariff.price.toString().includes(searchTerm);
    return locationMatch && resourceTypeMatch && searchMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const isCurrentTariff = (tariff) => {
    const now = new Date();
    const validFrom = new Date(tariff.valid_from);
    const validTo = tariff.valid_to ? new Date(tariff.valid_to) : null;
    now.setHours(0,0,0,0);
    validFrom.setHours(0,0,0,0);
    if(validTo) validTo.setHours(0,0,0,0);


    return now >= validFrom && (!validTo || now <= validTo);
  };

  const MobileTariffCard = ({ tariff }) => (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: isCurrentTariff(tariff)
          ? `4px solid ${theme.palette.success.main}`
          : `4px solid ${theme.palette.grey[300]}`,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {tariff.price} ₴
          </Typography>
          <Chip
            label={isCurrentTariff(tariff) ? 'Активний' : 'Неактивний'}
            color={isCurrentTariff(tariff) ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <LocationOn sx={{ fontSize: '16px', color: 'grey.500' }} />
            <Typography variant="body2" color="text.secondary">
              {locationsMap[tariff.location_id] || '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Category sx={{ fontSize: '16px', color: 'grey.500' }} />
            <Typography variant="body2" color="text.secondary">
              {resourceTypesMap[tariff.energy_resource_type_id] || '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <CalendarToday sx={{ fontSize: '16px', color: 'grey.500' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(tariff.valid_from)}
              {tariff.valid_to ? ` - ${formatDate(tariff.valid_to)}` : ' (безстроково)'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Редагувати тариф">
           <span>
            <IconButton size="small" onClick={() => onEdit(tariff)} color="primary" disabled={isLoading}>
              <Edit fontSize="small" />
            </IconButton>
           </span>
          </Tooltip>
          <Tooltip title="Видалити тариф">
           <span>
            <IconButton size="small" onClick={() => onDelete(tariff.id)} color="error" disabled={isLoading}>
              <Delete fontSize="small" />
            </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
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
            disabled={isLoading}
          >
            Додати тариф
          </Button>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isMobile}
            placeholder="Пошук за локацією, ресурсом, ціною..."
            sx={{
              width: isMobile ? '100%' : '350px',
              maxWidth: isMobile ? '100%' : '400px',
              flexShrink: 1,
            }}
             disabled={isLoading}
          />
        </Box>
        <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2,
            }}
        >
            <FormControl fullWidth size="small" disabled={isLoading}>
              <InputLabel>Локація</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label="Локація"
              >
                <MenuItem value="">— Всі локації —</MenuItem>
                {locations.filter(l=> l.isActive).map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
             <FormControl fullWidth size="small" disabled={isLoading}>
              <InputLabel>Тип ресурсу</InputLabel>
              <Select
                value={resourceTypeFilter}
                onChange={(e) => setResourceTypeFilter(e.target.value)}
                label="Тип ресурсу"
              >
                <MenuItem value="">— Всі ресурси —</MenuItem>
                {resourceTypes.filter(rt => rt.isActive).map((res) => (
                  <MenuItem key={res.id} value={res.id}>
                    {res.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        </Box>
      </Box>

      {(search || locationFilter || resourceTypeFilter) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredTariffs.length} з {tariffs.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredTariffs.length > 0 ? (
            filteredTariffs.map((tariff) => <MobileTariffCard key={tariff.id} tariff={tariff} isLoading={isLoading} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  За вашими фільтрами нічого не знайдено
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
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Локація</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Тип ресурсу</TableCell>
                <TableCell sx={{ width: '18%', fontWeight: 600 }}>Ціна</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>Діє з</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>Діє до</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600, textAlign: 'center' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTariffs.length > 0 ? (
                filteredTariffs.map((tariff) => (
                  <TableRow
                    key={tariff.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      borderLeft: isCurrentTariff(tariff) ? `4px solid ${theme.palette.success.main}` : 'none',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {locationsMap[tariff.location_id] || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {resourceTypesMap[tariff.energy_resource_type_id] || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {tariff.price} ₴
                        </Typography>
                        {isCurrentTariff(tariff) && (
                          <Chip label="Активний" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(tariff.valid_from)}</Typography>
                    </TableCell>
                    <TableCell>
                      {tariff.valid_to ? (
                        <Typography variant="body2">{formatDate(tariff.valid_to)}</Typography>
                      ) : (
                        <Chip label="Безстроково" color="info" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={0} justifyContent="center">
                        <Tooltip title="Редагувати тариф">
                          <span>
                            <IconButton size="small" onClick={() => onEdit(tariff)} color="primary" disabled={isLoading}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Видалити тариф">
                         <span>
                          <IconButton size="small" onClick={() => onDelete(tariff.id)} color="error" disabled={isLoading}>
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
                      За вашими фільтрами нічого не знайдено
                    </Typography>
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

export default TariffsTable;

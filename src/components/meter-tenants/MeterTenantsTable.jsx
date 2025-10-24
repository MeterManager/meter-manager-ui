import { useState, useMemo } from 'react';
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
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
import { translateErrorMessage } from '../../utils/translateError';

const MobileMeterTenantCard = ({ meterTenant, tenants = [], meters = [], onEdit, onDelete, isLoading }) => {
  const theme = useTheme();
  const getTenantName = (tenantId) => tenants.find((t) => t.id === tenantId)?.name || `ID: ${tenantId}`;
  const getMeterSerial = (meterId) => meters.find((m) => m.id === meterId)?.serial_number || `ID: ${meterId}`;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('uk-UA') : '–';

  return (
    <Card sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Орендар: {getTenantName(meterTenant.tenant_id)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Лічильник: {getMeterSerial(meterTenant.meter_id)}
          </Typography>
        </Box>
        <Typography variant="caption" display="block" color="text.secondary">
          Період: {formatDate(meterTenant.assigned_from)} - {formatDate(meterTenant.assigned_to)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Tooltip title="Редагувати">
            <span>
              <IconButton size="small" onClick={() => onEdit(meterTenant)} color="primary" disabled={isLoading}>
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Видалити">
            <span>
              <IconButton size="small" onClick={() => onDelete(meterTenant.id)} color="error" disabled={isLoading}>
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

const MeterTenantsTable = ({
  meterTenants,
  tenants = [],
  meters = [],
  locations = [],
  resourceTypes = [],
  onEdit,
  onDelete,
  onAdd,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  tenantFilter,
  setTenantFilter,
  isLoading,
  setLocalError
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const [loadingItemId, setLoadingItemId] = useState(null);

  const tenantMap = useMemo(() => tenants.reduce((acc, t) => { acc[t.id] = t.name; return acc; }, {}), [tenants]);
  const meterMap = useMemo(() => meters.reduce((acc, m) => {
    const resourceType = resourceTypes.find(rt => rt.id === m.energy_resource_type_id);
    acc[m.id] = {
      serial: m.serial_number || `ID:${m.id}`,
      locationId: m.location_id,
      resourceName: resourceType?.name || '?',
      unit: resourceType?.unit || '?'
    };
    return acc;
  }, {}), [meters, resourceTypes]);
  const locationMap = useMemo(() => locations.reduce((acc, l) => { acc[l.id] = l.name; return acc; }, {}), [locations]);

  const getTenantName = (tenantId) => tenantMap[tenantId] || `ID: ${tenantId}`;
  const getMeterInfo = (meterId) => meterMap[meterId] || { serial: `ID: ${meterId}`, locationId: null, resourceName: '?', unit: '?' };

  const filteredMeterTenants = useMemo(() => meterTenants.filter((mt) => {
    const meterInfo = getMeterInfo(mt.meter_id);
    const tenantName = getTenantName(mt.tenant_id).toLowerCase();
    const meterSerial = meterInfo.serial.toLowerCase();
    const locationId = meterInfo.locationId;
    const query = search.toLowerCase();

    const locationMatch = !locationFilter || locationId === locationFilter;
    const tenantMatch = !tenantFilter || mt.tenant_id === tenantFilter;
    const searchMatch = query === '' || tenantName.includes(query) || meterSerial.includes(query);

    return locationMatch && tenantMatch && searchMatch;
  }), [meterTenants, search, locationFilter, tenantFilter, getMeterInfo, getTenantName]);

  const formatDate = (dateString) => {
    if (!dateString) return '–';
    try {
      return new Date(dateString).toLocaleDateString('uk-UA');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleDeleteClick = async (id) => {
    setLoadingItemId(id);
    try {
      await onDelete(id);
    } catch (e) {
    } finally {
      setLoadingItemId(null);
    }
  };

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
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onAdd}
            fullWidth={isMobile}
            sx={{ minWidth: isMobile ? 'auto' : '160px', height: '40px', whiteSpace: 'nowrap', flexShrink: 0, order: isMobile ? 1 : 0 }}
            disabled={isLoading}
          >
            Додати призначення
          </Button>
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isMobile}
            placeholder="Пошук..."
            sx={{ width: isMobile ? '100%' : '350px', maxWidth: '100%', order: isMobile ? 0 : 1 }}
            disabled={isLoading}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <FormControl fullWidth size="small" disabled={isLoading}>
            <InputLabel>Локація</InputLabel>
            <Select
              value={locationFilter}
              label="Локація"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <MenuItem value=""><em>Всі локації</em></MenuItem>
              {locations.filter(l => l.isActive).map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" disabled={isLoading}>
            <InputLabel>Орендар</InputLabel>
            <Select
              value={tenantFilter}
              label="Орендар"
              onChange={(e) => setTenantFilter(e.target.value)}
            >
              <MenuItem value=""><em>Всі орендарі</em></MenuItem>
              {tenants.filter(t => t.isActive).map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {(search || locationFilter || tenantFilter) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredMeterTenants.length} з {meterTenants.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredMeterTenants.length > 0 ? (
            filteredMeterTenants.map((meterTenant) => (
              <MobileMeterTenantCard
                key={meterTenant.id}
                meterTenant={meterTenant}
                tenants={tenants}
                meters={meters}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
                isLoading={isLoading || loadingItemId === meterTenant.id}
              />
            ))
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
                <TableCell sx={{ width: '25%', fontWeight: 600 }}>Орендар</TableCell>
                <TableCell sx={{ width: '25%', fontWeight: 600 }}>Лічильник</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>Локація</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>Дата початку</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>Дата завершення</TableCell>
                <TableCell sx={{ width: '5%', fontWeight: 600, textAlign: 'center' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeterTenants.length > 0 ? (
                filteredMeterTenants.map((mt) => {
                  const meterInfo = getMeterInfo(mt.meter_id);
                  const locationName = locationMap[meterInfo.locationId] || '?';
                  const isLoadingRow = loadingItemId === mt.id;
                  return (
                    <TableRow key={mt.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{getTenantName(mt.tenant_id)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{meterInfo.serial}</Typography>
                        <Typography variant="caption" color="text.disabled">{meterInfo.resourceName} ({meterInfo.unit})</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{locationName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(mt.assigned_from)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={mt.assigned_to ? 'text.secondary' : 'text.primary'}>
                          {formatDate(mt.assigned_to)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0} justifyContent="center">
                          <Tooltip title="Редагувати">
                            <span>
                              <IconButton size="small" onClick={() => onEdit(mt)} color="primary" disabled={isLoading || isLoadingRow}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Видалити">
                            <span>
                              <IconButton size="small" onClick={() => handleDeleteClick(mt.id)} color="error" disabled={isLoading || isLoadingRow}>
                                {isLoadingRow ? <CircularProgress size={20} color="inherit" /> : <Delete fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
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

export default MeterTenantsTable;

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
  Box,
  Switch,
  IconButton,
  Chip,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
import { translateErrorMessage } from '../../utils/translateError';

const MetersTable = ({
  meters,
  onEdit,
  onAdd,
  removeMeter,
  updateMeterStatus,
  setLocalError,
  locations = [],
  energyResourceTypes = [],
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [loadingMeterId, setLoadingMeterId] = useState(null);

  const handleActionFailure = (err) => {
    const userMessage = translateErrorMessage(err.message || 'Помилка виконання дії');
    setLocalError?.(userMessage);
  };

  const handleStatusChange = async (meter) => {
    if (isLoading || loadingMeterId !== null) return;

    setLoadingMeterId(meter.id);
    try {
      await updateMeterStatus(meter.id, !meter.isActive);
    } catch (err) {
      handleActionFailure(err);
    } finally {
      setLoadingMeterId(null);
    }
  };

  const handleRemoveClick = (meterId) => {
    removeMeter(meterId);
  };

  const getLocationName = (locationId) => locations.find((l) => l.id === locationId)?.name || 'Невідома локація';
  const getResourceName = (resourceId) =>
    energyResourceTypes.find((rt) => rt.id === resourceId)?.name || 'Невідомий ресурс';

  const filteredMeters = meters.filter((meter) => {
    const serial = (meter.serial_number || '').toLowerCase();
    const locationName = getLocationName(meter.location_id).toLowerCase();
    const resourceName = getResourceName(meter.energy_resource_type_id).toLowerCase();
    const query = search.toLowerCase();

    const locationMatch = !selectedLocation || meter.location_id === selectedLocation;
    const resourceTypeMatch = !selectedResourceType || meter.energy_resource_type_id === selectedResourceType;

    const searchMatch =
      query === '' || serial.includes(query) || locationName.includes(query) || resourceName.includes(query);

    return locationMatch && resourceTypeMatch && searchMatch;
  });

  const MobileMeterCard = ({ meter }) => {
    const isRowLoading = loadingMeterId === meter.id;

    return (
      <Card
        sx={{
          mb: 2,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': { boxShadow: 2 },
        }}
      >
        <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {meter.serial_number}
            </Typography>
            <Chip
              label={meter.isActive ? 'Активний' : 'Неактивний'}
              color={meter.isActive ? 'success' : 'default'}
              size="small"
              sx={{ ml: 1, flexShrink: 0 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Локація:</strong> {getLocationName(meter.location_id)}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Тип ресурсу:</strong> {getResourceName(meter.energy_resource_type_id)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isRowLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Switch
                  checked={meter.isActive}
                  onChange={() => handleStatusChange(meter)}
                  color="primary"
                  size="small"
                  disabled={isLoading || loadingMeterId !== null}
                />
              )}
              <Typography variant="body2">{meter.isActive ? 'Активний' : 'Неактивний'}</Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Редагувати">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(meter)}
                    color="primary"
                    disabled={isLoading || loadingMeterId !== null}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={meter.isActive ? 'Спочатку деактивуйте лічильник' : 'Видалити'}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveClick(meter.id)}
                    color="error"
                    disabled={meter.isActive || isLoading || loadingMeterId !== null}
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
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              width: isMobile ? '100%' : 'auto',
              minWidth: '160px',
              height: '40px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            disabled={isLoading}
          >
            Додати лічильник
          </Button>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
            sx={{
              width: isMobile ? '100%' : '300px',
            }}
            disabled={isLoading}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }} disabled={isLoading}>
            <InputLabel>Локація</InputLabel>
            <Select value={selectedLocation} label="Локація" onChange={(e) => setSelectedLocation(e.target.value)}>
              <MenuItem value="">
                <em>Всі локації</em>
              </MenuItem>
              {locations
                .filter((l) => l.isActive)
                .map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }} disabled={isLoading}>
            <InputLabel>Тип ресурсу</InputLabel>
            <Select
              value={selectedResourceType}
              label="Тип ресурсу"
              onChange={(e) => setSelectedResourceType(e.target.value)}
            >
              <MenuItem value="">
                <em>Всі типи</em>
              </MenuItem>
              {energyResourceTypes
                .filter((rt) => rt.isActive)
                .map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {(search || selectedLocation || selectedResourceType) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredMeters.length} з {meters.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredMeters.length > 0 ? (
            filteredMeters.map((meter) => (
              <MobileMeterCard key={meter.id} meter={meter} isLoading={isLoading || loadingMeterId === meter.id} />
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
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Серійний номер</TableCell>
                <TableCell sx={{ width: '25%', fontWeight: 600 }}>Локація</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Тип ресурсу</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>Статус</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600, textAlign: 'center' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeters.length > 0 ? (
                filteredMeters.map((meter) => {
                  const isRowLoading = loadingMeterId === meter.id;
                  const isDisabled = isLoading || loadingMeterId !== null;

                  return (
                    <TableRow key={meter.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {meter.serial_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getLocationName(meter.location_id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getResourceName(meter.energy_resource_type_id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isRowLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Switch
                              checked={meter.isActive}
                              onChange={() => handleStatusChange(meter)}
                              color="primary"
                              size="small"
                              disabled={isDisabled}
                            />
                          )}
                          <Chip
                            label={meter.isActive ? 'Активний' : 'Неактивний'}
                            color={meter.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0} justifyContent="center">
                          <Tooltip title="Редагувати лічильник">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => onEdit(meter)}
                                color="primary"
                                disabled={isDisabled}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={meter.isActive ? 'Спочатку деактивуйте лічильник' : 'Видалити лічильник'}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveClick(meter.id)}
                                disabled={meter.isActive || isDisabled}
                                color="error"
                              >
                                <Delete fontSize="small" />
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
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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

export default MetersTable;

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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const MetersTable = ({
  meters,
  onEdit,
  onAdd,
  removeMeter,
  updateMeterStatus,
  setLocalError,
  locations = [],
  energyResourceTypes = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  const [search, setSearch] = useState('');

  const handleStatusChange = async (meter) => {
    try {
      await updateMeterStatus(meter.id, !meter.isActive);
    } catch (err) {
      setLocalError?.(err.message || 'Помилка при зміні статусу лічільника');
    }
  };

  const getLocationName = (locationId) => locations.find((l) => l.id === locationId)?.name || 'Невідома локація';

  const getResourceName = (resourceId) =>
    energyResourceTypes.find((rt) => rt.id === resourceId)?.name || 'Невідомий ресурс';

  const filteredMeters = meters.filter((meter) => {
    const serial = (meter.serial_number || '').toLowerCase();
    const locationName = getLocationName(meter.location_id).toLowerCase();
    const resourceName = getResourceName(meter.energy_resource_type_id).toLowerCase();
    const query = search.toLowerCase();
    return serial.includes(query) || locationName.includes(query) || resourceName.includes(query);
  });

  const MobileMeterCard = ({ meter }) => (
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
            <Switch checked={meter.isActive} onChange={() => handleStatusChange(meter)} color="primary" size="small" />
            <Typography variant="body2">{meter.isActive ? 'Активний' : 'Неактивний'}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(meter)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={meter.isActive ? 'Неможливо видалити активний лічільник' : 'Видалити'}>
              <span>
                <IconButton size="small" onClick={() => removeMeter(meter.id)} color="error" disabled={meter.isActive}>
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
          Додати лічільник
        </Button>

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          placeholder="Пошук за серійним номером, локацією або ресурсом..."
          sx={{
            width: isMobile ? '100%' : '400px',
            maxWidth: isMobile ? '100%' : '450px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredMeters.length} з {meters.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredMeters.length > 0 ? (
            filteredMeters.map((meter) => <MobileMeterCard key={meter.id} meter={meter} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Лічільники не знайдено'}
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
                    width: isTablet ? '20%' : '20%',
                    fontWeight: 600,
                  }}
                >
                  Серійний номер
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '25%' : '25%',
                    fontWeight: 600,
                  }}
                >
                  Локація
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '20%' : '20%',
                    fontWeight: 600,
                  }}
                >
                  Тип ресурсу
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '15%' : '15%',
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
              {filteredMeters.length > 0 ? (
                filteredMeters.map((meter) => (
                  <TableRow
                    key={meter.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
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
                        <Switch
                          checked={meter.isActive}
                          onChange={() => handleStatusChange(meter)}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={meter.isActive ? 'Активний' : 'Неактивний'}
                          color={meter.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати лічільник">
                          <IconButton size="small" onClick={() => onEdit(meter)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={meter.isActive ? 'Спочатку деактивуйте лічільник' : 'Видалити лічільник'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => removeMeter(meter.id)}
                              disabled={meter.isActive}
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
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : 'Лічільники не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати перший лічільник
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

export default MetersTable;

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

const LocationsTable = ({
  locations,
  search,
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

  const handleStatusChange = async (location) => {
    try {
      await onStatusChange(location.id, !location.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу локації');
    }
  };

  const handleRemove = async (id) => {
    try {
      await onRemove(id);
    } catch (err) {
      setLocalError(err.message || 'Помилка при видаленні локації');
    }
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.address.toLowerCase().includes(search.toLowerCase())
  );

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
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {location.name}
          </Typography>
          <Chip
            label={location.isActive ? 'Активна' : 'Неактивна'}
            color={location.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {location.address}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={location.isActive}
              onChange={() => handleStatusChange(location)}
              color="primary"
              size="small"
            />
            <Typography variant="body2">{location.isActive ? 'Активна' : 'Неактивна'}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(location)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={location.isActive ? 'Неможливо видалити активну локацію' : 'Видалити'}>
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

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
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
                <TableCell
                  sx={{
                    width: isTablet ? '25%' : '20%',
                    fontWeight: 600,
                  }}
                >
                  Назва
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '35%' : '40%',
                    fontWeight: 600,
                  }}
                >
                  Адреса
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '20%' : '20%',
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
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
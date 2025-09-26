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
} from '@mui/material';
import { Edit, Delete, AttachMoney, LocationOn, Category, CalendarToday } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const TariffsTable = ({ tariffs, onEdit, onAdd, onDelete, locationsMap, resourceTypesMap, search, setSearch }) => {
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

    return (
      locationName.toLowerCase().includes(searchTerm) ||
      resourceName.toLowerCase().includes(searchTerm) ||
      tariff.price.toString().includes(searchTerm)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const isCurrentTariff = (tariff) => {
    const now = new Date();
    const validFrom = new Date(tariff.valid_from);
    const validTo = tariff.valid_to ? new Date(tariff.valid_to) : null;

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
            <Typography variant="body2" color="text.secondary">
              <strong>Локація:</strong> {locationsMap[tariff.location_id] || '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Ресурс:</strong> {resourceTypesMap[tariff.energy_resource_type_id] || '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Період:</strong> {formatDate(tariff.valid_from)}
              {tariff.valid_to ? ` - ${formatDate(tariff.valid_to)}` : ' (безстроково)'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Редагувати тариф">
            <IconButton size="small" onClick={() => onEdit(tariff)} color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Видалити тариф">
            <IconButton size="small" onClick={() => onDelete(tariff.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
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
          Додати тариф
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
          Знайдено: {filteredTariffs.length} з {tariffs.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredTariffs.length > 0 ? (
            filteredTariffs.map((tariff) => <MobileTariffCard key={tariff.id} tariff={tariff} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Тарифів не знайдено'}
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
                    width: isTablet ? '18%' : '20%',
                    fontWeight: 600,
                  }}
                >
                  Локація
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '18%' : '20%',
                    fontWeight: 600,
                  }}
                >
                  Тип ресурсу
                </TableCell>
                <TableCell
                  sx={{
                    width: '18%',
                    fontWeight: 600,
                  }}
                >
                  Ціна
                </TableCell>
                <TableCell
                  sx={{
                    width: '15%',
                    fontWeight: 600,
                  }}
                >
                  Діє з
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '15%' : '15%',
                    fontWeight: 600,
                  }}
                >
                  Діє до
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
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати тариф">
                          <IconButton size="small" onClick={() => onEdit(tariff)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити тариф">
                          <IconButton size="small" onClick={() => onDelete(tariff.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : 'Тарифів не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати перший тариф
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

export default TariffsTable;

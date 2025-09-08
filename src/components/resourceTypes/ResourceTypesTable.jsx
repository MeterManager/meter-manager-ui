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

const ResourceTypesTable = ({
  resourceTypes,
  search,
  setSearch,
  onEdit,
  onAdd,
  removeResourceType,
  updateResourceTypeStatus,
  setLocalError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  const handleStatusChange = async (type) => {
    try {
      await updateResourceTypeStatus(type.id, !type.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу типу ресурсу');
    }
  };

  const filteredTypes = (resourceTypes || []).filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.unit.toLowerCase().includes(search.toLowerCase())
  );

  const MobileResourceTypeCard = ({ resourceType }) => (
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
            {resourceType.name}
          </Typography>
          <Chip
            label={resourceType.isActive ? 'Активний' : 'Неактивний'}
            color={resourceType.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Одиниця:</strong> {resourceType.unit}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={resourceType.isActive}
              onChange={() => handleStatusChange(resourceType)}
              color="primary"
              size="small"
            />
            <Typography variant="body2">{resourceType.isActive ? 'Активний' : 'Неактивний'}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(resourceType)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={resourceType.isActive ? 'Неможливо видалити активний тип ресурсу' : 'Видалити'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => removeResourceType(resourceType.id)}
                  color="error"
                  disabled={resourceType.isActive}
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
            minWidth: isMobile ? 'auto' : '180px',
            height: '40px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Додати тип ресурсу
        </Button>

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          placeholder="Пошук за типом або одиницею..."
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredTypes.length} з {resourceTypes?.length || 0}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredTypes.length > 0 ? (
            filteredTypes.map((resourceType) => (
              <MobileResourceTypeCard key={resourceType.id} resourceType={resourceType} />
            ))
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Типи ресурсів не знайдено'}
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
                    width: isTablet ? '30%' : '30%',
                    fontWeight: 600,
                  }}
                >
                  Тип ресурсу
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '30%' : '30%',
                    fontWeight: 600,
                  }}
                >
                  Одиниця вимірювання
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
              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <TableRow
                    key={type.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {type.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {type.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={type.isActive}
                          onChange={() => handleStatusChange(type)}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={type.isActive ? 'Активний' : 'Неактивний'}
                          color={type.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати тип ресурсу">
                          <IconButton size="small" onClick={() => onEdit(type)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={type.isActive ? 'Спочатку деактивуйте тип ресурсу' : 'Видалити тип ресурсу'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => removeResourceType(type.id)}
                              disabled={type.isActive}
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
                      {search ? 'За вашим запитом нічого не знайдено' : 'Типи ресурсів не знайдено'}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати перший тип ресурсу
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

export default ResourceTypesTable;

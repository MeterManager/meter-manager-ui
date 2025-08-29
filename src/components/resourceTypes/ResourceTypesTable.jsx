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
} from '@mui/material';
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

  const handleStatusChange = async (type) => {
    try {
      await  updateResourceTypeStatus(type.id, { is_active: !type.is_active });
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу типу ресурсу');
    }
  };

  const filteredTypes = (resourceTypes || []).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Button
          variant="contained"
          size="small"
          onClick={onAdd}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Додати тип ресурсу
        </Button>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '30%' }}>Тип ресурсу</TableCell>
              <TableCell sx={{ width: '30%' }}>Одиниця вимірювання</TableCell>
              <TableCell sx={{ width: '20%' }}>Статус</TableCell>
              <TableCell sx={{ width: '20%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTypes.length > 0 ? (
              filteredTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.unit}</TableCell>
                  <TableCell>
                    <Switch
                      checked={type.is_active}
                      onChange={() => handleStatusChange(type)}
                      color="primary"
                    />
                    {type.is_active ? 'Активний' : 'Неактивний'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onEdit(type)}>
                      Редагувати
                    </Button>
                    <Button
                      size="small"
                      onClick={() => removeResourceType(type.id)}
                      color="error"
                      disabled={type.is_active}
                    >
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Типи ресурсів не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResourceTypesTable;


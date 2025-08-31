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
import { useAuthContext } from '../../contexts/AuthContext';

const UsersTable = ({ users, search, setSearch, updateUserStatus, removeUser, setLocalError }) => {
  const theme = useTheme();
  const { user, isAdmin } = useAuthContext();

  const handleStatusChange = async (u) => {
    if (u.id === user?.sub && isAdmin) return;
    try {
      await updateUserStatus(u.id, !u.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу користувача');
    }
  };

  const handleRemove = async (u) => {
    if (u.id === user?.sub && isAdmin) return;
    try {
      await removeUser(u.id);
    } catch (err) {
      setLocalError(err.message || 'Помилка при видаленні користувача');
    }
  };

  const filteredUsers = users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={theme.custom.headerBoxStyles}>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '30%' }}>ПІБ</TableCell>
              <TableCell sx={{ width: '25%' }}>Роль</TableCell>
              <TableCell sx={{ width: '25%' }}>Статус</TableCell>
              <TableCell sx={{ width: '20%' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Switch
                      checked={u.isActive}
                      onChange={() => handleStatusChange(u)}
                      color="primary"
                      disabled={u.id === user?.sub && isAdmin}
                    />
                    {u.isActive ? 'Активний' : 'Неактивний'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleRemove(u)}
                      color="error"
                      disabled={u.id === user?.sub && isAdmin}
                    >
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Користувачів не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsersTable;

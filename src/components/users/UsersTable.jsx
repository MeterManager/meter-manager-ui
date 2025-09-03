import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Switch,
} from '@mui/material';
import { useMemo } from 'react';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/AuthContext';

const UsersTable = ({ users, search, setSearch, updateUserStatus, setLocalError }) => {
  const theme = useTheme();
  const { user, isAdmin } = useAuthContext();

  const handleStatusChange = async (u) => {
    if (u.auth0_user_id === user?.sub && isAdmin) return;
    try {
      await updateUserStatus(u.id, !u.isActive);
    } catch (err) {
      setLocalError(err.message || 'Помилка при зміні статусу користувача');
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search.toLowerCase()) && 
          u.role !== 'admin' 
      ),
    [users, search]
  );

  return (
    <Box>
      <Box sx={{ ...theme.custom.headerBoxStyles, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={theme.custom.searchBoxStyles}>
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '40%' }}>ПІБ</TableCell>
              <TableCell sx={{ width: '30%' }}>Роль</TableCell>
              <TableCell sx={{ width: '30%' }}>Статус</TableCell>
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
                      disabled={u.auth0_user_id === user?.sub && isAdmin}
                    />
                    {u.isActive ? 'Активний' : 'Неактивний'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
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

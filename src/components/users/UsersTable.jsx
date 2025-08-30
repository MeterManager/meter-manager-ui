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
  
  const UsersTable = ({
    users,
    search,
    setSearch,
    onEdit,
    removeUser,
    updateUserStatus,
    setLocalError,
  }) => {
    const theme = useTheme();
  
    const handleStatusChange = async (user) => {
      try {
        await updateUserStatus(user.id, !user.isActive);
      } catch (err) {
        setLocalError(err.message || 'Помилка при зміні статусу користувача');
      }
    };
  
    const filteredUsers = users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  
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
                      <Switch checked={u.isActive} onChange={() => handleStatusChange(u)} color="primary" />
                      {u.isActive ? 'Активний' : 'Неактивний'}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => onEdit(u)}>
                        Редагувати
                      </Button>
                      <Button size="small" onClick={() => removeUser(u.id)} color="error" disabled={u.isActive}>
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
  
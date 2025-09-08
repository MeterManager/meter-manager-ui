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
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useMemo } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/AuthContext';

const UsersTable = ({ users, search, setSearch, updateUserStatus, setLocalError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
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
    () => users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) && u.role !== 'admin'),
    [users, search]
  );

  const MobileUserCard = ({ user: userItem }) => (
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
            {userItem.full_name}
          </Typography>
          <Chip
            label={userItem.isActive ? 'Активний' : 'Неактивний'}
            color={userItem.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Роль:</strong> {userItem.role}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={userItem.isActive}
              onChange={() => handleStatusChange(userItem)}
              color="primary"
              size="small"
              disabled={userItem.auth0_user_id === user?.sub && isAdmin}
            />
            <Typography variant="body2">{userItem.isActive ? 'Активний' : 'Неактивний'}</Typography>
          </Box>
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
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          mb: 3,
        }}
      >
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          placeholder="Пошук за ПІБ користувача..."
          sx={{
            width: '100%',
            maxWidth: '100%',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredUsers.length} з {users.filter((u) => u.role !== 'admin').length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userItem) => <MobileUserCard key={userItem.id} user={userItem} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : 'Користувачів не знайдено'}
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
                    width: isTablet ? '40%' : '40%',
                    fontWeight: 600,
                  }}
                >
                  ПІБ
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '30%' : '30%',
                    fontWeight: 600,
                  }}
                >
                  Роль
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '30%' : '30%',
                    fontWeight: 600,
                  }}
                >
                  Статус
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {u.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.role}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={u.isActive}
                          onChange={() => handleStatusChange(u)}
                          color="primary"
                          size="small"
                          disabled={u.auth0_user_id === user?.sub && isAdmin}
                        />
                        <Chip
                          label={u.isActive ? 'Активний' : 'Неактивний'}
                          color={u.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : 'Користувачів не знайдено'}
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

export default UsersTable;

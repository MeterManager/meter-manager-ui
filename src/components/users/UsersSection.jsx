import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import UsersTable from './UsersTable';
import { useUsers } from '../../hooks/useUsers';
import { useAuthContext } from '../../contexts/AuthContext';

const UsersSection = ({ initialExpanded = true }) => {
  const { users, search, setSearch, editUser, updateUserStatus, error, setError } = useUsers();
  const { user } = useAuthContext();
  const currentUserId = user?.sub;

  const [expanded, setExpanded] = useState(initialExpanded);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = () => setExpanded(!expanded);

  const handleUpdateStatus = async (id, isActive) => {
    try {
      await updateUserStatus(id, isActive);
      setSnackbar({
        open: true,
        message: `Користувача успішно ${isActive ? 'активовано' : 'деактивовано'}`,
        severity: 'success',
      });
    } catch (err) {
      setError(err.message || 'Помилка при оновленні статусу користувача');
      setSnackbar({
        open: true,
        message: err.message || 'Помилка при оновленні статусу користувача',
        severity: 'error',
      });
    }
  };

  const handleEditUser = async (id, data) => {
    try {
      await editUser(id, data);
      setSnackbar({
        open: true,
        message: 'Дані користувача успішно оновлено',
        severity: 'success',
      });
    } catch (err) {
      setError(err.message || 'Помилка при редагуванні користувача');
      setSnackbar({
        open: true,
        message: err.message || 'Помилка при редагуванні користувача',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <>
      <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
          }}
          onClick={handleToggle}
        >
          <Typography variant="h5">Користувачі ({users.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <UsersTable
              users={users}
              search={search}
              setSearch={setSearch}
              editUser={handleEditUser}
              updateUserStatus={handleUpdateStatus}
              setLocalError={setError}
              currentUserId={currentUserId}
            />
          </Box>
        </Collapse>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UsersSection;

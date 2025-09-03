import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import UsersTable from './UsersTable';
import { useUsers } from '../../hooks/useUsers';
import { useAuthContext } from '../../contexts/AuthContext';

const UsersSection = ({ initialExpanded = true }) => {
  const { users, search, setSearch, editUser, removeUser, updateUserStatus, error, setError } = useUsers();
  const { user } = useAuthContext();
  const currentUserId = user?.sub;

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleToggle = () => setExpanded(!expanded);
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeUser(id);
    } catch (err) {
      setError(err.message || 'Помилка при видаленні користувача');
    }
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
              removeUser={handleRemove}
              updateUserStatus={updateUserStatus}
              setLocalError={setError}
              currentUserId={currentUserId}
            />
          </Box>
        </Collapse>
      </Paper>
    </>
  );
};

export default UsersSection;
// src/components/users/UsersSection.jsx
import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import UsersTable from './UsersTable';
import UserForm from './UserForm';
import { useUsers } from '../../hooks/useUsers';

const UsersSection = ({ initialExpanded = true }) => {
  const {
    users,
    search,
    setSearch,
    editUser,
    removeUser,
    updateUserStatus,
    error,
    setError,
  } = useUsers();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser?.id) {
        await editUser(editingUser.id, formData);
      }
      setFormOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message || 'Помилка при редагуванні користувача');
    }
  };

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
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
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
              onEdit={handleEdit}
              removeUser={handleRemove}
              updateUserStatus={updateUserStatus}
              setLocalError={setError}
            />
          </Box>
        </Collapse>
      </Paper>

      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingUser || {}}
        error={error}
        users={users}
      />
    </>
  );
};

export default UsersSection;

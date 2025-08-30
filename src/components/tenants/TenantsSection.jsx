import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import TenantsTable from '../tenants/TenantsTable';
import TenantForm from '../tenants/TenantForm';
import { useTenants } from '../../hooks/useTenants';

const TenantsSection = ({ locations, initialExpanded = true }) => {
  const { tenants, search, setSearch, addTenant, editTenant, removeTenant, updateTenantStatus, error, setError } =
    useTenants();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const handleToggle = () => setExpanded(!expanded);
  const handleAdd = () => {
    setEditingTenant(null);
    setFormOpen(true);
  };
  const handleEdit = (t) => {
    setEditingTenant(t);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTenant) await editTenant(editingTenant.id, data);
      else await addTenant(data);
      setFormOpen(false);
      setEditingTenant(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні орендаря');
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeTenant(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (id, statusData) => {
    try {
      await updateTenantStatus(id, statusData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
<<<<<<< HEAD
      <Paper sx={{mb: 3, borderRadius: 2 }} elevation={1} >
=======
      <Paper sx={{ borderRadius: 2, mb: 3 }} elevation={1}>
>>>>>>> meters-tenants-sections
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}
          onClick={handleToggle}
        >
          <Typography variant="h5" fontWeight={600}>
            Орендарі ({tenants.length})
          </Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box p={3}>
            <TenantsTable
              tenants={tenants}
              search={search}
              setSearch={setSearch}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeTenant={handleRemove}
              updateTenantStatus={handleStatusUpdate}
              setLocalError={setError}
              locations={locations}
            />
          </Box>
        </Collapse>
      </Paper>

      <TenantForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTenant(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTenant || {}}
        error={error}
        tenants={tenants}
        locations={locations}
      />
    </>
  );
};

export default TenantsSection;

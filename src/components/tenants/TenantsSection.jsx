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
import TenantsTable from '../tenants/TenantsTable';
import TenantForm from '../tenants/TenantForm';
import { useTenants } from '../../hooks/useTenants';
import { useLocations } from '../../hooks/useLocations';

const TenantsSection = ({ initialExpanded = true }) => {
  const {
    tenants,
    search,
    setSearch,
    addTenant,
    editTenant,
    removeTenant,
    updateTenantStatus,
    getTenantDependencies,
    error,
    setError,
  } = useTenants();

  const { locations, loading: locationsLoading, error: locationsError } = useLocations();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingTenant(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTenant) {
        await editTenant(editingTenant.id, data);
        setSnackbar({ open: true, message: 'Орендаря успішно оновлено', severity: 'success' });
      } else {
        await addTenant(data);
        setSnackbar({ open: true, message: 'Орендаря успішно додано', severity: 'success' });
      }
      setFormOpen(false);
      setEditingTenant(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні орендаря');
      setSnackbar({ open: true, message: err.message || 'Помилка при збереженні орендаря', severity: 'error' });
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeTenant(id);
      setSnackbar({ open: true, message: 'Орендаря видалено', severity: 'success' });
    } catch (err) {
      setError(err.message || 'Помилка при видаленні орендаря');
      setSnackbar({ open: true, message: err.message || 'Помилка при видаленні орендаря', severity: 'error' });
    }
  };

  const handleStatusUpdate = async (id, statusData) => {
    try {
      await updateTenantStatus(id, statusData);
      setSnackbar({ open: true, message: 'Статус орендаря оновлено', severity: 'success' });
    } catch (err) {
      setError(err.message || 'Помилка при оновленні статусу');
      setSnackbar({ open: true, message: err.message || 'Помилка при оновленні статусу', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (locationsLoading) return <Typography>Завантаження локацій...</Typography>;
  if (locationsError) return <Typography color="error">Помилка при завантаженні локацій</Typography>;

  return (
    <>
      <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
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
              getTenantDependencies={getTenantDependencies}
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TenantsSection;

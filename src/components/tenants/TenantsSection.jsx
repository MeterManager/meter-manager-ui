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
  CircularProgress,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import TenantsTable from '../tenants/TenantsTable';
import TenantForm from '../tenants/TenantForm';
import { useTenants } from '../../hooks/useTenants';
import { useLocations } from '../../hooks/useLocations';
import { translateErrorMessage } from '../../utils/translateError';
import ConfirmDialog from '../ui/ConfirmDialog';

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
    loading: tenantsLoading,
    isActionLoading,
  } = useTenants();

  const { locations, loading: locationsLoading, error: locationsError } = useLocations();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [locationFilter, setLocationFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, dependencies: null });

  const handleServiceError = (err, defaultMessage = 'Помилка при виконанні дії') => {
    console.error('Tenant Service Action Failed:', err);
    const userMessage = translateErrorMessage(err.message || defaultMessage);
    setSnackbar({ open: true, message: userMessage, severity: 'error' });
    setError(userMessage);
  };

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingTenant(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTenant?.id) {
        await editTenant(editingTenant.id, data);
        setSnackbar({ open: true, message: 'Орендаря успішно оновлено', severity: 'success' });
      } else {
        await addTenant(data);
        setSnackbar({ open: true, message: 'Орендаря успішно додано', severity: 'success' });
      }
    } catch (err) {
      handleServiceError(err, 'Помилка збереження орендаря');
    } finally {
      setFormOpen(false);
      setEditingTenant(null);
      setError(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTenant(null);
    setError(null);
  };

  const handleRemove = async (id) => {
    try {
      const dependencies = await getTenantDependencies(id);

      const hasDependencies = dependencies.active_meter_tenants > 0;

      setConfirmDialog({
        open: true,
        id,
        action: 'delete',
        dependencies: hasDependencies ? dependencies : null,
      });
    } catch (err) {
      handleServiceError(err, 'Помилка перевірки залежностей');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await removeTenant(confirmDialog.id);
      setSnackbar({ open: true, message: 'Орендаря успішно видалено', severity: 'success' });
      handleCloseConfirmDialog();
    } catch (err) {
      handleServiceError(err, 'Помилка видалення орендаря');
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
  };

  const handleStatusUpdate = async (id, statusData) => {
    try {
      await updateTenantStatus(id, statusData);
      setSnackbar({ open: true, message: 'Статус орендаря оновлено', severity: 'success' });
    } catch (err) {
      handleServiceError(err, 'Помилка оновлення статусу');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const isLoading = tenantsLoading || locationsLoading;

  if (locationsError)
    return <Typography color="error">Помилка при завантаженні локацій: {locationsError.message}</Typography>;

  if (isLoading && tenants.length === 0) return <CircularProgress />;

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
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              locations={locations}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeTenant={handleRemove}
              updateTenantStatus={handleStatusUpdate}
              getTenantDependencies={getTenantDependencies}
              setLocalError={setError}
              isLoading={isLoading || isActionLoading}
            />
          </Box>
        </Collapse>
      </Paper>

      <TenantForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingTenant || {}}
        error={error}
        tenants={tenants}
        locations={locations.filter((l) => l.isActive)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        action={confirmDialog.action}
        entity="tenant"
        dependencies={confirmDialog.dependencies}
        isLoading={isActionLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TenantsSection;

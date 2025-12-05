import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import LocationsTable from '../locations/LocationsTable';
import LocationForm from '../locations/LocationForm';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useLocations } from '../../hooks/useLocations';
import { useTenants } from '../../hooks/useTenants';
import { translateErrorMessage } from '../../utils/translateError';

const LocationsSection = ({ initialExpanded = true }) => {
  const {
    locations,
    addLocation,
    editLocation,
    removeLocation,
    updateLocationStatus,

    getDependencies,
    error,
    setError,
    loading,
  } = useLocations();
  const { tenants: simpleTenants } = useTenants();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, dependencies: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');

  const handleServiceError = (err) => {
    const userMessage = translateErrorMessage(err.message);
    setError(userMessage);
    setSnackbar({ open: true, message: userMessage, severity: 'error' });
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setFormOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingLocation?.id) {
        await editLocation(editingLocation.id, formData);
        setSnackbar({ open: true, message: 'Локацію успішно оновлено', severity: 'success' });
      } else {
        await addLocation(formData);
        setSnackbar({ open: true, message: 'Локацію успішно створено', severity: 'success' });
      }
    } catch (err) {
      handleServiceError(err);
    } finally {
      setFormOpen(false);
      setEditingLocation(null);
      setError(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLocation(null);
    setError(null);
  };

  const handleRemove = async (id) => {
    try {
      const dependencies = await getDependencies(id);

      if (dependencies.active_meters > 0 || dependencies.deliveries > 0 || dependencies.active_tenants > 0) {
        setConfirmDialog({
          open: true,
          id,
          action: 'delete',
          dependencies,
        });
      } else {
        await removeLocation(id);
        setSnackbar({ open: true, message: 'Локацію успішно видалено', severity: 'success' });
      }
    } catch (err) {
      handleServiceError(err);
    }
  };

  const handleUpdateStatus = async (id, isActive) => {
    if (isActive) {
      try {
        await updateLocationStatus(id, true);
        setSnackbar({ open: true, message: 'Локацію успішно активовано', severity: 'success' });
      } catch (err) {
        handleServiceError(err);
      }
      return;
    }

    try {
      const result = await updateLocationStatus(id, isActive);

      if (result.requiresConfirmation) {
        setConfirmDialog({
          open: true,
          id,
          action: 'deactivate',
          dependencies: result.dependencies,
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Локацію успішно деактивовано',
          severity: 'success',
        });
      }
    } catch (err) {
      handleServiceError(err);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'delete') {
        await removeLocation(confirmDialog.id);
        setSnackbar({
          open: true,
          message: 'Локацію та повʼязані обʼєкти успішно видалено',
          severity: 'success',
        });
      } else if (confirmDialog.action === 'deactivate') {
        await updateLocationStatus(confirmDialog.id, false, true);
        setSnackbar({
          open: true,
          message: 'Локацію успішно деактивовано (з залежностями)',
          severity: 'success',
        });
      }
      setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
    } catch (err) {
      handleServiceError(err);
    } finally {
      setError(null);
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
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
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
          onClick={handleToggle}
        >
          <Typography variant="h5">Локації ({locations.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <LocationsTable
              locations={locations}
              search={search}
              setSearch={setSearch}
              tenantFilter={tenantFilter}
              setTenantFilter={setTenantFilter}
              tenants={simpleTenants}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onStatusChange={handleUpdateStatus}
              setLocalError={setError}
              isLoading={loading}
            />
          </Box>
        </Collapse>
      </Paper>

      <LocationForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingLocation || {}}
        error={error}
        locations={locations}
        isLoading={loading}
        tenants={simpleTenants}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        action={confirmDialog.action}
        dependencies={confirmDialog.dependencies}
        isLoading={loading}
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

export default LocationsSection;

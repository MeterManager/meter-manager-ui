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
    search,
    setSearch,
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
  const [isActionLoading, setIsActionLoading] = useState(false);

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
      setIsActionLoading(true);
      if (editingLocation?.id) {
        await editLocation(editingLocation.id, formData);
        setSnackbar({ open: true, message: 'Локацію успішно оновлено', severity: 'success' });
      } else {
        await addLocation(formData);
        setSnackbar({ open: true, message: 'Локацію успішно створено', severity: 'success' });
      }
      setFormOpen(false);
      setEditingLocation(null);
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLocation(null);
    setError(null);
  };

  const handleRemove = async (id) => {
    try {
      setIsActionLoading(true);
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
      const userMessage = translateErrorMessage(err.message);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, isActive) => {
    try {
      setIsActionLoading(true);
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
          message: `Локацію успішно ${isActive ? 'активовано' : 'деактивовано'}`,
          severity: 'success',
        });
      }
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    try {
      setIsActionLoading(true);

      if (confirmDialog.action === 'delete') {
        await removeLocation(confirmDialog.id);
        setSnackbar({
          open: true,
          message: 'Локацію успішно видалено',
          severity: 'success',
        });
      } else if (confirmDialog.action === 'deactivate') {
        await updateLocationStatus(confirmDialog.id, false, true);
        setSnackbar({
          open: true,
          message: 'Локацію успішно деактивовано',
          severity: 'success',
        });
      }
      setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    } finally {
      setIsActionLoading(false);
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
              onAdd={handleAdd}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onStatusChange={handleUpdateStatus}
              setLocalError={setError}
              isLoading={loading || isActionLoading}
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
        isLoading={isActionLoading}
        tenants={simpleTenants}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        action={confirmDialog.action}
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

export default LocationsSection;

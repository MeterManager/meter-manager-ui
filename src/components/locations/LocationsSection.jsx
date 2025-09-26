import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import LocationsTable from '../locations/LocationsTable';
import LocationForm from '../locations/LocationForm';
import { useLocations } from '../../hooks/useLocations';

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
  } = useLocations();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, dependencies: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      setFormOpen(false);
      setEditingLocation(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні локації');
      setSnackbar({ open: true, message: err.message || 'Помилка при збереженні локації', severity: 'error' });
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLocation(null);
  };

  const handleRemove = async (id) => {
    try {
      const dependencies = await getDependencies(id);
      
      if (dependencies.active_meters > 0 || dependencies.deliveries > 0) {
        setConfirmDialog({
          open: true,
          id,
          action: 'delete',
          dependencies,
        });
      } else {
        await removeLocation(id);
        setSnackbar({ open: true, message: 'Локацію видалено', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleUpdateStatus = async (id, isActive) => {
    try {
      const response = await updateLocationStatus(id, isActive);
      if (response?.requiresConfirmation) {
        setConfirmDialog({
          open: true,
          id,
          action: 'deactivate',
          dependencies: response.dependencies,
        });
      } else {
        setSnackbar({
          open: true,
          message: response?.message || `Локацію успішно ${isActive ? 'активовано' : 'деактивовано'}`,
          severity: 'success',
        });
      }
    } catch (err) {
      setError(err.message || 'Помилка при оновленні статусу локації');
      setSnackbar({ open: true, message: err.message || 'Помилка при оновленні статусу локації', severity: 'error' });
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'delete') {
        const response = await removeLocation(confirmDialog.id, true);
        setSnackbar({
          open: true,
          message: response?.message || 'Локацію успішно видалено',
          severity: 'success',
        });
      } else if (confirmDialog.action === 'deactivate') {
        const response = await updateLocationStatus(confirmDialog.id, false, true);
        setSnackbar({
          open: true,
          message: response?.message || 'Локацію успішно деактивовано',
          severity: 'success',
        });
      }
      setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
    } catch (err) {
      setError(err.message || 'Помилка при виконанні дії');
      setSnackbar({ open: true, message: err.message || 'Помилка при виконанні дії', severity: 'error' });
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
      />

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === 'delete' ? 'Підтвердження видалення' : 'Підтвердження деактивації'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'delete'
              ? `Ви впевнені, що хочете видалити цю локацію? Це також видалить: ${
                  confirmDialog.dependencies?.active_meters
                    ? `${confirmDialog.dependencies.active_meters} лічильників`
                    : ''
                }${
                  confirmDialog.dependencies?.deliveries
                    ? `${confirmDialog.dependencies.active_meters ? ', ' : ''}${
                        confirmDialog.dependencies.deliveries
                      } поставок`
                    : ''
                }. Ця дія незворотна!`
              : `Ви впевнені, що хочете деактивувати цю локацію? Це також деактивує ${
                  confirmDialog.dependencies?.active_meters
                } активних лічильників.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Скасувати</Button>
          <Button onClick={handleConfirmAction} color="error" variant="contained">
            {confirmDialog.action === 'delete' ? 'Видалити' : 'Деактивувати'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LocationsSection;
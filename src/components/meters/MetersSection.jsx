import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MetersTable from './MetersTable';
import MeterForm from './MeterForm';
import { useMeters } from '../../hooks/useMeters';
import { useLocations } from '../../hooks/useLocations';
import { useResourceTypes } from '../../hooks/useResourceTypes';
import { translateErrorMessage } from '../../utils/translateError';

const MetersSection = ({ initialExpanded = true }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, dependencies: null });

  const { locations, error: locationsError } = useLocations();
  const { resourceTypes: energyResourceTypes, loading: loadingResourceTypes, error: resourceTypesError } = useResourceTypes();
  const { meters, loading, error, addMeter, editMeter, removeMeter, updateMeterStatus, getMeterDependencies } = useMeters();

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingMeter(null);
    setFormOpen(true);
  };

  const handleEdit = (meter) => {
    setEditingMeter(meter);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingMeter(null);
    setError(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMeter?.id) {
        await editMeter(editingMeter.id, formData);
        setSnackbar({ open: true, message: 'Лічильник успішно оновлено', severity: 'success' });
      } else {
        await addMeter(formData);
        setSnackbar({ open: true, message: 'Лічильник успішно додано', severity: 'success' });
      }
      setFormOpen(false);
      setEditingMeter(null);
      setExpanded(true);
    } catch (err) {
      console.error(err);
    const userMessage = translateErrorMessage(err.message);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleRemove = async (id) => {
    try {
      const dependencies = await getMeterDependencies(id);
      if (dependencies.active) {
        setConfirmDialog({ open: true, id, dependencies });
      } else {
        await removeMeter(id);
        setSnackbar({ open: true, message: 'Лічильник видалено', severity: 'success' });
      }
    } catch (err) {
      console.error(err);
    const userMessage = translateErrorMessage(err.message);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await removeMeter(confirmDialog.id);
      setSnackbar({ open: true, message: 'Лічильник видалено', severity: 'success' });
      setConfirmDialog({ open: false, id: null, dependencies: null });
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
      setConfirmDialog({ open: false, id: null, dependencies: null });
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await updateMeterStatus(id, isActive);
      setSnackbar({ open: true, message: `Лічильник успішно ${isActive ? 'активовано' : 'деактивовано'}`, severity: 'success' });
    } catch (err) {
      console.error(err);
      const userMessage = translateErrorMessage(err.message); // <-- ВИПРАВЛЕНО
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  if (locationsError) return <Typography color="error">Помилка при завантаженні локацій</Typography>;
  if (resourceTypesError) return <Typography color="error">Помилка при завантаженні типів ресурсів</Typography>;

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
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
          }}
          onClick={handleToggle}
        >
          <Typography variant="h5">Лічільники ({meters.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            {loading || loadingResourceTypes ? (
              <CircularProgress />
            ) : (
              <MetersTable
                meters={meters}
                onAdd={handleAdd}
                onEdit={handleEdit}
                removeMeter={handleRemove}
                updateMeterStatus={handleStatusChange}
                locations={locations}
                energyResourceTypes={energyResourceTypes}
              />
            )}
          </Box>
        </Collapse>
      </Paper>

      <MeterForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingMeter || {}}
        error={error}
        meters={meters}
        locations={(locations || []).filter((l) => l.isActive)}
        energyResourceTypes={(energyResourceTypes || []).filter((rt) => rt.isActive)}
        loading={loading}
      />

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, id: null, dependencies: null })}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>
            Цей лічильник має активні залежності. Ви впевнені, що хочете його видалити?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, id: null, dependencies: null })}>Скасувати</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Видалити</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MetersSection;

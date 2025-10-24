import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MetersTable from './MetersTable';
import MeterForm from './MeterForm';
import ConfirmDialog from '../ui/ConfirmDialog';
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

  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { resourceTypes: energyResourceTypes, loading: typesLoading, error: resourceTypesError } = useResourceTypes();

  const {
      meters,
      loading: metersLoading, 
      isActionLoading,
      error,
      setError,
      addMeter,
      editMeter,
      removeMeter,
      updateMeterStatus,
      getMeterDependencies
   } = useMeters();

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingMeter(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEdit = (meter) => {
    setEditingMeter(meter);
    setError(null);
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
      handleFormClose();
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка збереження лічильника');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
      throw err;
    }
  };

  const handleRemove = async (id) => {
    try {
        const deps = await getMeterDependencies(id);
        if (deps.active) {
          setConfirmDialog({ open: true, id, dependencies: deps.details });
        } else {
          setConfirmDialog({ open: true, id, dependencies: null });
        }
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка перевірки залежностей');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };


  const handleConfirmDelete = async () => {
    try {
      await removeMeter(confirmDialog.id);
      setSnackbar({ open: true, message: 'Лічильник видалено', severity: 'success' });
      handleCloseConfirmDialog();
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка видалення лічильника');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

   const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null, dependencies: null });
  };


  const handleStatusChange = async (id, isActive) => {
    try {
      await updateMeterStatus(id, isActive);
      setSnackbar({ open: true, message: `Лічильник успішно ${isActive ? 'активовано' : 'деактивовано'}`, severity: 'success' });
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка оновлення статусу');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  const isLoading = metersLoading || locationsLoading || typesLoading;

  if (locationsError) return <Typography color="error">Помилка при завантаженні локацій</Typography>;
  if (resourceTypesError) return <Typography color="error">Помилка при завантаженні типів ресурсів</Typography>;
  if (isLoading && !formOpen) return <CircularProgress />;


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
          <Typography variant="h5">Лічильники ({meters.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            {isLoading && meters.length === 0 ? (
              <CircularProgress />
            ) : (
              <MetersTable
                meters={meters}
                onAdd={handleAdd}
                onEdit={handleEdit}
                removeMeter={handleRemove}
                updateMeterStatus={handleStatusChange}
                locations={locations || []}
                energyResourceTypes={energyResourceTypes || []}
                isLoading={isLoading || isActionLoading}
                setLocalError={setError}
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
        loading={isActionLoading}
      />

       <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        action="delete"
        entity="meter"
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

export default MetersSection;

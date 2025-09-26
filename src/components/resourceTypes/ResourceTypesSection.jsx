import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceTypesTable from '../resourceTypes/ResourceTypesTable';
import ResourceTypeForm from '../resourceTypes/ResourceTypeForm';
import { useResourceTypes } from '../../hooks/useResourceTypes';

const ResourceTypesSection = ({ initialExpanded = true }) => {
  const {
    resourceTypes,
    search,
    setSearch,
    addResourceType,
    editResourceType,
    removeResourceType,
    updateResourceTypeStatus,
    getDependencies,
    error,
    setError,
  } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingResourceType, setEditingResourceType] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, dependencies: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingResourceType(null);
    setFormOpen(true);
  };

  const handleEdit = (resourceType) => {
    setEditingResourceType(resourceType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingResourceType?.id) {
        await editResourceType(editingResourceType.id, formData);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно оновлено', severity: 'success' });
      } else {
        await addResourceType(formData);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно створено', severity: 'success' });
      }
      setFormOpen(false);
      setEditingResourceType(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні типу ресурсу');
      setSnackbar({ open: true, message: err.message || 'Помилка при збереженні типу ресурсу', severity: 'error' });
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingResourceType(null);
  };

  const handleRemove = async (id) => {
    try {
      const dependencies = await getDependencies(id);
      if (dependencies.resources > 0 || dependencies.meters > 0) {
        setConfirmDialog({ open: true, id, action: 'delete', dependencies });
      } else {
        await removeResourceType(id);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно видалено', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleUpdateStatus = async (id, isActive) => {
    try {
      await updateResourceTypeStatus(id, isActive);
      setSnackbar({
        open: true,
        message: `Тип ресурсу успішно ${isActive ? 'активовано' : 'деактивовано'}`,
        severity: 'success',
      });
    } catch (err) {
      setError(err.message || 'Помилка при оновленні статусу');
      setSnackbar({ open: true, message: err.message || 'Помилка при оновленні статусу', severity: 'error' });
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'delete') {
        await removeResourceType(confirmDialog.id);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно видалено', severity: 'success' });
      } else if (confirmDialog.action === 'deactivate') {
        await updateResourceTypeStatus(confirmDialog.id, false);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно деактивовано', severity: 'success' });
      }
      setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
    } catch (err) {
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
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
          }}
          onClick={handleToggle}
        >
          <Typography variant="h5">Типи ресурсів ({resourceTypes.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <ResourceTypesTable
              resourceTypes={resourceTypes}
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

      <ResourceTypeForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingResourceType || {}}
        error={error}
        resourceTypes={resourceTypes}
      />

      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === 'delete' ? 'Підтвердження видалення' : 'Підтвердження деактивації'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'delete'
              ? `Ви впевнені, що хочете видалити цей тип ресурсу? Це може вплинути на ${
                  confirmDialog.dependencies?.resources || 0
                } ресурсів та ${confirmDialog.dependencies?.meters || 0} лічильників.`
              : `Ви впевнені, що хочете деактивувати цей тип ресурсу? Це може вплинути на пов'язані дані.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Скасувати</Button>
          <Button onClick={handleConfirmAction} color="error" variant="contained">
            {confirmDialog.action === 'delete' ? 'Видалити' : 'Деактивувати'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResourceTypesSection;

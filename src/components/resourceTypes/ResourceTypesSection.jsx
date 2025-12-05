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
import ResourceTypesTable from '../resourceTypes/ResourceTypesTable';
import ResourceTypeForm from '../resourceTypes/ResourceTypeForm';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useResourceTypes } from '../../hooks/useResourceTypes';
import { translateErrorMessage } from '../../utils/translateError';

const ResourceTypesSection = ({ initialExpanded = true }) => {
  const {
    resourceTypes,
    search,
    setSearch,
    addResourceType,
    editResourceType,
    removeResourceType,
    updateResourceTypeStatus,
    error,
    setError,
    loading,
    isActionLoading,
  } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingResourceType, setEditingResourceType] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, dependencies: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleServiceError = (err, defaultMessage = 'Помилка при виконанні дії') => {
    console.error('Resource Type Service Action Failed:', err);
    const userMessage = translateErrorMessage(err.message || defaultMessage);
    setSnackbar({ open: true, message: userMessage, severity: 'error' });
    setError(userMessage);
  };

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingResourceType(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEdit = (resourceType) => {
    setEditingResourceType(resourceType);
    setError(null);
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
    } catch (err) {
      handleServiceError(err, 'Помилка збереження типу ресурсу');
    } finally {
      setFormOpen(false);
      setEditingResourceType(null);
      setError(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingResourceType(null);
    setError(null);
  };

  const handleRemove = (id) => {
    setConfirmDialog({
      open: true,
      id,
      action: 'delete',
      dependencies: null,
    });
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
      handleServiceError(err, 'Помилка оновлення статусу');
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'delete') {
        await removeResourceType(confirmDialog.id);
        setSnackbar({ open: true, message: 'Тип ресурсу успішно видалено', severity: 'success' });
      }
      setConfirmDialog({ open: false, id: null, action: null, dependencies: null });
    } catch (err) {
      handleServiceError(err, 'Помилка підтвердження дії');
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
              isLoading={loading || isActionLoading}
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
        isLoading={isActionLoading}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        action={confirmDialog.action}
        dependencies={null}
        isLoading={isActionLoading}
        entity="resourceType"
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

export default ResourceTypesSection;

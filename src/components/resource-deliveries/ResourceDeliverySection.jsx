import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceDeliveryTable from './ResourceDeliveryTable';
import ResourceDeliveryForm from './ResourceDeliveryForm';
import { useResourceDeliveries } from '../../hooks/useResourceDeliveries';
import { translateErrorMessage } from '../../utils/translateError';
import ConfirmDialog from '../ui/ConfirmDialog';

const ResourceDeliverySection = ({ initialExpanded = true }) => {
  const {
    deliveries,
    locations,
    resourceTypes,
    search,
    setSearch,
    locationFilter,
    setLocationFilter,
    resourceTypeFilter,
    setResourceTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    addDelivery,
    editDelivery,
    removeDelivery,
    loading,
    isActionLoading,
    error,
    setError,
  } = useResourceDeliveries();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const handleServiceError = (err, defaultMessage = 'Помилка при виконанні дії') => {
    console.error('Resource Delivery Service Action Failed:', err);
    const userMessage = translateErrorMessage(err.message || defaultMessage);
    setSnackbar({ open: true, message: userMessage, severity: 'error' });
    setError(userMessage);
  };

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingDelivery(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingDelivery?.id) {
        await editDelivery(editingDelivery.id, data);
        setSnackbar({ open: true, message: 'Поставку успішно оновлено', severity: 'success' });
      } else {
        await addDelivery(data);
        setSnackbar({ open: true, message: 'Поставку успішно додано', severity: 'success' });
      }
      setFormOpen(false);
      setEditingDelivery(null);
    } catch (err) {
      handleServiceError(err, 'Помилка при збереженні поставки');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDelivery(null);
    setError(null);
  };

  const handleRemove = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await removeDelivery(confirmDialog.id);
      setSnackbar({ open: true, message: 'Поставку видалено', severity: 'success' });
      handleCloseConfirmDialog();
    } catch (err) {
      handleServiceError(err, 'Помилка при видаленні поставки');
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null });
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  if (loading && deliveries.length === 0 && !formOpen) return <Typography>Завантаження...</Typography>;

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
          <Typography variant="h5">Поставки ресурсів ({deliveries.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded}>
          <Box sx={{ p: 3 }}>
            <ResourceDeliveryTable
              deliveries={deliveries}
              locations={locations}
              resourceTypes={resourceTypes}
              search={search}
              setSearch={setSearch}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              resourceTypeFilter={resourceTypeFilter}
              setResourceTypeFilter={setResourceTypeFilter}
              dateFromFilter={dateFromFilter}
              setDateFromFilter={setDateFromFilter}
              dateToFilter={dateToFilter}
              setDateToFilter={setDateToFilter}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeDelivery={handleRemove}
              isLoading={loading}
            />
          </Box>
        </Collapse>
      </Paper>

      <ResourceDeliveryForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingDelivery || {}}
        locations={locations}
        resourceTypes={resourceTypes}
        isLoading={isActionLoading}
        error={error}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        action="delete"
        entity="delivery"
        dependencies={null}
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

export default ResourceDeliverySection;

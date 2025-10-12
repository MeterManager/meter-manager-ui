import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceDeliveryTable from './ResourceDeliveryTable';
import ResourceDeliveryForm from './ResourceDeliveryForm';
import { useResourceDeliveries } from '../../hooks/useResourceDeliveries';

const ResourceDeliverySection = ({ initialExpanded = true }) => {
  const { 
    deliveries, 
    locations, 
    resourceTypes, 
    search, 
    setSearch, 
    addDelivery, 
    editDelivery, 
    removeDelivery,
    loading 
  } = useResourceDeliveries();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditingDelivery(null);
    setFormOpen(true);
  };

  const handleEdit = (delivery) => {
    const resourceTypeName = resourceTypes.find((rt) => rt.id === delivery.energy_resource_type_id)?.name || delivery.resourceTypeName;
    setEditingDelivery({ ...delivery, resourceTypeName });
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
      setSnackbar({ open: true, message: err.message || 'Помилка при збереженні поставки', severity: 'error' });
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDelivery(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeDelivery(id);
      setSnackbar({ open: true, message: 'Поставку видалено', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Помилка при видаленні поставки', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  if (loading) return <Typography>Завантаження...</Typography>;

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
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeDelivery={handleRemove}
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
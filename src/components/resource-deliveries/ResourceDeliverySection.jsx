import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceDeliveryTable from '../resource-deliveries/ResourceDeliveryTable';
import ResourceDeliveryForm from '../resource-deliveries/ResourceDeliveryForm';
import { useResourceDeliveries } from '../../hooks/useResourceDeliveries';

const ResourceDeliverySection = ({ locations, resourceTypes, initialExpanded = true }) => {
  console.log('PROPS:', { locations, resourceTypes });
  const { deliveries, search, setSearch, addDelivery, editDelivery, removeDelivery, error, setError } =
    useResourceDeliveries();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);

  const handleToggle = () => setExpanded(!expanded);
  const handleAdd = () => {
    setEditingDelivery(null);
    setFormOpen(true);
  };
  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setFormOpen(true);
  };
  const handleFormSubmit = async (data) => {
    try {
      setError(null);

      const resourceTypeName =
        resourceTypes.data?.find((type) => type.id === data.resourceType)?.name || data.resourceType;

      const modifiedData = {
        ...data,
        resourceType: resourceTypeName,
      };

      console.log('Form submit data:', modifiedData);

      if (editingDelivery?.id) {
        console.log('Editing delivery with ID:', editingDelivery.id);
        await editDelivery(editingDelivery.id, modifiedData);
      } else {
        console.log('Adding new delivery');
        await addDelivery(modifiedData);
      }

      setFormOpen(false);
      setEditingDelivery(null);
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      setError(error.message || 'Помилка при збереженні поставки');
    }
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDelivery(null);
  };
  const handleRemove = async (id) => {
    try {
      await removeDelivery(id);
    } catch (err) {
      setError(err.message || 'Помилка при видаленні поставки');
    }
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
          <Typography variant="h5">Поставки ресурсів ({deliveries.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <ResourceDeliveryTable
              deliveries={deliveries}
              locations={locations}
              search={search}
              setSearch={setSearch}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeDelivery={handleRemove}
              setLocalError={setError}
            />
          </Box>
        </Collapse>
      </Paper>
      <ResourceDeliveryForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingDelivery || {}}
        error={error}
        locations={locations}
        resourceTypes={resourceTypes}
      />
    </>
  );
};

export default ResourceDeliverySection;

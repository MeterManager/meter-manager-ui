import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
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
    error,
    setError,
  } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingResourceType, setEditingResourceType] = useState(null);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    setEditingResourceType(null);
    setFormOpen(true);
  };

  const handleEdit = (resourceType) => {
    console.log('ResourceTypesSection handleEdit:', resourceType);
    setEditingResourceType(resourceType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    console.log('ResourceTypesSection handleFormSubmit:', formData);
    try {
      if (editingResourceType?.id) {
        console.log('Updating resource type:', editingResourceType.id, formData);
        await editResourceType(editingResourceType.id, formData);
      } else {
        console.log('Adding new resource type:', formData);
        await addResourceType(formData);
      }
      setFormOpen(false);
      setEditingResourceType(null);
    } catch (err) {
      console.error('Error in handleFormSubmit:', err);
      setError(err.message || 'Помилка при збереженні типу ресурсу');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingResourceType(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeResourceType(id);
    } catch (err) {
      setError(err.message || 'Помилка при видаленні типу ресурсу');
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
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
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
              removeResourceType={handleRemove}
              updateResourceTypeStatus={updateResourceTypeStatus}
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
    </>
  );
};

export default ResourceTypesSection;

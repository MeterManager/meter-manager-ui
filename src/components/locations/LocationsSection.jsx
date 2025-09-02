import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
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
    error,
    setError,
  } = useLocations();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

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
      } else {
        await addLocation(formData);
      }
      setFormOpen(false);
      setEditingLocation(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні локації');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLocation(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeLocation(id);
    } catch (err) {
      setError(err.message || 'Помилка при видаленні локації');
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
              removeLocation={handleRemove}
              updateLocationStatus={updateLocationStatus}
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
    </>
  );
};

export default LocationsSection;

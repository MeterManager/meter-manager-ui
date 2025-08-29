import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MetersTable from './MetersTable';
import MeterForm from './MeterForm';
import { useMeters } from '../../hooks/useMeters';

const MetersSection = ({ 
  initialExpanded = true, 
  locations = [], 
  energyResourceTypes = [] 
}) => {
  const {
    meters,
    search,
    setSearch,
    addMeter,
    editMeter,
    removeMeter,
    updateMeterStatus,
    error,
    setError,
  } = useMeters();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    setEditingMeter(null);
    setFormOpen(true);
  };

  const handleEdit = (meter) => {
    console.log('MetersSection handleEdit:', meter);
    setEditingMeter(meter);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    console.log('MetersSection handleFormSubmit:', formData);
    try {
      if (editingMeter?.id) {
        console.log('Updating meter:', editingMeter.id, formData);
        await editMeter(editingMeter.id, formData);
      } else {
        console.log('Adding new meter:', formData);
        await addMeter(formData);
      }
      setFormOpen(false);
      setEditingMeter(null);
    } catch (err) {
      console.error('Error in handleFormSubmit:', err);
      setError(err.message || 'Помилка при збереженні лічільника');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingMeter(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeMeter(id);
    } catch (err) {
      setError(err.message || 'Помилка при видаленні лічільника');
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
          <Typography variant="h5">Лічільники ({meters.length})</Typography>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <MetersTable
              meters={meters}
              search={search}
              setSearch={setSearch}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeMeter={handleRemove}
              updateMeterStatus={updateMeterStatus}
              setLocalError={setError}
            />
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
        locations={locations}
        energyResourceTypes={energyResourceTypes}
      />
    </>
  );
};

export default MetersSection;
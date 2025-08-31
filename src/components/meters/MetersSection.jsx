import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, CircularProgress } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MetersTable from './MetersTable';
import MeterForm from './MeterForm';
import { useMeters } from '../../hooks/useMeters';

const MetersSection = ({ initialExpanded = true, locations = [], energyResourceTypes = [] }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);

  const { meters, loading, error, addMeter, editMeter, removeMeter, updateMeterStatus } = useMeters();

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
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMeter?.id) await editMeter(editingMeter.id, formData);
      else await addMeter(formData);
      setFormOpen(false);
      setEditingMeter(null);
      setExpanded(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeMeter(id);
    } catch (err) {
      console.error(err);
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
            {loading ? (
              <CircularProgress />
            ) : (
              <MetersTable
                meters={meters}
                onAdd={handleAdd}
                onEdit={handleEdit}
                removeMeter={handleRemove}
                updateMeterStatus={updateMeterStatus}
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
        locations={locations.filter((l) => l.isActive)}
        energyResourceTypes={energyResourceTypes.filter((rt) => rt.isActive)}
        loading={loading}
      />
    </>
  );
};

export default MetersSection;

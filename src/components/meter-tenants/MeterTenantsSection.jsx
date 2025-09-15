import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MeterTenantsTable from './MeterTenantsTable';
import MeterTenantForm from './MeterTenantForm';
import { useMeterTenants } from '../../hooks/useMeterTenants';
import { useMeters } from '../../hooks/useMeters';
import { useTenants } from '../../hooks/useTenants';

const MeterTenantsSection = ({ initialExpanded = true }) => {
  const { meterTenants, addMeterTenant, editMeterTenant, removeMeterTenant, error, setError } = useMeterTenants();
  const { meters } = useMeters();
  const { tenants } = useTenants();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (mt) => {
    setEditing(mt);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await editMeterTenant(editing.id, data);
        setSnackbar({ open: true, message: 'Зв’язок оновлено', severity: 'success' });
      } else {
        await addMeterTenant(data);
        setSnackbar({ open: true, message: 'Зв’язок додано', severity: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || 'Помилка при збереженні', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeMeterTenant(id);
      setSnackbar({ open: true, message: 'Зв\'язок видалено', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || 'Помилка при видаленні', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  return (
    <>
      <Paper sx={{ borderRadius: 2, mb: 3 }} elevation={1}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}
          onClick={handleToggle}
        >
          <Typography variant="h5" fontWeight={600}>
            Лічильники-орендарі ({meterTenants.length})
          </Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box p={3}>
            <MeterTenantsTable
              meterTenants={meterTenants}
              tenants={tenants.filter(t => t.isActive)}
              meters={meters.filter(m => m.isActive)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </Box>
        </Collapse>
      </Paper>

      <MeterTenantForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editing ? {
          tenantId: editing.tenant_id?.toString(),
          meterId: editing.meter_id?.toString(),
          startDate: editing.assigned_from || '',
          endDate: editing.assigned_to || '',
          id: editing.id,
        } : {}}
        error={error}
        tenants={tenants.filter(t => t.isActive)}
        meters={meters.filter(m => m.isActive)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MeterTenantsSection;

import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MeterTenantsTable from './MeterTenantsTable';
import MeterTenantForm from './MeterTenantForm';
import { useMeterTenants } from '../../hooks/useMeterTenants';

const MeterTenantsSection = ({ tenants = [], meters = [], initialExpanded = true }) => {
  const { meterTenants, addMeterTenant, editMeterTenant, removeMeterTenant, error, setError } = useMeterTenants();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleToggle = () => setExpanded(!expanded);
  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (mt) => {
    setEditing(mt);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) await editMeterTenant(editing.id, data);
      else await addMeterTenant(data);
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err.message || 'Помилка при збереженні');
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeMeterTenant(id);
    } catch (err) {
      setError(err.message);
    }
  };

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
              tenants={tenants.filter((t) => t.isActive)}
              meters={meters.filter((m) => m.isActive)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd} // кнопка всередині таблиці
            />
          </Box>
        </Collapse>
      </Paper>

      <MeterTenantForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialData={
          editing
            ? {
                tenantId: editing.tenant_id?.toString(),
                meterId: editing.meter_id?.toString(),
                startDate: editing.assigned_from || '',
                endDate: editing.assigned_to || '',
                id: editing.id,
              }
            : {}
        }
        error={error}
        tenants={tenants.filter((t) => t.isActive)}
        meters={meters.filter((m) => m.isActive)}
      />
    </>
  );
};

export default MeterTenantsSection;

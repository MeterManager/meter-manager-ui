import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert, CircularProgress } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MeterTenantsTable from './MeterTenantsTable';
import MeterTenantForm from './MeterTenantForm';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useMeterTenants } from '../../hooks/useMeterTenants';
import { useMeters } from '../../hooks/useMeters';
import { useTenants } from '../../hooks/useTenants';
import { useLocations } from '../../hooks/useLocations';
import { useResourceTypes } from '../../hooks/useResourceTypes';
import { translateErrorMessage } from '../../utils/translateError';

const MeterTenantsSection = ({ initialExpanded = true }) => {
  const {
    meterTenants,
    addMeterTenant,
    editMeterTenant,
    removeMeterTenant,
    loading: mtLoading,
    isActionLoading,
    error,
    setError,
    search,
    setSearch,
    locationFilter,
    setLocationFilter,
    tenantFilter,
    setTenantFilter,
  } = useMeterTenants();

  const { meters, loading: metersLoading } = useMeters();
  const { tenants, loading: tenantsLoading } = useTenants();
  const { locations, loading: locationsLoading } = useLocations();
  const { resourceTypes, loading: typesLoading } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const handleToggle = () => setExpanded(!expanded);

  const handleAdd = () => {
    setEditing(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEdit = (mt) => {
    setEditing(mt);
    setError(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditing(null);
    setError(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing?.id) {
        await editMeterTenant(editing.id, data);
        setSnackbar({ open: true, message: 'Призначення оновлено', severity: 'success' });
      } else {
        await addMeterTenant(data);
        setSnackbar({ open: true, message: 'Призначення додано', severity: 'success' });
      }
      handleFormClose();
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка при збереженні');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
      throw err;
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await removeMeterTenant(confirmDialog.id);
      setSnackbar({ open: true, message: 'Призначення видалено', severity: 'success' });
      handleCloseConfirmDialog();
    } catch (err) {
      const userMessage = translateErrorMessage(err.message || 'Помилка при видаленні');
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null });
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  const isLoading = mtLoading || metersLoading || tenantsLoading || locationsLoading || typesLoading;

  if (isLoading && !formOpen && meterTenants.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            Призначення лічильників ({meterTenants.length})
          </Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box p={3}>
            {isLoading && meterTenants.length === 0 ? (
              <CircularProgress />
            ) : (
              <MeterTenantsTable
                meterTenants={meterTenants}
                tenants={tenants || []}
                meters={meters || []}
                locations={locations || []}
                resourceTypes={resourceTypes || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                search={search}
                setSearch={setSearch}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                tenantFilter={tenantFilter}
                setTenantFilter={setTenantFilter}
                isLoading={isLoading || isActionLoading}
                setLocalError={setError}
              />
            )}
          </Box>
        </Collapse>
      </Paper>

      <MeterTenantForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={
          editing
            ? {
                tenantId: editing.tenant_id?.toString() || '',
                meterId: editing.meter_id?.toString() || '',
                startDate: editing.assigned_from || '',
                endDate: editing.assigned_to || null,
                id: editing.id,
              }
            : {}
        }
        error={error}
        tenants={tenants.filter((t) => t.isActive)}
        meters={meters.filter((m) => m.isActive)}
        locations={locations.filter((l) => l.isActive)}
        resourceTypes={resourceTypes.filter((rt) => rt.isActive)}
        isLoading={isActionLoading}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        action="delete"
        entity="meterTenant"
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

export default MeterTenantsSection;

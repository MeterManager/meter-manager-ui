import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import TariffsTable from '../tariffs/TariffsTable';
import TariffForm from '../tariffs/TariffForm';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useTariffs } from '../../hooks/useTariffs';
import { useLocations } from '../../hooks/useLocations';
import { useResourceTypes } from '../../hooks/useResourceTypes';
import { translateErrorMessage } from '../../utils/translateError';

const TariffsSection = ({ initialExpanded = true }) => {
  const {
    tariffs,
    search,
    setSearch,
    locationFilter,
    setLocationFilter,
    resourceTypeFilter,
    setResourceTypeFilter,
    addTariff,
    editTariff,
    removeTariff,
    loading: tariffsLoading, 
    isActionLoading,
    error,
    setError
  } = useTariffs();

  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { resourceTypes, loading: typesLoading, error: typesError } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const handleToggle = () => setExpanded((prev) => !prev);

  const handleAdd = () => {
    setEditingTariff(null);
    setFormOpen(true);
  };

  const handleEdit = (tariff) => {
    setEditingTariff(tariff);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      if (editingTariff?.id) {
        await editTariff(editingTariff.id, formData);
        setSnackbar({ open: true, message: 'Тариф успішно оновлено', severity: 'success' });
      } else {
        await addTariff(formData);
        setSnackbar({ open: true, message: 'Тариф успішно додано', severity: 'success' });
      }
      setFormOpen(false);
      setEditingTariff(null);
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
      throw err;
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTariff(null);
    setError(null);
  };

  const handleRemove = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await removeTariff(confirmDialog.id);
      setSnackbar({ open: true, message: 'Тариф видалено', severity: 'success' });
      handleCloseConfirmDialog();
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, id: null });
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  const isLoading = tariffsLoading || locationsLoading || typesLoading;

  if (isLoading && !formOpen) return <Typography>Завантаження...</Typography>;
  if (locationsError) return <Typography color="error">Помилка при завантаженні локацій</Typography>;
  if (typesError) return <Typography color="error">Помилка при завантаженні типів ресурсів</Typography>;

  const locationsMap = locations?.reduce((acc, loc) => {
    acc[loc.id] = loc.name;
    return acc;
  }, {}) || {};

  const resourceTypesMap = resourceTypes?.reduce((acc, rt) => {
    acc[rt.id] = rt.name;
    return acc;
  }, {}) || {};

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
          <Typography variant="h5">Тарифи ({tariffs.length})</Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <TariffsTable
              tariffs={tariffs}
              search={search}
              setSearch={setSearch}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              resourceTypeFilter={resourceTypeFilter}
              setResourceTypeFilter={setResourceTypeFilter}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleRemove}
              setLocalError={setError}
              locationsMap={locationsMap}
              resourceTypesMap={resourceTypesMap}
              locations={locations}
              resourceTypes={resourceTypes}
              isLoading={isLoading || isActionLoading}
            />
          </Box>
        </Collapse>
      </Paper>

      <TariffForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingTariff || {}}
        error={error}
        locations={locations}
        resourceTypes={resourceTypes}
        isLoading={isActionLoading}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        action="delete"
        entity="tariff"
        dependencies={null}
        isLoading={isActionLoading}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TariffsSection;

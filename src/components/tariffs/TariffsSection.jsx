import { useState } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import TariffsTable from '../tariffs/TariffsTable';
import TariffForm from '../tariffs/TariffForm';
import { useTariffs } from '../../hooks/useTariffs';
import { useLocations } from '../../hooks/useLocations';
import { useResourceTypes } from '../../hooks/useResourceTypes';
import { translateErrorMessage } from '../../utils/translateError';

const TariffsSection = ({ initialExpanded = true }) => {
  const { tariffs, search, setSearch, addTariff, editTariff, removeTariff, error, setError } = useTariffs();
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { resourceTypes, loading: typesLoading, error: typesError } = useResourceTypes();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTariff(null);
    setError(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeTariff(id);
      setSnackbar({ open: true, message: 'Тариф видалено', severity: 'success' });
    } catch (err) {
      const userMessage = translateErrorMessage(err.message);
      setError(userMessage);
      setSnackbar({ open: true, message: userMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  if (locationsLoading || typesLoading) return <Typography>Завантаження...</Typography>;
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
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleRemove}
              setLocalError={setError}
              locationsMap={locationsMap}
              resourceTypesMap={resourceTypesMap}
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

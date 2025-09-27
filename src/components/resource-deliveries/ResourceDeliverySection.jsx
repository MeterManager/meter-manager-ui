import { useState, useMemo, useCallback } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceDeliveryTable from './ResourceDeliveryTable';
import ResourceDeliveryForm from './ResourceDeliveryForm';
import { useResourceDeliveries } from '../../hooks/useResourceDeliveries';
import { useLocations } from '../../hooks/useLocations';
import { useResourceTypes } from '../../hooks/useResourceTypes';

const ResourceDeliverySection = ({ initialExpanded = true }) => {
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { resourceTypes, loading: typesLoading, error: typesError } = useResourceTypes();

  const memoizedLocations = useMemo(() => locations, [locations]);
  const memoizedResourceTypes = useMemo(() => resourceTypes, [resourceTypes]);

  const { deliveries, search, setSearch, addDelivery, editDelivery, removeDelivery, error, setError } =
    useResourceDeliveries();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = useCallback(() => setExpanded((prev) => !prev), []);

  const handleAdd = useCallback(() => {
    setEditingDelivery(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    (delivery) => {
      const resourceTypeName =
        memoizedResourceTypes.find((rt) => rt.id === delivery.energy_resource_type_id)?.name ||
        delivery.resourceTypeName;

      setEditingDelivery({
        ...delivery,
        resourceTypeName,
      });
      setFormOpen(true);
    },
    [memoizedResourceTypes]
  );

  const handleFormSubmit = useCallback(
    async (data) => {
      try {
        setError(null);
        if (editingDelivery?.id) {
          await editDelivery(editingDelivery.id, data);
          setSnackbar({ open: true, message: 'Поставку успішно оновлено', severity: 'success' });
        } else {
          await addDelivery(data);
          setSnackbar({ open: true, message: 'Поставку успішно додано', severity: 'success' });
        }
        setFormOpen(false);
        setEditingDelivery(null);
      } catch (err) {
        setError(err.message || 'Помилка при збереженні поставки');
        setSnackbar({ open: true, message: err.message || 'Помилка при збереженні поставки', severity: 'error' });
      }
    },
    [editingDelivery, addDelivery, editDelivery, setError]
  );

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingDelivery(null);
  }, []);

  const handleRemove = useCallback(
    async (id) => {
      try {
        await removeDelivery(id);
        setSnackbar({ open: true, message: 'Поставку видалено', severity: 'success' });
      } catch (err) {
        setError(err.message || 'Помилка при видаленні поставки');
        setSnackbar({ open: true, message: err.message || 'Помилка при видаленні поставки', severity: 'error' });
      }
    },
    [removeDelivery, setError]
  );

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', severity: 'success' });

  if (locationsLoading || typesLoading) return <Typography>Завантаження...</Typography>;
  if (locationsError) return <Typography color="error">Помилка при завантаженні локацій</Typography>;
  if (typesError) return <Typography color="error">Помилка при завантаженні типів ресурсів</Typography>;

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
          <Typography
            variant="h5"
            component="h2"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Поставки ресурсів ({deliveries.length})
          </Typography>
          <IconButton onClick={handleToggle} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded}>
          <Box sx={{ p: 3 }}>
            <ResourceDeliveryTable
              deliveries={deliveries}
              locations={memoizedLocations}
              resourceTypes={memoizedResourceTypes}
              search={search}
              setSearch={setSearch}
              onAdd={handleAdd}
              onEdit={handleEdit}
              removeDelivery={handleRemove}
              error={error}
            />
          </Box>
        </Collapse>
      </Paper>

      <ResourceDeliveryForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingDelivery || {}}
        locations={memoizedLocations}
        resourceTypes={memoizedResourceTypes}
        error={error}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResourceDeliverySection;
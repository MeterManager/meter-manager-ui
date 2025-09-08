import { useState, useMemo, useCallback } from 'react';
import { Paper, Box, Typography, Collapse, IconButton, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ResourceDeliveryTable from './ResourceDeliveryTable';
import ResourceDeliveryForm from './ResourceDeliveryForm';
import { useResourceDeliveries } from '../../hooks/useResourceDeliveries';

const ResourceDeliverySection = ({ locations = [], resourceTypes = [], initialExpanded = true }) => {
  const memoizedLocations = useMemo(() => locations, [locations]);
  const memoizedResourceTypes = useMemo(() => resourceTypes, [resourceTypes]);

  const { deliveries, search, setSearch, addDelivery, editDelivery, removeDelivery, error, setError } =
    useResourceDeliveries();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);

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
        } else {
          await addDelivery(data);
        }
        setFormOpen(false);
        setEditingDelivery(null);
      } catch (err) {
        setError(err.message || 'Помилка при збереженні поставки');
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
      } catch (err) {
        setError(err.message || 'Помилка при видаленні поставки');
      }
    },
    [removeDelivery, setError]
  );

  return (
    <Box
      sx={{
        width: '86vw',
        maxWidth: '100vw',
        minWidth: 0,
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-43vw',
        boxSizing: 'border-box',
      }}
    >
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
          <IconButton onClick={handleToggle} size="small" sx={{ flexShrink: 0 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded}>
          <Box
            sx={{
              p: 3,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
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
    </Box>
  );
};

export default ResourceDeliverySection;

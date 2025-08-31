import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem } from '@mui/material';

const ResourceDeliveryForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  error,
  locations = [],
  resourceTypes = [],
}) => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const resourceTypesArray = Array.isArray(resourceTypes) ? resourceTypes : [];
  const locationsArray = Array.isArray(locations) ? locations : [];

  useEffect(() => {
    if (open) {
      console.log('ResourceDeliveryForm initialData:', initialData);
      console.log('ResourceTypes array:', resourceTypesArray);

      const mappedData = {
        locationId: initialData.locationId || '',
        resourceTypeId: initialData.energy_resource_type_id || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || '',
        pricePerUnit: initialData.pricePerUnit || '',
        deliveryDate: initialData.deliveryDate || '',
        supplier: initialData.supplier || '',
      };

      console.log('Mapped form data:', mappedData);
      setFormData(mappedData);
      setFormErrors({});
    }
  }, [open, initialData, resourceTypesArray]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const processedValue = (name === 'locationId' || name === 'resourceTypeId') && value !== '' ? Number(value) : value;

    setFormData({ ...formData, [name]: processedValue });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.locationId) errors.locationId = 'Виберіть локацію';
    if (!formData.resourceTypeId) errors.resourceTypeId = 'Виберіть тип ресурсу';
    if (!formData.quantity || isNaN(formData.quantity)) errors.quantity = 'Вкажіть кількість';
    if (!formData.unit) errors.unit = 'Вкажіть одиницю виміру';
    if (!formData.pricePerUnit || isNaN(formData.pricePerUnit)) errors.pricePerUnit = 'Вкажіть ціну за одиницю';
    if (!formData.deliveryDate) errors.deliveryDate = 'Вкажіть дату';
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const submitData = {
      ...formData,
      locationId: parseInt(formData.locationId),
      energy_resource_type_id: parseInt(formData.resourceTypeId),
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      totalCost: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit),
    };

    console.log('Form submit data:', submitData);

    if (isNaN(submitData.locationId) || submitData.locationId <= 0) {
      console.error('Invalid locationId:', submitData.locationId);
      setFormErrors({ ...formErrors, locationId: 'Неправильний ID локації' });
      return;
    }

    if (isNaN(submitData.energy_resource_type_id) || submitData.energy_resource_type_id <= 0) {
      console.error('Invalid resourceTypeId:', submitData.energy_resource_type_id);
      setFormErrors({ ...formErrors, resourceTypeId: 'Неправильний тип ресурсу' });
      return;
    }

    onSubmit(submitData);
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData.id ? 'Редагувати поставку ресурсу' : 'Додати поставку ресурсу'}</DialogTitle>
      <DialogContent sx={{ pb: 0, mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          select
          name="locationId"
          label="Локація"
          value={formData.locationId || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.locationId}
          helperText={formErrors.locationId}
          sx={{ mt: 1, mb: 3 }}
        >
          {locationsArray.length === 0 ? (
            <MenuItem disabled>Немає доступних локацій</MenuItem>
          ) : (
            locationsArray.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          name="resourceTypeId"
          label="Тип ресурсу"
          value={formData.resourceTypeId || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.resourceTypeId}
          helperText={formErrors.resourceTypeId || ' '}
        >
          {resourceTypesArray.length === 0 ? (
            <MenuItem disabled>Немає доступних типів ресурсів</MenuItem>
          ) : (
            resourceTypesArray.map((res) => (
              <MenuItem key={res.id} value={res.id}>
                {res.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          name="quantity"
          label="Кількість"
          type="number"
          value={formData.quantity || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.quantity}
          helperText={formErrors.quantity || ' '}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <TextField
          name="unit"
          label="Одиниця виміру"
          value={formData.unit || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.unit}
          helperText={formErrors.unit || ' '}
        />

        <TextField
          name="pricePerUnit"
          label="Ціна за одиницю"
          type="number"
          value={formData.pricePerUnit || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.pricePerUnit}
          helperText={formErrors.pricePerUnit || ' '}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <TextField
          name="deliveryDate"
          label="Дата доставки"
          type="date"
          value={formData.deliveryDate || ''}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!formErrors.deliveryDate}
          helperText={formErrors.deliveryDate || ' '}
        />

        <TextField
          name="supplier"
          label="Постачальник"
          value={formData.supplier || ''}
          onChange={handleChange}
          fullWidth
          helperText=" "
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, mb: 1 }}>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Скасувати
        </Button>
        <Button variant="contained" size="small" onClick={handleSubmit}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceDeliveryForm;

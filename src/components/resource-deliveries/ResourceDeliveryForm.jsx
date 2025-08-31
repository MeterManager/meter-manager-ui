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

  const locationsArray = Array.isArray(locations) ? locations : [];
  const resourceTypesArray = Array.isArray(resourceTypes) ? resourceTypes : [];

  useEffect(() => {
    if (open) {
      setFormData({
        locationId: initialData.locationId || '',
        resourceType: initialData.resourceType || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || '',
        pricePerUnit: initialData.pricePerUnit || '',
        deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
        supplier: initialData.supplier || '',
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.locationId) errors.locationId = 'Виберіть локацію';
    if (!formData.resourceType) errors.resourceType = 'Виберіть тип ресурсу';
    if (!formData.quantity || isNaN(formData.quantity)) errors.quantity = 'Вкажіть кількість';
    if (!formData.unit) errors.unit = 'Вкажіть одиницю виміру';
    if (!formData.pricePerUnit || isNaN(formData.pricePerUnit)) errors.pricePerUnit = 'Вкажіть ціну за одиницю';
    if (!formData.deliveryDate) errors.deliveryDate = 'Вкажіть дату';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      const deliveryDateIso = new Date(formData.deliveryDate).toISOString();

      const submitData = {
        location_id: Number(formData.locationId),
        resource_type: formData.resourceType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.pricePerUnit),
        total_cost: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit),
        delivery_date: deliveryDateIso,
        supplier: formData.supplier || '',
      };

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
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
          helperText={formErrors.locationId || ' '}
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
          name="resourceType"
          label="Тип ресурсу"
          value={formData.resourceType || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.resourceType}
          helperText={formErrors.resourceType || ' '}
        >
          {resourceTypesArray.length === 0 ? (
            <MenuItem disabled>Немає доступних типів ресурсів</MenuItem>
          ) : (
            resourceTypesArray.map((res) => (
              <MenuItem key={res.id} value={res.name}>
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

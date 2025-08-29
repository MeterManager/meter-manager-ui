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
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        id: initialData.id || '',
        resourceType: initialData.resourceType || '',
        locationId: initialData.locationId || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || '',
        pricePerUnit: initialData.pricePerUnit || '',
        deliveryDate: initialData.deliveryDate || '',
        supplier: initialData.supplier || '',
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.resourceType) errors.resourceType = 'Виберіть тип ресурсу';
    if (!formData.locationId) errors.locationId = 'Виберіть локацію';
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

    onSubmit({
      ...formData,
      locationId: parseInt(formData.locationId),
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      totalCost: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit),
    });

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
          name="resourceType"
          label="Тип ресурсу"
          value={formData.resourceType || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
          error={!!formErrors.resourceType}
          helperText={formErrors.resourceType || ' '}
        >
          {resourceTypes.length === 0 ? (
            <MenuItem disabled>Немає доступних типів ресурсів</MenuItem>
          ) : (
            resourceTypes.map((res) => (
              <MenuItem key={res.id} value={res.id}>
                {res.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          name="locationId"
          label="Локація"
          value={formData.locationId || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.locationId}
          helperText={formErrors.locationId}
          sx={{ mb: 3 }}
        >
          {locations.length === 0 ? (
            <MenuItem disabled>Немає доступних локацій</MenuItem>
          ) : (
            locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
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

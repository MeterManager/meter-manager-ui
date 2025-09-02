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

  useEffect(() => {
    if (open) {
      const mappedData = {
        locationId: initialData.location_id || initialData.locationId || '',
        resourceTypeId: initialData.energy_resource_type_id || initialData.resourceTypeId || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || '',
        pricePerUnit: initialData.price_per_unit || initialData.pricePerUnit || '',
        deliveryDate: (initialData.delivery_date || initialData.deliveryDate) 
          ? new Date(initialData.delivery_date || initialData.deliveryDate).toISOString().split('T')[0] 
          : '',
        supplier: initialData.supplier || '',
      };
      setFormData(mappedData);
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'locationId' && !value) error = 'Виберіть локацію.';
    if (name === 'resourceTypeId' && !value) error = 'Виберіть тип ресурсу.';
    if (name === 'quantity' && (!value || isNaN(value) || parseFloat(value) < 0)) error = 'Вкажіть кількість (додатнє число).';
    if (name === 'unit' && !value) error = "Вкажіть одиницю виміру.";
    if (name === 'pricePerUnit' && (!value || isNaN(value) || parseFloat(value) < 0)) error = 'Вкажіть ціну за одиницю (додатнє число).';
    if (name === 'deliveryDate' && !value) error = 'Вкажіть дату.';

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'locationId' || name === 'resourceTypeId') && value !== '' ? Number(value) : value;
    setFormData({ ...formData, [name]: processedValue });
    validateField(name, processedValue);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.locationId) errors.locationId = 'Виберіть локацію.';
    if (!formData.resourceTypeId) errors.resourceTypeId = 'Виберіть тип ресурсу.';
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) < 0) errors.quantity = 'Вкажіть кількість.';
    if (!formData.unit) errors.unit = 'Вкажіть одиницю виміру.';
    if (!formData.pricePerUnit || isNaN(formData.pricePerUnit) || parseFloat(formData.pricePerUnit) < 0) errors.pricePerUnit = 'Вкажіть ціну за одиницю.';
    if (!formData.deliveryDate) errors.deliveryDate = 'Вкажіть дату.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const submitData = {
      locationId: Number(formData.locationId),
      resourceTypeId: Number(formData.resourceTypeId),
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      totalCost: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit),
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
      supplier: formData.supplier || '',
    };

    try {
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
          sx={{ mt: 1 }}
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
          select
          name="resourceTypeId"
          label="Тип ресурсу"
          value={formData.resourceTypeId || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.resourceTypeId}
          helperText={formErrors.resourceTypeId || ' '}
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
          sx={{ mb: 1 }}
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
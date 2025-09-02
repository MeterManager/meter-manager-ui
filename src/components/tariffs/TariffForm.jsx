import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem } from '@mui/material';

const TariffForm = ({ open, onClose, onSubmit, initialData = {}, error, locations, resourceTypes }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        location_id: initialData.location_id || '',
        energy_resource_type_id: initialData.energy_resource_type_id || '',
        price: initialData.price || '',
        valid_from: initialData.valid_from || '',
        valid_to: initialData.valid_to || '',
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'location_id' && !value) {
      error = "Локація обов'язкова.";
    }
    if (name === 'energy_resource_type_id' && !value) {
      error = "Тип ресурсу обов'язковий.";
    }
    if (name === 'price') {
      if (!value) {
        error = "Ціна обов'язкова.";
      } else if (Number(value) <= 0) {
        error = "Ціна має бути більшою за 0.";
      }
    }
    if (name === 'valid_from' && !value) {
      error = "Дата початку обов'язкова.";
    }
    if (name === 'valid_to' && value && formData.valid_from && new Date(value) < new Date(formData.valid_from)) {
      error = "Дата завершення не може бути раніше дати початку.";
    } else if (name === 'valid_from' && value && formData.valid_to && new Date(value) > new Date(formData.valid_to)) {
      error = "Дата початку не може бути пізніше дати завершення.";
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.location_id) errors.location_id = 'Локація обов’язкова';
    if (!formData.energy_resource_type_id) errors.energy_resource_type_id = 'Тип ресурсу обов’язковий';
    if (!formData.price) {
      errors.price = 'Ціна обов’язкова';
    } else if (Number(formData.price) <= 0) {
      errors.price = 'Ціна має бути більшою за 0';
    }
    if (!formData.valid_from) errors.valid_from = 'Дата початку обов’язкова';
    if (formData.valid_to && new Date(formData.valid_to) < new Date(formData.valid_from)) {
      errors.valid_to = "Дата завершення не може бути раніше дати початку.";
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit(formData);
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData.id ? 'Редагувати тариф' : 'Додати тариф'}</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          name="location_id"
          label="Локація"
          value={formData.location_id || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
          error={!!formErrors.location_id}
          helperText={formErrors.location_id || ' '}
        >
          {(locations || []).map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="energy_resource_type_id"
          label="Тип ресурсу"
          value={formData.energy_resource_type_id || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.energy_resource_type_id}
          helperText={formErrors.energy_resource_type_id || ' '}
        >
          {(resourceTypes || []).map((res) => (
            <MenuItem key={res.id} value={res.id}>
              {res.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="price"
          label="Ціна (₴)"
          type="number"
          value={formData.price || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.price}
          helperText={formErrors.price || ' '}
        />

        <TextField
          name="valid_from"
          label="Діє з"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.valid_from || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.valid_from}
          helperText={formErrors.valid_from || ' '}
        />

        <TextField
          name="valid_to"
          label="Діє до"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.valid_to || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.valid_to}
          helperText={formErrors.valid_to}
          sx={{ mb: 2 }}
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

export default TariffForm;

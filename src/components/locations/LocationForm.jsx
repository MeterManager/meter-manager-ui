import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';

const LocationForm = ({ open, onClose, onSubmit, initialData = {}, error, locations }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
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
    if (!formData.name) errors.name = "Назва обов'язкова";
    if (!formData.address) errors.address = "Адреса обов'язкова";
    if (formData.name && locations.some((loc) => loc.name === formData.name && loc.id !== initialData.id)) {
      errors.name = 'Локація з такою назвою вже існує';
    }
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
      isActive: formData.isActive
    });

    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{initialData.id ? 'Редагувати локацію' : 'Додати локацію'}</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          name="name"
          label="Назва"
          value={formData.name || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 1, mt: 1 }}
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
        />
        <TextField
          name="address"
          label="Адреса"
          value={formData.address || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.address}
          helperText={formErrors.address || ' '}
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

export default LocationForm;
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';

const ResourceTypeForm = ({ open, onClose, onSubmit, initialData = {}, error, resourceTypes = [] }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        unit: initialData.unit || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value) {
        error = "Тип ресурсу обов’язковий.";
      } else if (resourceTypes.some((t) => t.name === value && t.id !== initialData.id)) {
        error = 'Тип ресурсу з такою назвою вже існує.';
      }
    }
    if (name === 'unit' && !value) error = "Одиниці вимірювання обов’язкові.";   
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Тип ресурсу обов’язковий';
    if (!formData.unit) errors.unit = 'Одиниці вимірювання обов’язкові';
    if (formData.name && resourceTypes.some((t) => t.name === formData.name && t.id !== initialData.id)) {
      errors.name = 'Тип ресурсу з такою назвою вже існує';
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
      isActive: formData.isActive ?? initialData.isActive ?? true,
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
      <DialogTitle>{initialData.id ? 'Редагувати тип ресурсу' : 'Додати тип ресурсу'}</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          name="name"
          label="Тип ресурсу"
          value={formData.name || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
        />
        <TextField
          name="unit"
          label="Одиниці вимірювання"
          value={formData.unit || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.unit}
          helperText={formErrors.unit || ' '}
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

export default ResourceTypeForm;

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  MenuItem,
} from '@mui/material';

const TenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants, locations = [] }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        locationId: initialData.locationId || '',
        occupiedArea: initialData.occupiedArea || '',
        contactPerson: initialData.contactPerson || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
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
        error = "Назва орендаря обов'язкова.";
      } else if (tenants.some((t) => t.name.trim() === value.trim() && t.id !== initialData.id)) {
        error = 'Орендар з такою назвою вже існує.';
      }
    }
    if (name === 'locationId' && !value) {
      error = "Локація обов'язкова.";
    }
    if (name === 'occupiedArea' && value && parseFloat(value) < 0) {
      error = "Площа не може бути від'ємною.";
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Невірний формат email.";
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
    if (!formData.name) errors.name = "Назва орендаря обов'язкова";
    if (!formData.locationId) errors.locationId = 'Локація обов’язкова';

    if (tenants.some((t) => t.name.trim() === formData.name.trim() && t.id !== initialData.id)) {
      errors.name = 'Орендар з такою назвою вже існує';
    }

    if (formData.occupiedArea && parseFloat(formData.occupiedArea) < 0) {
      errors.occupiedArea = 'Площа не може бути від’ємною';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Невірний формат email';
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
      locationId: parseInt(formData.locationId),
      occupiedArea: formData.occupiedArea ? parseFloat(formData.occupiedArea) : null,
      isActive: formData.isActive ?? true,
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
      <DialogTitle>{initialData.id ? 'Редагувати орендаря' : 'Додати орендаря'}</DialogTitle>
      <DialogContent sx={{ mt: 1, pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          name="name"
          label="Назва орендаря"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
        />

        <TextField
          select
          name="locationId"
          label="Локація"
          value={formData.locationId}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.locationId}
          helperText={formErrors.locationId || ' '}
        >
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="occupiedArea"
          label="Зайнята площа (м²)"
          type="number"
          value={formData.occupiedArea || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.occupiedArea}
          helperText={formErrors.occupiedArea || ' '}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <TextField
          name="contactPerson"
          label="Контактна особа"
          value={formData.contactPerson || ''}
          onChange={handleChange}
          fullWidth
          helperText={formErrors.contactPerson || ' '}
        />

        <TextField
          name="phone"
          label="Телефон"
          value={formData.phone || ''}
          onChange={handleChange}
          fullWidth
          helperText={formErrors.phone || ' '}
        />

        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.email}
          helperText={formErrors.email || ' '}
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

export default TenantForm;

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
  CircularProgress,
  Box,
} from '@mui/material';

const MeterForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  error,
  meters = [],
  locations = [],
  energyResourceTypes = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        serial_number: initialData.serial_number || '',
        location_id: initialData.location_id || '',
        energy_resource_type_id: initialData.energy_resource_type_id || '',
        isActive: initialData.isActive ?? false,
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

    if (!formData.serial_number) errors.serial_number = "Серійний номер обов'язковий";
    if (!formData.location_id) errors.location_id = "Локація обов'язкова";
    if (!formData.energy_resource_type_id) errors.energy_resource_type_id = "Тип енергоресурсу обов'язковий";

    // Перевірка унікальності серійного номера, лише якщо meters вже підвантажились
    if (formData.serial_number && Array.isArray(meters) && !loading) {
      if (meters.some((m) => m.serial_number === formData.serial_number && m.id !== initialData.id)) {
        errors.serial_number = 'Лічільник з таким серійним номером вже існує';
      }
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
      isActive: formData.isActive ?? initialData.isActive ?? false,
    });

    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData.id ? 'Редагувати лічільник' : 'Додати лічільник'}</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            <TextField
              name="serial_number"
              label="Серійний номер"
              value={formData.serial_number || ''}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1, mt: 1 }}
              error={!!formErrors.serial_number}
              helperText={formErrors.serial_number || ' '}
            />

            <TextField
              select
              name="location_id"
              label="Локація"
              value={formData.location_id || ''}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1, mt: 1 }}
              error={!!formErrors.location_id}
              helperText={formErrors.location_id || ' '}
            >
              {locations
                .filter((l) => l.isActive)
                .map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              name="energy_resource_type_id"
              label="Тип енергоресурсу"
              value={formData.energy_resource_type_id || ''}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              error={!!formErrors.energy_resource_type_id}
              helperText={formErrors.energy_resource_type_id || ' '}
            >
              {energyResourceTypes
                .filter((rt) => rt.isActive)
                .map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
            </TextField>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, mb: 1 }}>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Скасувати
        </Button>
        <Button variant="contained" size="small" onClick={handleSubmit} disabled={loading}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeterForm;

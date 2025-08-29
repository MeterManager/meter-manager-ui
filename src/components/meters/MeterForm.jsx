import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const MeterForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = {}, 
  error, 
  meters,
  locations = [],
  energyResourceTypes = []
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
    
    if (!formData.serial_number) {
      errors.serial_number = "Серійний номер обов'язковий";
    }
    
    if (!formData.location_id) {
      errors.location_id = "Локація обов'язкова";
    }
    
    if (!formData.energy_resource_type_id) {
      errors.energy_resource_type_id = "Тип енергоресурсу обов'язковий";
    }

    // Перевірка унікальності серійного номера
    if (formData.serial_number && meters.some((meter) => 
      meter.serial_number === formData.serial_number && meter.id !== initialData.id
    )) {
      errors.serial_number = 'Лічільник з таким серійним номером вже існує';
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {initialData.id ? 'Редагувати лічільник' : 'Додати лічільник'}
      </DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
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

        <FormControl 
          fullWidth 
          sx={{ mb: 1 }}
          error={!!formErrors.location_id}
        >
          <InputLabel>Локація</InputLabel>
          <Select
            name="location_id"
            value={formData.location_id || ''}
            onChange={handleChange}
            label="Локація"
          >
            {locations
              .filter(location => location.isActive)
              .map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))
            }
          </Select>
          {formErrors.location_id && (
            <Alert severity="error" sx={{ mt: 0.5 }}>
              {formErrors.location_id}
            </Alert>
          )}
        </FormControl>

        <TextField
          name="energy_resource_type_id"
          label="ID типу енергоресурсу (тимчасово)"
          value={formData.energy_resource_type_id || ''}
          onChange={handleChange}
          fullWidth
          type="number"
          sx={{ mb: 1 }}
          error={!!formErrors.energy_resource_type_id}
          helperText={formErrors.energy_resource_type_id || 'Введіть ID типу енергоресурсу'}
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

export default MeterForm;
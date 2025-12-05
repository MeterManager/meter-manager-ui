import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';

const formatISODate = (dateValue) => {
    if (!dateValue) return null;
    return new Date(dateValue).toISOString().split('T')[0];
};

const TariffForm = ({ open, onClose, onSubmit, initialData = {}, error, locations, resourceTypes, isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        location_id: initialData.location_id || '', 
        energy_resource_type_id: initialData.energy_resource_type_id || '',
        price: initialData.price || '',
        valid_from: initialData.valid_from ? formatISODate(initialData.valid_from) : '', 
        valid_to: initialData.valid_to ? formatISODate(initialData.valid_to) : null,
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value, currentFormData) => {
    let errorMsg = '';
    const trimmedValue = (typeof value === 'string') ? value.trim() : value;

    if ((name === 'location_id' || name === 'energy_resource_type_id' || name === 'valid_from') && (!trimmedValue || trimmedValue === '')) {
      if (name === 'valid_from') errorMsg = "Дата початку обов'язкова.";
      else errorMsg = name.replace('_id', '').charAt(0).toUpperCase() + name.replace('_id', '').slice(1) + " обов'язковий.";
    }

    if (name === 'price') {
      if (!trimmedValue) {
        errorMsg = "Ціна обов'язкова.";
      } else if (isNaN(trimmedValue) || Number(trimmedValue) <= 0) {
        errorMsg = 'Ціна має бути позитивним числом.';
      }
    }
    
    
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const isIdField = name === 'location_id' || name === 'energy_resource_type_id';
    const processedValue = isIdField && value !== '' ? Number(value) : value;

    const updatedFormData = { ...formData, [name]: processedValue };
    setFormData(updatedFormData);
    validateField(name, processedValue, updatedFormData);
  };

  const handleDateChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    validateField(name, value, updatedFormData);
  };


  const handleSubmit = () => {
    const fieldsToValidate = ['location_id', 'energy_resource_type_id', 'price', 'valid_from'];
    const errors = {};
    let hasError = false;

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formData[field], formData);
      if (errorMsg) {
        errors[field] = errorMsg;
        hasError = true;
      }
    });

    if (formData.valid_from && formData.valid_to && new Date(formData.valid_to) < new Date(formData.valid_from)) {
      errors.valid_to = 'Дата завершення не може бути раніше дати початку.';
      errors.valid_from = 'Дата початку повинна бути раніше дати завершення.';
      hasError = true;
    }


    if (hasError) {
      setFormErrors(errors);
      return;
    }

    const payload = { 
        ...formData,
        price: parseFloat(formData.price),
        location_id: Number(formData.location_id),
        energy_resource_type_id: Number(formData.energy_resource_type_id),
        
        valid_from: formData.valid_from,
        valid_to: formData.valid_to || null,
    };

    onSubmit(payload);
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          maxWidth: '600px',
          margin: isMobile ? 0 : 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: isMobile ? '1.125rem' : '1.25rem',
          fontWeight: 600,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {initialData.id ? 'Редагувати тариф' : 'Додати тариф'}
        <IconButton onClick={handleClose} size="small" disabled={isLoading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 2 : 3, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : '1rem' }}>
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
          variant="outlined"
          size="medium"
          sx={{ mt: 1, mb: 2 }}
          error={!!formErrors.location_id}
          helperText={formErrors.location_id || ' '}
          disabled={isLoading}
        >
          <MenuItem value="">Оберіть локацію</MenuItem>
          {(locations || [])
            .filter((loc) => loc.isActive)
            .map((loc) => (
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
          variant="outlined"
          size="medium"
          sx={{ mb: 2 }}
          error={!!formErrors.energy_resource_type_id}
          helperText={formErrors.energy_resource_type_id || ' '}
          disabled={isLoading}
        >
          <MenuItem value="">Оберіть тип ресурсу</MenuItem>
          {(resourceTypes || [])
            .filter((res) => res.isActive)
            .map((res) => (
              <MenuItem key={res.id} value={res.id}>
                {res.name} ({res.unit})
              </MenuItem>
            ))}
        </TextField>

        <TextField
          name="price"
          label="Ціна (₴)"
          type="number"
          inputProps={{ min: 0, step: 0.0001 }}
          value={formData.price || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{ mb: 2 }}
          error={!!formErrors.price}
          helperText={formErrors.price || ' '}
          disabled={isLoading}
        />

        <CustomDatePicker
          value={formData.valid_from || null}
          onChange={(newValue) => {
            handleDateChange('valid_from', newValue);
          }}
          label="Діє з"
          error={!!formErrors.valid_from}
          helperText={formErrors.valid_from || ' '}
          sx={{ mb: 2 }}
          disabled={isLoading}
          slotProps={{ textField: { size: 'medium', fullWidth: true, required: true } }}
        />

        <CustomDatePicker
          value={formData.valid_to || null}
          onChange={(newValue) => {
            handleDateChange('valid_to', newValue);
          }}
          label="Діє до (необов'язково)"
          minDate={formData.valid_from ? new Date(formData.valid_from) : undefined}
          error={!!formErrors.valid_to}
          helperText={formErrors.valid_to || 'Залиште порожнім для безстрокового тарифу'}
          disabled={isLoading}
          slotProps={{ textField: { size: 'medium', fullWidth: true } }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2,
          gap: isMobile ? 1 : 1,
          flexDirection: isMobile ? 'column-reverse' : 'row',
          '& .MuiButton-root': {
            minWidth: isMobile ? 'auto' : '80px',
            fontSize: isMobile ? '1rem' : '0.875rem',
            height: isMobile ? '44px' : '36px',
          },
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 1 : 0 }}
          disabled={isLoading}
        >
          Скасувати
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 0 : 1, marginLeft: '0 !important' }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TariffForm;
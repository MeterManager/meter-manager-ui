import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';
import { Close } from '@mui/icons-material';

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
        valid_from: initialData.valid_from || '',
        valid_to: initialData.valid_to || null,
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value, currentFormData) => {
    let errorMsg = '';
    if (name === 'location_id' && !value) {
      errorMsg = "Локація обов'язкова.";
    }
    if (name === 'energy_resource_type_id' && !value) {
      errorMsg = "Тип ресурсу обов'язковий.";
    }
    if (name === 'price') {
      if (!value) {
        errorMsg = "Ціна обов'язкова.";
      } else if (isNaN(value) || Number(value) <= 0) {
        errorMsg = 'Ціна має бути позитивним числом.';
      }
    }
    if (name === 'valid_from' && !value) {
      errorMsg = "Дата початку обов'язкова.";
    }
    
    const validFrom = name === 'valid_from' ? value : currentFormData.valid_from;
    const validTo = name === 'valid_to' ? value : currentFormData.valid_to;

    if (validFrom && validTo && new Date(validTo) < new Date(validFrom)) {
        if (name === 'valid_to') {
            errorMsg = 'Дата завершення не може бути раніше дати початку.';
        } else if (name === 'valid_from') {
            setFormErrors((prevErrors) => ({ ...prevErrors, valid_to: 'Дата завершення не може бути раніше дати початку.' }));
        }
    } else {
         if (name === 'valid_to' && formErrors.valid_from?.includes('пізніше')) {
             setFormErrors((prevErrors) => ({ ...prevErrors, valid_from: '' }));
         }
         if (name === 'valid_from' && formErrors.valid_to?.includes('раніше')) {
             setFormErrors((prevErrors) => ({ ...prevErrors, valid_to: '' }));
         }
    }


    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = value === '' && (name === 'valid_to' || name === 'valid_from') ? null : value;
    
    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);
    validateField(name, newValue, updatedFormData);
  };


  const handleSubmit = () => {
    const fieldsToValidate = ['location_id', 'energy_resource_type_id', 'price', 'valid_from'];
    const errors = {};
    let hasError = false;

    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      const errorMsg = validateField(field, value, formData);
      if (errorMsg) {
        errors[field] = errorMsg;
        hasError = true;
      }
    });
    const validToError = validateField('valid_to', formData.valid_to, formData);
     if (validToError) {
         errors['valid_to'] = validToError;
         hasError = true;
     }


    if (hasError) {
      setFormErrors(errors);
      return;
    }

    const payload = { ...formData };
    if (payload.valid_to === null || payload.valid_to === '') {
      delete payload.valid_to;
    } else {
        payload.valid_to = new Date(payload.valid_to).toISOString().split('T')[0];
    }
    payload.valid_from = new Date(payload.valid_from).toISOString().split('T')[0];
    payload.price = parseFloat(payload.price);
    payload.location_id = Number(payload.location_id);
    payload.energy_resource_type_id = Number(payload.energy_resource_type_id);


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
          width: isMobile ? '100%' : isMobileOrTablet ? '90%' : '600px',
          maxWidth: isMobile ? '100%' : '600px',
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

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          pb: 1,
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
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
          inputProps={{ min: 0, step: 0.01 }}
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
            handleChange({
              target: { name: 'valid_from', value: newValue },
            });
          }}
          label="Діє з"
          error={!!formErrors.valid_from}
          helperText={formErrors.valid_from || ' '}
          sx={{ mb: 2 }}
          disabled={isLoading}
          slotProps={{ textField: { size: 'medium', fullWidth: true } }}
        />

        <CustomDatePicker
          value={formData.valid_to || null}
          onChange={(newValue) => {
            handleChange({
              target: { name: 'valid_to', value: newValue },
            });
          }}
          label="Діє до (необов'язково)"
          minDate={formData.valid_from || undefined}
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
          {isLoading ? <CircularProgress size={24} /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TariffForm;

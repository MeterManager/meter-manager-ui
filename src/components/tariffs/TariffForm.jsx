import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';
import { Close } from '@mui/icons-material';

const TariffForm = ({ open, onClose, onSubmit, initialData = {}, error, locations, resourceTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        error = 'Ціна має бути більшою за 0.';
      }
    }
    if (name === 'valid_from' && !value) {
      error = "Дата початку обов'язкова.";
    }
    if (name === 'valid_to' && value && formData.valid_from && new Date(value) < new Date(formData.valid_from)) {
      error = 'Дата завершення не може бути раніше дати початку.';
    } else if (name === 'valid_from' && value && formData.valid_to && new Date(value) > new Date(formData.valid_to)) {
      error = 'Дата початку не може бути пізніше дати завершення.';
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === '' && (name === 'valid_to' || name === 'valid_from') ? null : value,
    }));

    validateField(name, value);
  };

  const handleSubmit = () => {
    const fieldsToValidate = ['location_id', 'energy_resource_type_id', 'price', 'valid_from', 'valid_to'];
    const errors = {};
    let hasError = false;

    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    const payload = { ...formData };
    if (!payload.valid_to) {
      delete payload.valid_to;
    }
    try {
      onSubmit(payload);
    } catch (err) {}
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
        <IconButton onClick={handleClose} size="small">
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
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            mt: 1,
            mb: 2,
            '& .MuiInputBase-input': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
          }}
          error={!!formErrors.location_id}
          helperText={formErrors.location_id || ' '}
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
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            mb: 2,
            '& .MuiInputBase-input': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
          }}
          error={!!formErrors.energy_resource_type_id}
          helperText={formErrors.energy_resource_type_id || ' '}
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
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            mb: 2,
            '& .MuiInputBase-input': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
          }}
          error={!!formErrors.price}
          helperText={formErrors.price || ' '}
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
          sx={{
            order: isMobile ? 1 : 0,
          }}
        >
          Скасувати
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth={isMobile}
          sx={{
            order: isMobile ? 0 : 1,
            marginLeft: '0 !important',
          }}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TariffForm;

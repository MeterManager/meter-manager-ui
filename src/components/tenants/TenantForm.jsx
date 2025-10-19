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
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';

const TenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants, locations = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      const initialFormData = {
        name: initialData.name || '',
        contactPerson: initialData.contactPerson || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
      };
      setFormData(initialFormData);
      validateForm(initialFormData);
    } else {
      setFormData({});
      setFormErrors({});
    }
  }, [open, initialData]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\+380[0-9]{9}$/;
    return phone ? phoneRegex.test(phone) : true;
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value) {
        error = "Назва орендаря обов'язкова.";
      } else if (tenants.some((t) => t.name.trim() === value.trim() && t.id !== initialData.id)) {
        error = 'Орендар з такою назвою вже існує.';
      }
    }
    if (name === 'occupiedArea' && value && parseFloat(value) < 0) {
      error = "Площа не може бути від'ємною.";
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Невірний формат email.';
    }
    if (name === 'phone' && value && !validatePhone(value)) {
      error = 'Номер телефону має бути у форматі +380xxxxxxxxx (лише цифри)';
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, newValue);
  };


  const validateForm = () => {
    const errors = {};
    if (!data.name) errors.name = "Назва орендаря обов'язкова.";
    if (!data.locationId) errors.locationId = "Локація обов'язкова.";
    if (tenants.some((t) => t.name.trim() === data.name.trim() && t.id !== initialData.id)) {
   

    if (tenants.some((t) => t.name.trim() === formData.name.trim() && t.id !== initialData.id)) {
      errors.name = 'Орендар з такою назвою вже існує.';
    }
    if (data.occupiedArea && parseFloat(data.occupiedArea) < 0) {
      errors.occupiedArea = "Площа не може бути від'ємною.";
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Невірний формат email.';
    }
    if (data.phone && !validatePhone(data.phone)) {
      errors.phone = 'Номер телефону має бути у форматі +380xxxxxxxxx (лише цифри)';
    }
    setFormErrors(errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Обмежуємо введення телефону лише цифрами та символом +
    if (name === 'phone') {
      const cleanedValue = value.replace(/[^0-9+]/g, '');
      setFormData({ ...formData, [name]: cleanedValue });
      validateField(name, cleanedValue);
    } else {
      setFormData({ ...formData, [name]: value });
      validateField(name, value);
    }
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : isMobileOrTablet ? '90%' : '500px',
          maxWidth: isMobile ? '100%' : '500px',
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
        {initialData.id ? 'Редагувати орендаря' : 'Додати орендаря'}
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
          name="name"
          label="Назва орендаря"
          value={formData.name || ''}
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
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
        />


        <TextField
          name="contactPerson"
          label="Контактна особа"
          value={formData.contactPerson || ''}
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
          helperText={formErrors.contactPerson || ' '}
        />

        <TextField
          name="phone"
          label="Телефон"
          value={formData.phone || ''}
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
          error={!!formErrors.phone}
          helperText={formErrors.phone || 'Формат: +380xxxxxxxxx'}
          inputProps={{ pattern: '[+0-9]*' }}
        />

        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '1rem' : '1rem',
            },
          }}
          error={!!formErrors.email}
          helperText={formErrors.email || ' '}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
          sx={{
            order: isMobile ? 0 : 1,
            marginLeft: '0 !important',
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
}

export default TenantForm;

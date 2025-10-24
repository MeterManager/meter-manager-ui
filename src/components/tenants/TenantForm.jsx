import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
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
      setFormData({
        name: initialData.name || '',
        contactPerson: initialData.contactPerson || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
      });
      setFormErrors({});
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
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Невірний формат email.';
    }
    if (name === 'phone' && value && !/^\+380[0-9]{9}$/.test(value)) {
      error = 'Номер телефону має бути у форматі +380xxxxxxxxx';
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    const fieldsToValidate = ['name', 'phone', 'email'];
    const errors = {};
    let hasError = false;

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        isActive: formData.isActive ?? true,
      });
      setFormData({});
      onClose(); 
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          helperText={formErrors.phone || ' '}
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

export default TenantForm;

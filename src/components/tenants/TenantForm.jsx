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

const TenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        contactPerson: initialData.contact_person || initialData.contactPerson || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
      });
      setFormErrors({});
    } else {
      // Скидання стану при закритті
      setFormData({});
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let errorMsg = '';
    const trimmedValue = typeof value === 'string' ? value.trim() : value;

    if (name === 'name') {
      if (!trimmedValue) {
        errorMsg = "Назва орендаря обов'язкова.";
      } else if (tenants.some((t) => t.name.trim() === trimmedValue && t.id !== initialData.id)) {
        errorMsg = 'Орендар з такою назвою вже існує.';
      }
    }
    if (name === 'email' && trimmedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      errorMsg = 'Невірний формат email.';
    }
    if (name === 'phone' && trimmedValue && !trimmedValue.match(/^\+380[0-9]{9}$/)) {
      errorMsg = 'Номер телефону має бути у форматі +380xxxxxxxxx';
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    validateField(name, value);
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
        name: formData.name.trim(),
        contact_person: formData.contactPerson?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        isActive: formData.isActive ?? true,
        id: formData.id,
      });
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
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
          width: '100%',
          maxWidth: '500px',
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
        <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
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
          sx={{ mt: 1, mb: 2 }}
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
          disabled={isSubmitting}
        />

        <TextField
          name="contactPerson"
          label="Контактна особа"
          value={formData.contactPerson || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size={isMobile ? 'medium' : 'medium'}
          sx={{ mb: 2 }}
          helperText={formErrors.contactPerson || ' '}
          disabled={isSubmitting}
        />

        <TextField
          name="phone"
          label="Телефон"
          value={formData.phone || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size={isMobile ? 'medium' : 'medium'}
          sx={{ mb: 2 }}
          error={!!formErrors.phone}
          helperText={formErrors.phone || 'У форматі +380xxxxxxxxx'}
          inputProps={{ pattern: '[+0-9]*' }}
          disabled={isSubmitting}
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
          error={!!formErrors.email}
          helperText={formErrors.email || ' '}
          disabled={isSubmitting}
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
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantForm;

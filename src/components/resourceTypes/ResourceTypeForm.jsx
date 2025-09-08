import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';

const ResourceTypeForm = ({ open, onClose, onSubmit, initialData = {}, error, resourceTypes = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        error = "Тип ресурсу обов'язковий.";
      } else if (resourceTypes.some((t) => t.name.trim() === value.trim() && t.id !== initialData.id)) {
        error = 'Тип ресурсу з такою назвою вже існує.';
      }
    }
    if (name === 'unit' && !value) {
      error = "Одиниці вимірювання обов'язкові.";
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
    if (!formData.name) errors.name = "Тип ресурсу обов'язковий.";
    else if (resourceTypes.some((t) => t.name.trim() === formData.name.trim() && t.id !== initialData.id)) {
      errors.name = 'Тип ресурсу з такою назвою вже існує.';
    }
    if (!formData.unit) errors.unit = "Одиниці вимірювання обов'язкові.";
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
        }}
      >
        {initialData.id ? 'Редагувати тип ресурсу' : 'Додати тип ресурсу'}
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
          label="Тип ресурсу"
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
          name="unit"
          label="Одиниці вимірювання"
          value={formData.unit || ''}
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
          error={!!formErrors.unit}
          helperText={formErrors.unit || ' '}
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

export default ResourceTypeForm;

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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';

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
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  const validateField = (name, value) => {
    let error = '';
    if (name === 'serial_number' && !value) {
      error = "Серійний номер обов'язковий.";
    }
    if (name === 'location_id' && !value) {
      error = "Локація обов'язкова.";
    }
    if (name === 'energy_resource_type_id' && !value) {
      error = "Тип ресурсу обов'язковий.";
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
    if (!formData.serial_number) {
      errors.serial_number = "Серійний номер обов'язковий.";
    } else if (Array.isArray(meters) && !loading) {
      if (meters.some((m) => m.serial_number === formData.serial_number && m.id !== initialData.id)) {
        errors.serial_number = 'Лічільник з таким серійним номером вже існує.';
      }
    }
    if (!formData.location_id) errors.location_id = "Локація обов'язкова.";
    if (!formData.energy_resource_type_id) errors.energy_resource_type_id = "Тип ресурсу обов'язковий.";
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
        {initialData.id ? 'Редагувати лічильник' : 'Додати лічильник'}
      </DialogTitle>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          pb: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
              name="serial_number"
              label="Серійний номер"
              value={formData.serial_number || ''}
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
          disabled={loading}
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

export default MeterForm;

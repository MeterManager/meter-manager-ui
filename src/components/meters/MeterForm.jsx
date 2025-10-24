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
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import { Close } from '@mui/icons-material';

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

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        serial_number: initialData.serial_number || '',
        location_id: initialData.location_id || '',
        energy_resource_type_id: initialData.energy_resource_type_id || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'serial_number') {
      if (!value) {
        errorMsg = "Серійний номер обов'язковий.";
      } else if (Array.isArray(meters) && meters.some((m) => m.serial_number === value && m.id !== formData.id)) {
          errorMsg = 'Лічильник з таким серійним номером вже існує.';
      }
    }
    if (name === 'location_id' && !value) {
      errorMsg = "Локація обов'язкова.";
    }
    if (name === 'energy_resource_type_id' && !value) {
      errorMsg = "Тип ресурсу обов'язковий.";
    }
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'location_id' || name === 'energy_resource_type_id') && value !== '' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    validateField(name, processedValue);
  };

  const handleSubmit = () => {
    const fieldsToValidate = ['serial_number', 'location_id', 'energy_resource_type_id'];
    const errors = {};
    let hasError = false;

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) {
        errors[field] = errorMsg;
        hasError = true;
      }
    });

    if (hasError) {
      setFormErrors(errors);
      return;
    }
    onSubmit({
      ...formData,
      isActive: formData.isActive ?? false,
    });
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {initialData.id ? 'Редагувати лічильник' : 'Додати лічильник'}
        <IconButton onClick={handleClose} size="small" disabled={loading}>
         <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          pb: 1,
        }}
      >
          <>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : '1rem' }}
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
              size="medium"
              sx={{ mt: 1, mb: 2 }}
              error={!!formErrors.serial_number}
              helperText={formErrors.serial_number || ' '}
              disabled={loading}
            />

            <TextField
              select
              name="location_id"
              label="Локація"
              value={formData.location_id || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={{ mb: 2 }}
              error={!!formErrors.location_id}
              helperText={formErrors.location_id || ' '}
              disabled={loading}
            >
              {(locations || [])
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
              size="medium"
              sx={{ mb: 2 }}
              error={!!formErrors.energy_resource_type_id}
              helperText={formErrors.energy_resource_type_id || ' '}
              disabled={loading}
            >
              {(energyResourceTypes || [])
                .filter((rt) => rt.isActive)
                .map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name} ({rt.unit})
                  </MenuItem>
                ))}
            </TextField>
          </>

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
          disabled={loading}
        >
          Скасувати
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 0 : 1, marginLeft: '0 !important' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeterForm;

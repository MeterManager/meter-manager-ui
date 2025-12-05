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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const LocationForm = ({ open, onClose, onSubmit, initialData = {}, error, locations = [], tenants = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        isActive: initialData.isActive ?? true,
        id: initialData.id,
        tenant_id: initialData.tenant ? initialData.tenant.id : (initialData.tenant_id ?? null),
        occupied_area: initialData.occupied_area ?? '',
      });
      setFormErrors({});
    } else {
      setFormData({});
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) {
          error = "Назва обов'язкова.";
        } else if (locations.some((loc) => loc.name.trim() === value.trim() && loc.id !== initialData.id)) {
          error = 'Локація з такою назвою вже існує.';
        }
        break;
      case 'address':
        if (!value) {
          error = "Адреса обов'язкова.";
        }
        break;
      case 'occupied_area':
        const numValue = value ? parseFloat(String(value).trim()) : null;

        if (value && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
          error = 'Має бути числом від 0 до 100.';
        }
        break;
      default:
        break;
    }
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    validateField(name, value);
  };

  const handleTenantChange = (e) => {
    const value = e.target.value;
    setFormData((s) => ({ ...s, tenant_id: value }));
  };

  const handleSubmit = () => {
    const fieldsToValidate = ['name', 'address', 'occupied_area'];
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

    onSubmit({
      ...formData,
      isActive: formData.isActive,
      tenant_id: formData.tenant_id === '' ? null : formData.tenant_id,
      occupied_area: formData.occupied_area ? parseFloat(String(formData.occupied_area).trim()) : null,
      tenantName:
        formData.tenant_id === null ? null : tenants.find((t) => t.id === formData.tenant_id)?.name || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        {initialData.id ? 'Редагувати локацію' : 'Додати локацію'}
        <IconButton onClick={onClose} size="small">
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
          name="name"
          label="Назва"
          value={formData.name || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size={isMobile ? 'medium' : 'medium'}
          sx={{ mt: 1, mb: 2 }}
          error={!!formErrors.name}
          helperText={formErrors.name || ' '}
        />

        <TextField
          name="address"
          label="Адреса"
          value={formData.address || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size={isMobile ? 'medium' : 'medium'}
          multiline={!isMobile}
          rows={isMobile ? 1 : 2}
          sx={{ mb: 2 }}
          error={!!formErrors.address}
          helperText={formErrors.address || ' '}
        />
        <TextField
          name="occupied_area"
          label="Відсоток зайнятої площі (%)"
          type="number"
          value={formData.occupied_area || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          helperText={formErrors.occupied_area || ' '}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="tenant-select-label">Орендар</InputLabel>
          <Select
            labelId="tenant-select-label"
            value={formData.tenant_id ?? ''}
            label="Орендар"
            onChange={handleTenantChange}
            name="tenant_id"
          >
            <MenuItem value="">— Вільна —</MenuItem>
            {tenants.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2,
          gap: isMobile ? 1 : 1,
          flexDirection: isMobile ? 'column-reverse' : 'row',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
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

export default LocationForm;

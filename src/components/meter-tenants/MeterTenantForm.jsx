import { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';
import { Close } from '@mui/icons-material';

const MeterTenantForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  error,
  tenants = [],
  meters = [],
  locations = [],
  resourceTypes = [],
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const resourceTypeMap = useMemo(
    () =>
      resourceTypes.reduce((acc, rt) => {
        acc[rt.id] = rt.name;
        return acc;
      }, {}),
    [resourceTypes]
  );

  useEffect(() => {
    if (open) {
      const initialMeter = meters.find((m) => m.id.toString() === (initialData.meterId || ''));
      const initialLocation = initialMeter?.location_id || '';

      setFormData({
        tenantId: initialData.tenantId || '',
        meterId: initialData.meterId || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || null,
        id: initialData.id,
      });
      setSelectedLocationId(initialLocation);
      setFormErrors({});
    } else {
      setSelectedLocationId('');
    }
  }, [open, initialData, meters]);

  const validateField = (name, value, currentFormData) => {
    let errorMsg = '';
    if (name === 'tenantId' && !value) errorMsg = "Орендар обов'язковий.";
    if (name === 'meterId' && !value) errorMsg = "Лічильник обов'язковий.";
    if (name === 'startDate' && !value) errorMsg = "Дата початку обов'язкова.";

    const startDate = name === 'startDate' ? value : currentFormData.startDate;
    const endDate = name === 'endDate' ? value : currentFormData.endDate;

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      if (name === 'endDate') errorMsg = 'Дата завершення не може бути раніше дати початку.';
      else if (name === 'startDate')
        setFormErrors((prev) => ({ ...prev, endDate: 'Дата завершення не може бути раніше дати початку.' }));
    } else {
      if (name === 'endDate' && formErrors.startDate?.includes('пізніше'))
        setFormErrors((prev) => ({ ...prev, startDate: '' }));
      if (name === 'startDate' && formErrors.endDate?.includes('раніше'))
        setFormErrors((prev) => ({ ...prev, endDate: '' }));
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg;
  };

  const handleLocationChange = (e) => {
    const newLocationId = e.target.value === '' ? '' : Number(e.target.value);
    setSelectedLocationId(newLocationId);
    setFormData((prev) => ({ ...prev, meterId: '' }));
    setFormErrors((prev) => ({ ...prev, meterId: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue =
      (name === 'endDate' || name === 'startDate') && value === ''
        ? null
        : (name === 'tenantId' || name === 'meterId') && value !== ''
          ? Number(value)
          : value;

    const updatedFormData = { ...formData, [name]: processedValue };
    setFormData(updatedFormData);
    validateField(name, processedValue, updatedFormData);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.tenantId) errors.tenantId = "Орендар обов'язковий.";
    if (!selectedLocationId) errors.locationId = 'Спочатку виберіть локацію.';
    if (!formData.meterId) errors.meterId = "Лічильник обов'язковий.";
    if (!formData.startDate) errors.startDate = "Дата початку обов'язкова.";

    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'Дата завершення не може бути раніше дати початку.';
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const apiData = {
      tenant_id: formData.tenantId,
      meter_id: formData.meterId,
      assigned_from: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      assigned_to: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      id: formData.id,
    };

    onSubmit(apiData);
  };

  const handleClose = () => {
    setFormErrors({});
    setSelectedLocationId('');
    onClose();
  };

  const availableMeters = useMemo(() => {
    if (!selectedLocationId) return [];
    return meters.filter((m) => m.location_id === selectedLocationId && m.isActive);
  }, [selectedLocationId, meters]);

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
        {formData.id ? 'Редагувати призначення' : 'Додати призначення'}
        <IconButton onClick={handleClose} size="small" disabled={isLoading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 2 : 3, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          name="locationId"
          label="Локація (для фільтру лічильників)"
          value={selectedLocationId || ''}
          onChange={handleLocationChange}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{ mt: 1, mb: 2 }}
          error={!!formErrors.locationId}
          helperText={formErrors.locationId || ' '}
          disabled={isLoading}
        >
          <MenuItem value="">
            <em>-- Виберіть локацію --</em>
          </MenuItem>
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id.toString()}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="meterId"
          label="Лічильник"
          value={formData.meterId || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{ mb: 2 }}
          error={!!formErrors.meterId}
          helperText={formErrors.meterId || ' '}
          disabled={isLoading || !selectedLocationId}
        >
          {!selectedLocationId ? (
            <MenuItem disabled value="">
              Спочатку виберіть локацію
            </MenuItem>
          ) : availableMeters.length === 0 ? (
            <MenuItem disabled value="">
              Немає доступних лічильників для цієї локації
            </MenuItem>
          ) : (
            availableMeters.map((m) => (
              <MenuItem key={m.id} value={m.id.toString()}>
                {`${m.serial_number || `ID:${m.id}`} - ${resourceTypeMap[m.energy_resource_type_id] || 'Невідомий тип'}`}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          name="tenantId"
          label="Орендар"
          value={formData.tenantId || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{ mb: 2 }}
          error={!!formErrors.tenantId}
          helperText={formErrors.tenantId || ' '}
          disabled={isLoading}
        >
          {tenants.map((t) => (
            <MenuItem key={t.id} value={t.id.toString()}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>

        <CustomDatePicker
          value={formData.startDate || null}
          onChange={(newValue) => {
            handleChange({ target: { name: 'startDate', value: newValue } });
          }}
          label="Дата початку"
          maxDate={formData.endDate || undefined}
          error={!!formErrors.startDate}
          helperText={formErrors.startDate || ' '}
          sx={{ mb: 2 }}
          disabled={isLoading}
          slotProps={{ textField: { size: 'medium', fullWidth: true } }}
        />

        <CustomDatePicker
          value={formData.endDate || null}
          onChange={(newValue) => {
            handleChange({ target: { name: 'endDate', value: newValue } });
          }}
          label="Дата завершення (необов'язково)"
          minDate={formData.startDate || undefined}
          error={!!formErrors.endDate}
          helperText={formErrors.endDate || 'Залиште порожнім, якщо безстроково'}
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

export default MeterTenantForm;

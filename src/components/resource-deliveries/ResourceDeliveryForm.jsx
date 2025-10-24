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
  Box,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';

const ResourceDeliveryForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  locations = [],
  resourceTypes = [],
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      const mappedData = {
        locationId: initialData.location_id || initialData.locationId || '',
        resourceTypeId: initialData.energy_resource_type_id || initialData.resourceTypeId || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || '',
        pricePerUnit: initialData.price_per_unit || initialData.pricePerUnit || '',
        deliveryDate:
          initialData.delivery_date || initialData.deliveryDate
            ? new Date(initialData.delivery_date || initialData.deliveryDate).toISOString().split('T')[0]
            : '',
        supplier: initialData.supplier || '',
      };
      setFormData(mappedData);
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'locationId' && !value) error = 'Виберіть локацію.';
    if (name === 'resourceTypeId' && !value) error = 'Виберіть тип ресурсу.';
    if (name === 'quantity' && (!value || isNaN(value) || parseFloat(value) < 0))
      error = 'Вкажіть кількість (додатнє число).';
    if (name === 'unit' && !value) error = 'Вкажіть одиницю виміру.';
    if (name === 'pricePerUnit' && (!value || isNaN(value) || parseFloat(value) < 0))
      error = 'Вкажіть ціну за одиницю (додатнє число).';
    if (name === 'deliveryDate' && !value) error = 'Вкажіть дату.';

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'locationId' || name === 'resourceTypeId') && value !== '' ? Number(value) : value;
    setFormData({ ...formData, [name]: processedValue });
    validateField(name, processedValue);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.locationId) errors.locationId = 'Виберіть локацію.';
    if (!formData.resourceTypeId) errors.resourceTypeId = 'Виберіть тип ресурсу.';
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) < 0)
      errors.quantity = 'Вкажіть кількість.';
    if (!formData.unit) errors.unit = 'Вкажіть одиницю виміру.';
    if (!formData.pricePerUnit || isNaN(formData.pricePerUnit) || parseFloat(formData.pricePerUnit) < 0)
      errors.pricePerUnit = 'Вкажіть ціну за одиницю.';
    if (!formData.deliveryDate) errors.deliveryDate = 'Вкажіть дату.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const submitData = {
      locationId: Number(formData.locationId),
      resourceTypeId: Number(formData.resourceTypeId),
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      totalCost: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit),
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
      supplier: formData.supplier || '',
    };

    try {
      await onSubmit(submitData);
      handleClose();
    } catch (err) {
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
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box component="span">
          {initialData.id ? 'Редагувати поставку ресурсу' : 'Додати поставку ресурсу'}
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            ml: 1,
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
          disabled={isLoading}
        >
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
          name="locationId"
          label="Локація"
          value={formData.locationId || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mt: 1, mb: 2 }}
          error={!!formErrors.locationId}
          helperText={formErrors.locationId || ' '}
          disabled={isLoading}
        >
          {locations.length === 0 ? (
            <MenuItem disabled>Немає доступних локацій</MenuItem>
          ) : (
            locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          name="resourceTypeId"
          label="Тип ресурсу"
          value={formData.resourceTypeId || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!formErrors.resourceTypeId}
          helperText={formErrors.resourceTypeId || ' '}
          disabled={isLoading}
        >
          {resourceTypes.length === 0 ? (
            <MenuItem disabled>Немає доступних типів ресурсів</MenuItem>
          ) : (
            resourceTypes.map((res) => (
              <MenuItem key={res.id} value={res.id}>
                {res.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          name="quantity"
          label="Кількість"
          type="number"
          value={formData.quantity || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!formErrors.quantity}
          helperText={formErrors.quantity || ' '}
          inputProps={{ min: 0, step: 0.01 }}
          disabled={isLoading}
        />

        <TextField
          name="unit"
          label="Одиниця виміру"
          value={formData.unit || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!formErrors.unit}
          helperText={formErrors.unit || ' '}
          disabled={isLoading}
        />

        <TextField
          name="pricePerUnit"
          label="Ціна за одиницю"
          type="number"
          value={formData.pricePerUnit || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!formErrors.pricePerUnit}
          helperText={formErrors.pricePerUnit || ' '}
          inputProps={{ min: 0, step: 0.01 }}
          disabled={isLoading}
        />

        <CustomDatePicker
          value={formData.deliveryDate || null}
          onChange={(newValue) => {
            handleChange({
              target: { name: 'deliveryDate', value: newValue },
            });
          }}
          label="Дата доставки"
          error={!!formErrors.deliveryDate}
          helperText={formErrors.deliveryDate || ' '}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />

        <TextField
          name="supplier"
          label="Постачальник"
          value={formData.supplier || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          helperText=" "
          disabled={isLoading}
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
          disabled={isLoading}
        >
          Скасувати
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth={isMobile}
          sx={{ marginLeft: '0 !important' }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceDeliveryForm;

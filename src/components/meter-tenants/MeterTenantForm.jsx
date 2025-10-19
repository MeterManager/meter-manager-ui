import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import CustomDatePicker from '../ui/DatePicker';


const MeterTenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants = [], meters = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    tenantId: '',
    meterId: '',
    startDate: '',
    endDate: '',
    id: undefined,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        tenantId: initialData.tenantId || '',
        meterId: initialData.meterId || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'tenantId' && !value) error = "Орендар обов'язковий.";
    if (name === 'meterId' && !value) error = "Лічильник обов'язковий.";
    if (name === 'startDate' && !value) error = "Дата початку обов'язкова.";

    if (name === 'endDate' && value && formData.startDate && new Date(value) < new Date(formData.startDate)) {
      error = 'Дата завершення не може бути раніше дати початку.';
    } else if (name === 'startDate' && value && formData.endDate && new Date(value) > new Date(formData.endDate)) {
      error = 'Дата початку не може бути пізніше дати завершення.';
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
    if (!formData.tenantId) errors.tenantId = "Орендар обов'язковий.";
    if (!formData.meterId) errors.meterId = "Лічильник обов'язковий.";
    if (!formData.startDate) errors.startDate = "Дата початку обов'язкова.";

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
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

    onSubmit({
      tenant_id: parseInt(formData.tenantId),
      meter_id: parseInt(formData.meterId),
      assigned_from: formData.startDate || null,
      assigned_to: formData.endDate || null,
      id: formData.id,
    });

    if (!formData.id) {
      setFormData({
        tenantId: '',
        meterId: '',
        startDate: '',
        endDate: '',
        id: undefined,
      });
    }
  };

  const handleClose = () => {
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
        {formData.id ? "Редагувати зв'язок лічильник-орендар" : "Додати зв'язок лічильник-орендар"}
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
          name="tenantId"
          label="Орендар"
          value={formData.tenantId || ''}
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
          error={!!formErrors.tenantId}
          helperText={formErrors.tenantId || ' '}
        >
          {tenants.map((t) => (
            <MenuItem key={t.id} value={t.id.toString()}>
              {t.name}
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
          error={!!formErrors.meterId}
          helperText={formErrors.meterId || ' '}
        >
          {meters.map((m) => (
            <MenuItem key={m.id} value={m.id.toString()}>
              {m.serial_number || `ID:${m.id}`}
            </MenuItem>
          ))}
        </TextField>

        <CustomDatePicker
          value={formData.startDate || null}
          onChange={(newValue) => {
            handleChange({
              target: { name: 'startDate', value: newValue },
            });
          }}
          label="Дата початку"
          maxDate={formData.endDate || undefined}
          error={!!formErrors.startDate}
          helperText={formErrors.startDate || ' '}
          sx={{ mb: 2 }}
        />

        <CustomDatePicker
          value={formData.endDate || null}
          onChange={(newValue) => {
            handleChange({
              target: { name: 'endDate', value: newValue },
            });
          }}
          label="Дата завершення"
          minDate={formData.startDate || undefined}
          error={!!formErrors.endDate}
          helperText={formErrors.endDate || ' '}
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

export default MeterTenantForm;

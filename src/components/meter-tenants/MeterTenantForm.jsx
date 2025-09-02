import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem } from '@mui/material';

const MeterTenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants = [], meters = [] }) => {
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
      error = "Дата завершення не може бути раніше дати початку.";
    } else if (name === 'startDate' && value && formData.endDate && new Date(value) > new Date(formData.endDate)) {
        error = "Дата початку не може бути пізніше дати завершення.";
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
      errors.endDate = "Дата завершення не може бути раніше дати початку.";
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {formData.id ? 'Редагувати зв’язок лічильник-орендар' : 'Додати зв’язок лічильник-орендар'}
      </DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          name="tenantId"
          label="Орендар"
          value={formData.tenantId}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
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
          value={formData.meterId}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.meterId}
          helperText={formErrors.meterId || ' '}
        >
          {meters.map((m) => (
            <MenuItem key={m.id} value={m.id.toString()}>
              {m.serial_number || `ID:${m.id}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="startDate"
          label="Дата початку"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.startDate}
          helperText={formErrors.startDate || ' '}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          name="endDate"
          label="Дата завершення"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.endDate}
          helperText={formErrors.endDate}
          sx={{ mb: 2}}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, mb: 1 }}>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Скасувати
        </Button>
        <Button variant="contained" size="small" onClick={handleSubmit}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeterTenantForm;

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
} from '@mui/material';

const MeterTenantForm = ({ open, onClose, onSubmit, initialData = {}, error, tenants = [], meters = [] }) => {
  const [formData, setFormData] = useState(initialData);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.tenantId) errors.tenantId = "Орендар обов'язковий";
    if (!formData.meterId) errors.meterId = "Лічильник обов'язковий";
    if (!formData.startDate) errors.startDate = "Дата початку обов'язкова";

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
      tenantId: parseInt(formData.tenantId),
      meterId: parseInt(formData.meterId),
    });
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData.id ? 'Редагувати зв’язок лічильник-орендар' : 'Додати зв’язок лічильник-орендар'}</DialogTitle>
      <DialogContent sx={{ mt: 1, pb: 0 }}>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

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
            <MenuItem key={t.id} value={t.id}>
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
          sx={{ mt: 1 }}
          error={!!formErrors.meterId}
          helperText={formErrors.meterId || ' '}
        >
          {meters.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.serialNumber || m.id}
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
          sx={{ mt: 1 }}
          error={!!formErrors.startDate}
          helperText={formErrors.startDate || ' '}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          name="endDate"
          label="Дата завершення"
          type="date"
          value={formData.endDate || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mt: 1 }}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, mb: 1 }}>
        <Button variant="outlined" size="small" onClick={handleClose}>Скасувати</Button>
        <Button variant="contained" size="small" onClick={handleSubmit}>Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeterTenantForm;

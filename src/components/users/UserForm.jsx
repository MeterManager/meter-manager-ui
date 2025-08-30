import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem } from '@mui/material';

const roles = ['admin', 'manager', 'user'];

const UserForm = ({ open, onClose, onSubmit, initialData = {}, error }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        full_name: initialData.full_name,
        role: initialData.role,
        auth0_user_id: initialData.auth0_user_id,
        isActive: initialData.isActive,
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
    if (!formData.full_name) errors.full_name = 'Ім’я обов’язкове';
    if (!formData.auth0_user_id) errors.auth0_user_id = 'Auth0 ID обов’язкове';
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
      isActive: formData.isActive,
    });
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Редагувати користувача</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          name="full_name"
          label="ПІБ"
          value={formData.full_name || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 1, mt: 1 }}
          error={!!formErrors.full_name}
          helperText={formErrors.full_name || ' '}
        />
        <TextField
          name="auth0_user_id"
          label="Auth0 ID"
          value={formData.auth0_user_id || ''}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 1 }}
          error={!!formErrors.auth0_user_id}
          helperText={formErrors.auth0_user_id || ' '}
        />
        <TextField
          select
          name="role"
          label="Роль"
          value={formData.role || 'user'}
          onChange={handleChange}
          fullWidth
        >
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
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

export default UserForm;


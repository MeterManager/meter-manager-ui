import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  MenuItem,
} from "@mui/material";

const TariffForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  error,
  locations,
  resourceTypes,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        location_id: initialData.location_id || "",
        energy_resource_type_id: initialData.energy_resource_type_id || "",
        price: initialData.price || "",
        valid_from: initialData.valid_from || "",
        valid_to: initialData.valid_to || "",
        id: initialData.id,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.location_id) errors.location_id = "Локація обов’язкова";
    if (!formData.energy_resource_type_id)
      errors.energy_resource_type_id = "Тип ресурсу обов’язковий";
    if (!formData.price) errors.price = "Ціна обов’язкова";
    if (formData.price && Number(formData.price) <= 0)
      errors.price = "Ціна має бути більшою за 0";
    if (!formData.valid_from) errors.valid_from = "Дата початку обов’язкова";
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit(formData);
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData.id ? "Редагувати тариф" : "Додати тариф"}
      </DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          name="location_id"
          label="Локація"
          value={formData.location_id || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, mt: 1 }}
          error={!!formErrors.location_id}
          helperText={formErrors.location_id || " "}
        >
          {(locations || []).map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="energy_resource_type_id"
          label="Тип ресурсу"
          value={formData.energy_resource_type_id || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!formErrors.energy_resource_type_id}
          helperText={formErrors.energy_resource_type_id || " "}
        >
          {(resourceTypes || []).map((res) => (
            <MenuItem key={res.id} value={res.id}>
              {res.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="price"
          label="Ціна (₴)"
          type="number"
          value={formData.price || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!formErrors.price}
          helperText={formErrors.price || " "}
        />

        <TextField
          name="valid_from"
          label="Діє з"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.valid_from || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!formErrors.valid_from}
          helperText={formErrors.valid_from || " "}
        />

        <TextField
          name="valid_to"
          label="Діє до"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.valid_to || ""}
          onChange={handleChange}
          fullWidth
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

export default TariffForm;

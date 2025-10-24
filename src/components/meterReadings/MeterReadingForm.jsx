import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '../../hooks/useMediaQuery';
import { createMeterReading, updateMeterReading } from '../../api/meterReadings';
import { useAuthContext } from '../../contexts/AuthContext';
import { useMeterTenants } from '../../hooks/useMeterTenants';
import CustomDatePicker from '../ui/DatePicker';

const MeterReadingForm = ({ onSuccess, initialData, onCancel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { getToken, loginWithRedirect, user } = useAuthContext();
  const { getAllMeterTenants } = useMeterTenants();

  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedResource, setSelectedResource] = useState('');

  const [formData, setFormData] = useState({
    meter_tenant_id: '',
    reading_date: '',
    area_based_consumption: '',
    calculation_method: '',
    executor_name: '',
    tenant_representative: '',
    calculation_coefficient: 1,
    distributions: {
      CA: { current_reading: '', previous_reading: '', area_percentage: 100 },
      CP: { current_reading: '', previous_reading: '', area_percentage: 100 },
      GR: { current_reading: '', previous_reading: '', area_percentage: 100 },
    },
  });

  const [allMeterTenants, setAllMeterTenants] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setError('Не вдалося отримати токен, увійдіть знову.');
          setLoadingTenants(false);
          return;
        }
        const list = await getAllMeterTenants(token);
        const mts = list?.data || list;
        setAllMeterTenants(mts);

        const uniqueLocationsMap = mts.reduce((map, mt) => {
          const location = mt.Meter?.Location;
          if (location && !map.has(location.id)) {
            map.set(location.id, {
              id: location.id,
              name: `${location.name} - ${location.address}`,
            });
          }
          return map;
        }, new Map());

        setAvailableLocations(Array.from(uniqueLocationsMap.values()));
        setLoadingTenants(false);
      } catch (e) {
        console.error('Error loading meter tenants:', e);
        setError('Помилка при завантаженні списку лічильників');
        setLoadingTenants(false);
      }
    })();
  }, [getToken, getAllMeterTenants]);

  useEffect(() => {
    if (initialData) {
      const initialMt = allMeterTenants.find((mt) => mt.id === initialData.meter_tenant_id);
      if (initialMt?.Meter?.Location) {
        setSelectedLocationId(initialMt.Meter.Location.id);
        setSelectedResource(initialMt.Meter.EnergyResourceType?.name || '');
      }

      const loadedDistributions = {
        CA: { current_reading: '', previous_reading: '', area_percentage: 100 },
        CP: { current_reading: '', previous_reading: '', area_percentage: 100 },
        GR: { current_reading: '', previous_reading: '', area_percentage: 100 },
      };

      if (initialData.distributions && Array.isArray(initialData.distributions)) {
        initialData.distributions.forEach((dist) => {
          if (loadedDistributions[dist.category]) {
            loadedDistributions[dist.category] = {
              current_reading: dist.current_reading || '',
              previous_reading: dist.previous_reading || '',
              area_percentage: dist.area_percentage || 100,
            };
          }
        });
      }

      setFormData({
        meter_tenant_id: initialData.meter_tenant_id,
        reading_date: initialData.reading_date,
        area_based_consumption: initialData.area_based_consumption || '',
        calculation_method: initialData.calculation_method || '',
        executor_name: initialData.executor_name || '',
        tenant_representative: initialData.tenant_representative || '',
        calculation_coefficient: initialData.calculation_coefficient || 1,
        distributions: loadedDistributions,
      });
    }
  }, [initialData, allMeterTenants]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'selectedLocationId') {
      const newLocationId = value === '' ? '' : Number(value);
      setSelectedLocationId(newLocationId);
      setFormData((prev) => ({ ...prev, meter_tenant_id: '' }));
      setSelectedResource('');
      return;
    }
    if (name === 'meter_tenant_id' && value !== '') {
      const mtId = Number(value);
      const mt = allMeterTenants.find((t) => t.id === mtId);
      if (mt?.Meter?.EnergyResourceType) {
        const type = mt.Meter.EnergyResourceType;
        setSelectedResource(`${type.name}`);
      } else {
        setSelectedResource('');
      }
      value = mtId;
    } else if (name === 'meter_tenant_id' && value === '') {
      setSelectedResource('');
      value = '';
    }
    if (name === 'calculation_coefficient') {
      value = Number(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistributionChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      distributions: {
        ...prev.distributions,
        [category]: {
          ...prev.distributions[category],
          [field]: value === '' ? '' : Number(value),
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = await getToken();
    if (!token) {
      setError('Токен відсутній. Будь ласка, увійдіть знову.');
      loginWithRedirect();
      return;
    }

    if (!formData.meter_tenant_id || !formData.reading_date || !formData.calculation_method) {
      setError("Будь ласка, заповніть всі обов'язкові поля.");
      return;
    }

    const hasDistributions = ['CA', 'CP', 'GR'].some((cat) => formData.distributions[cat].current_reading !== '');
    if (!hasDistributions) {
      setError('Будь ласка, заповніть хоча б одну підкатегорію (CA, CP або GR).');
      return;
    }

    try {
      setLoading(true);

      const distributionsArray = [];
      let totalCurrentReading = 0;

      ['CA', 'CP', 'GR'].forEach((category) => {
        const dist = formData.distributions[category];
        if (dist.current_reading !== '' || dist.previous_reading !== '') {
          const currentVal = Number(dist.current_reading) || 0;
          totalCurrentReading += currentVal;

          distributionsArray.push({
            category,
            current_reading: currentVal,
            previous_reading: dist.previous_reading || 0,
            calculation_coefficient: formData.calculation_coefficient || 1,
            area_percentage: dist.area_percentage || 100,
          });
        }
      });

      const payload = {
        meter_tenant_id: Number(formData.meter_tenant_id),
        reading_date: formData.reading_date,
        current_reading: totalCurrentReading,
        calculation_method: formData.calculation_method,
        area_based_consumption:
          formData.area_based_consumption !== '' ? Number(formData.area_based_consumption) : undefined,
        calculation_coefficient: formData.calculation_coefficient || 1,
        executor_name: formData.executor_name || null,
        tenant_representative: formData.tenant_representative || null,
        created_by: user?.id,
        distributions: distributionsArray,
      };

      let response;
      if (initialData?.id) {
        response = await updateMeterReading(token, initialData.id, payload);
      } else {
        response = await createMeterReading(token, payload);
      }

      onSuccess?.(response);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Не вдалося зберегти показники.');
    } finally {
      setLoading(false);
    }
  };

  const selectLabelId = 'meter-tenant-select-label';

  const categoryLabels = {
    CA: 'СА (Споживання активної)',
    CP: 'СР (Споживання реактивної)',
    GR: 'ГР (Генерація реактивної)',
  };

  return (
    <Paper
      sx={{
        p: isMobile ? 2 : 3,
        maxWidth: isMobile ? '100%' : isTablet ? '90%' : 800,
        mx: 'auto',
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontSize: isMobile ? '1.125rem' : '1.25rem',
          fontWeight: 600,
          mb: isMobile ? 2 : 3,
        }}
      >
        Форма подачі показників
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2, fontSize: isMobile ? '0.9rem' : '1rem' }}>
          {error}
        </Typography>
      )}

      {loadingTenants ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel id="location-select-label">Локація</InputLabel>
            <Select
              labelId="location-select-label"
              label="Локація"
              name="selectedLocationId"
              value={selectedLocationId}
              onChange={handleChange}
            >
              <MenuItem value="">Оберіть локацію</MenuItem>
              {availableLocations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required disabled={!selectedLocationId}>
            <InputLabel id={selectLabelId}>Лічильник (зв'язок з орендарем)</InputLabel>
            <Select
              labelId={selectLabelId}
              label="Лічильник (зв'язок з орендарем)"
              name="meter_tenant_id"
              value={formData.meter_tenant_id}
              onChange={handleChange}
            >
              <MenuItem value="">Оберіть зв'язок (Tenant – Meter)</MenuItem>
              {allMeterTenants
                .filter((mt) => mt.Meter?.location_id === selectedLocationId)
                .map((mt) => (
                  <MenuItem key={mt.id} value={mt.id}>
                    {mt.Tenant?.name} – {mt.Meter?.serial_number}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Ресурс"
            value={selectedResource}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ bgcolor: '#f5f5f5' }}
          />

          <CustomDatePicker
            value={formData.reading_date || null}
            onChange={(newValue) => {
              setFormData((prev) => ({
                ...prev,
                reading_date: newValue,
              }));
            }}
            label="Дата показника"
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Метод розрахунку</InputLabel>
            <Select
              label="Метод розрахунку"
              name="calculation_method"
              value={formData.calculation_method}
              onChange={handleChange}
            >
              <MenuItem value="">Оберіть метод</MenuItem>
              <MenuItem value="direct">Пряме зняття</MenuItem>
              <MenuItem value="area_based">За площею</MenuItem>
              <MenuItem value="mixed">Змішаний</MenuItem>
            </Select>
          </FormControl>

          {(formData.calculation_method === 'area_based' || formData.calculation_method === 'mixed') && (
            <TextField
              label="Споживання за площею"
              type="number"
              name="area_based_consumption"
              value={formData.area_based_consumption}
              onChange={handleChange}
              required
            />
          )}

          <TextField
            label="Розрахунковий коефіцієнт (для всіх категорій)"
            type="number"
            name="calculation_coefficient"
            value={formData.calculation_coefficient}
            onChange={handleChange}
            inputProps={{ step: '0.01', min: '0' }}
            required
          />

          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
              Розподіл по підкатегоріях (опціонально)
            </Typography>
          </Divider>

          {['CA', 'CP', 'GR'].map((category) => (
            <Box
              key={category}
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                bgcolor: '#fafafa',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                {categoryLabels[category]}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Поточний показник"
                    type="number"
                    value={formData.distributions[category].current_reading}
                    onChange={(e) => handleDistributionChange(category, 'current_reading', e.target.value)}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Попередній показник"
                    type="number"
                    value={formData.distributions[category].previous_reading}
                    onChange={(e) => handleDistributionChange(category, 'previous_reading', e.target.value)}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <TextField
            label="Ім'я виконавця"
            name="executor_name"
            value={formData.executor_name}
            onChange={handleChange}
          />
          <TextField
            label="Представник орендаря"
            name="tenant_representative"
            value={formData.tenant_representative}
            onChange={handleChange}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              justifyContent: isMobile ? 'stretch' : 'flex-end',
              gap: 1,
              mt: 2,
              '& .MuiButton-root': {
                width: isMobile ? '100%' : 'auto',
                fontSize: isMobile ? '1rem' : '0.875rem',
                height: isMobile ? '44px' : '36px',
              },
            }}
          >
            <Button variant="outlined" onClick={onCancel}>
              Скасувати
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Зберегти'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default MeterReadingForm;

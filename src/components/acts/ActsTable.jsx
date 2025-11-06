import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { useMeterReadings } from '../../hooks/useMeterReadings';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PaymentIcon from '@mui/icons-material/Payment';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { useTheme } from '@mui/material/styles';
import { generateConsumptionAct } from '../../utils/excelGenerator';

const categoryLabels = {
  CA: 'СА',
  CP: 'СР',
  GR: 'ГР',
};

const monthLabels = [
  { value: '01', label: 'Січень' },
  { value: '02', label: 'Лютий' },
  { value: '03', label: 'Березень' },
  { value: '04', label: 'Квітень' },
  { value: '05', label: 'Травень' },
  { value: '06', label: 'Червень' },
  { value: '07', label: 'Липень' },
  { value: '08', label: 'Серпень' },
  { value: '09', label: 'Вересень' },
  { value: '10', label: 'Жовтень' },
  { value: '11', label: 'Листопад' },
  { value: '12', label: 'Грудень' },
];

const getDistributionByCategory = (reading, category) => {
  if (!reading.distributions || !Array.isArray(reading.distributions)) return null;
  return reading.distributions.find((d) => d.category === category);
};

const getMonthFromDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length >= 2) {
    return parts[1];
  }
  return null;
};

const MobileReadingCard = ({ reading, isWater, isGas, theme }) => {
  const distributions = ['CA', 'CP', 'GR']
    .map((cat) => getDistributionByCategory(reading.rawReading, cat))
    .filter(Boolean);

  const rowsToRender =
    distributions.length > 0
      ? distributions
      : [
          {
            category: 'General',
            previous_reading: reading.rawReading.previous_reading,
            current_reading: reading.rawReading.current_reading,
            difference: reading.rawReading.consumption,
            consumed_energy: reading.rawReading.total_consumption,
            cost: reading.rawReading.total_cost,
          },
        ];

  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          № лічильника: <strong>{reading.meterNumber}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {reading.installationPlace}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Тип: {reading.purpose}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Коефіцієнт
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {reading.coefficient}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              % площі
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {reading.locationArea}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        {rowsToRender.map((dist, idx) => (
          <Box key={idx} sx={{ mb: idx < rowsToRender.length - 1 ? 2 : 0 }}>
            {!isWater && !isGas && dist.category !== 'General' && (
              <Chip
                label={categoryLabels[dist.category] || dist.category}
                size="small"
                color="primary"
                sx={{ mb: 1 }}
              />
            )}
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Попередні
                </Typography>
                <Typography variant="body2">{dist.previous_reading || '0.00'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Поточні
                </Typography>
                <Typography variant="body2">{dist.current_reading || '0.00'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Різниця
                </Typography>
                <Typography variant="body2">{dist.difference || '0.00'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Споживання
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {dist.consumed_energy || '0.00'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Вартість (грн)
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {dist.total_cost || dist.cost || '0.00'}
                </Typography>
              </Grid>
            </Grid>
            {idx < rowsToRender.length - 1 && <Divider sx={{ mt: 1.5 }} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

const ActsTable = () => {
  const { meterReadings, loading, error, fetchReadings, getReadingsSummary } = useMeterReadings();
  const [generating, setGenerating] = useState(false);
  const [selectedResource, setSelectedResource] = useState('Електроенергія');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [summary, setSummary] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actOptions, setActOptions] = useState({
    period: new Date().toISOString().split('T')[0],
    organization: 'ТОВ «Про Тек Вікна Україна»',
    executorName: 'Бенько І. Г.',
    executorTitle: 'інж.-енергетик',
    tenantCompany: 'ТОВ «ГалФрост»',
    tenantRepresentative: 'Ситнік І.Ю.',
    address: 'Львівська обл., с. Зимна Вода, вул. Яворівська, 30',
  });

  useEffect(() => {
    fetchReadings();
    getReadingsSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, [fetchReadings, getReadingsSummary, selectedResource]);

  const transformedReadings = useMemo(() => {
    if (!meterReadings) return [];

    return meterReadings.map((reading) => {
      const meterInfo = reading?.MeterTenant?.Meter;
      const locationInfo = meterInfo?.Location;
      const energyInfo = reading?.MeterTenant?.Meter?.EnergyResourceType;

      const prevValue = reading.previous_reading || '0.00';
      const currValue = reading.current_reading || '0.00';
      const difference = reading.consumption || '0.00';
      const coefficient = reading.calculation_coefficient || 'N/A';
      const occupiedArea = parseFloat(reading.location_occupied_area)?.toFixed(2) || '0.00';
      const readingDate = reading.reading_date || reading.act_date || '';

      return {
        id: reading.id,
        rawReading: reading,
        meterNumber: meterInfo?.serial_number || 'N/A',
        installationPlace: locationInfo?.name || 'Невідома локація',
        address: locationInfo?.address || '',
        purpose: energyInfo?.name || 'N/A',
        prevValue: prevValue,
        currValue: currValue,
        difference: difference,
        coefficient: coefficient,
        locationArea: occupiedArea,
        readingDate: readingDate,
      };
    });
  }, [meterReadings]);

  const filteredReadings = useMemo(() => {
    let filtered = transformedReadings;

    if (selectedResource) {
      filtered = filtered.filter((r) => {
        const purpose = (r.purpose || '').toLowerCase();
        const resource = selectedResource.toLowerCase();

        if (resource === 'вода (всі)') {
          return purpose.includes('вода');
        }

        if (resource === 'холодна вода') {
          return purpose.includes('холод');
        }

        if (resource === 'гаряча вода') {
          return purpose.includes('гаряч');
        }

        return purpose === resource;
      });
    }

    if (selectedMonth) {
      filtered = filtered.filter((r) => getMonthFromDate(r.readingDate) === selectedMonth);
    }

    return filtered;
  }, [selectedResource, transformedReadings, selectedMonth]);

  const categorySummary = useMemo(() => {
    if (!filteredReadings.length) return { totalConsumption: 0, totalCost: 0, categories: {} };

    const summaryData = {
      totalConsumption: 0,
      totalCost: 0,
      categories: { CA: 0, CP: 0, GR: 0 },
    };

    filteredReadings.forEach((r) => {
      const distributions = ['CA', 'CP', 'GR']
        .map((cat) => getDistributionByCategory(r.rawReading, cat))
        .filter(Boolean);

      if (distributions.length > 0) {
        distributions.forEach((dist) => {
          const cost = parseFloat(dist.total_cost) || parseFloat(dist.cost) || 0;
          const consumption = parseFloat(dist.consumed_energy) || 0;

          if (dist.category) {
            summaryData.categories[dist.category] = (summaryData.categories[dist.category] || 0) + cost;
          }
          summaryData.totalCost += cost;
          summaryData.totalConsumption += consumption;
        });
      } else {
        const cost = parseFloat(r.rawReading.total_cost) || 0;
        const consumption = parseFloat(r.rawReading.total_consumption) || 0;
        summaryData.totalCost += cost;
        summaryData.totalConsumption += consumption;
      }
    });

    return summaryData;
  }, [filteredReadings]);

  const handleGenerateAct = async () => {
    if (filteredReadings.length === 0) {
      alert('Немає даних для генерації акту');
      return;
    }

    try {
      setGenerating(true);
      await generateConsumptionAct(filteredReadings, selectedResource, actOptions);
      setDialogOpen(false);
      alert('✅ Акт успішно згенеровано!');
    } catch (err) {
      console.error('Помилка при генерації акту:', err);
      alert('❌ Помилка при генерації акту: ' + (err?.message || err));
    } finally {
      setGenerating(false);
    }
  };

  const isWater = ['вода (всі)', 'холодна вода', 'гаряча вода'].includes(selectedResource.toLowerCase());
  const isGas = selectedResource.toLowerCase() === 'газ';

  let consumptionLabel = 'Спожита електроенергія (кВт·год)';
  if (isWater) consumptionLabel = 'Спожита вода, куб. м.';
  if (isGas) consumptionLabel = 'Спожита теплова енергія, Гкал';

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={2}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'}>Акти споживання</Typography>
        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
          <Tooltip title="Оновити">
            <IconButton onClick={fetchReadings} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={!isMobile && <FileDownloadIcon />}
            disabled={generating || filteredReadings.length === 0}
            onClick={() => setDialogOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Акт' : generating ? 'Генерується...' : 'Згенерувати акт'}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            {['Електроенергія', 'Вода (всі)', 'Холодна вода', 'Гаряча вода', 'Газ'].map((resource) => (
              <Button
                key={resource}
                variant={selectedResource === resource ? 'contained' : 'outlined'}
                onClick={() => setSelectedResource(resource)}
                size={isMobile ? 'small' : 'medium'}
              >
                {resource}
              </Button>
            ))}
          </Stack>
        </Box>

        <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small">
          <InputLabel id="month-select-label">Місяць</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            label="Місяць"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <MenuItem value="">Всі</MenuItem>
            {monthLabels.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Typography color="error" mb={2} sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography>⏳ Завантаження...</Typography>
        </Box>
      ) : isMobile ? (
        <Box>
          {filteredReadings.length > 0 ? (
            filteredReadings.map((r) => (
              <MobileReadingCard key={r.id} reading={r} isWater={isWater} isGas={isGas} theme={theme} />
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Дані відсутні за обраними фільтрами</Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size={isTablet ? 'small' : 'small'} sx={{ minWidth: isTablet ? 1200 : 1500 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  № лічильника
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 150 }}>
                  Призначення обліку
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 120 }}>
                  Тип ресурсу
                </TableCell>
                {!isWater && !isGas && (
                  <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 80 }}>
                    Категорія
                  </TableCell>
                )}
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 60 }}>
                  Коеф.
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 80 }}>
                  % площі
                </TableCell>
                <TableCell colSpan={5} align="center" sx={{ fontWeight: 'bold', borderBottom: 0 }}>
                  Показники та розрахунок
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 90 }}>
                  Попередні
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 90 }}>
                  Поточні
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                  Різниця
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                  {consumptionLabel}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover, minWidth: 100 }}
                >
                  Вартість (грн)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReadings.length > 0 ? (
                filteredReadings.map((r) => {
                  const distributions = ['CA', 'CP', 'GR']
                    .map((cat) => getDistributionByCategory(r.rawReading, cat))
                    .filter(Boolean);

                  const rowsToRender =
                    distributions.length > 0
                      ? distributions
                      : [
                          {
                            category: 'General',
                            previous_reading: r.rawReading.previous_reading,
                            current_reading: r.rawReading.current_reading,
                            difference: r.rawReading.consumption,
                            consumed_energy: r.rawReading.total_consumption,
                            cost: r.rawReading.total_cost,
                          },
                        ];

                  const rowCount = rowsToRender.length;

                  return rowsToRender.map((dist, distIndex) => (
                    <TableRow key={`${r.id}-${dist.category || 'general'}`} hover>
                      {distIndex === 0 && (
                        <>
                          <TableCell rowSpan={rowCount}>{r.meterNumber}</TableCell>
                          <TableCell rowSpan={rowCount}>{r.installationPlace}</TableCell>
                          <TableCell rowSpan={rowCount}>{r.purpose}</TableCell>
                        </>
                      )}
                      {!isWater && !isGas && (
                        <TableCell align="center">
                          {dist.category === 'General' ? (
                            '—'
                          ) : (
                            <Chip
                              label={categoryLabels[dist.category] || dist.category}
                              size="small"
                              sx={{
                                backgroundColor: 'transparent',
                                border: `1.5px solid ${theme.palette.primary.main}`,
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </TableCell>
                      )}
                      {distIndex === 0 && (
                        <>
                          <TableCell rowSpan={rowCount} align="right">
                            {r.coefficient}
                          </TableCell>
                          <TableCell rowSpan={rowCount} align="right">
                            {r.locationArea}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right">{dist.previous_reading || '0.00'}</TableCell>
                      <TableCell align="right">{dist.current_reading || '0.00'}</TableCell>
                      <TableCell align="right">{dist.difference || '0.00'}</TableCell>
                      <TableCell align="right">{dist.consumed_energy || '0.00'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {dist.total_cost || dist.cost || '0.00'}
                      </TableCell>
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    Дані відсутні за обраними фільтрами
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>📄 Налаштування акту споживання</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Період (місяць)"
              type="month"
              value={actOptions.period.substring(0, 7)}
              onChange={(e) => setActOptions({ ...actOptions, period: e.target.value + '-01' })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText="Виберіть місяць для акту"
            />
            <TextField
              label="Організація (власник)"
              value={actOptions.organization}
              onChange={(e) => setActOptions({ ...actOptions, organization: e.target.value })}
              fullWidth
              placeholder="ТОВ «Про Тек Вікна Україна»"
            />
            <TextField
              label="Компанія орендаря"
              value={actOptions.tenantCompany}
              onChange={(e) => setActOptions({ ...actOptions, tenantCompany: e.target.value })}
              fullWidth
              placeholder="ТОВ «ГалФрост»"
            />
            <TextField
              label="Адреса об'єкту"
              value={actOptions.address}
              onChange={(e) => setActOptions({ ...actOptions, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Львівська обл., с. Зимна Вода, вул. Яворівська, 30"
            />
            <TextField
              label="Посада виконавця"
              value={actOptions.executorTitle}
              onChange={(e) => setActOptions({ ...actOptions, executorTitle: e.target.value })}
              fullWidth
              placeholder="інж.-енергетик"
            />
            <TextField
              label="ПІБ виконавця"
              value={actOptions.executorName}
              onChange={(e) => setActOptions({ ...actOptions, executorName: e.target.value })}
              fullWidth
              placeholder="Бенько І. Г."
            />
            <TextField
              label="Представник орендаря"
              value={actOptions.tenantRepresentative}
              onChange={(e) => setActOptions({ ...actOptions, tenantRepresentative: e.target.value })}
              fullWidth
              placeholder="Ситнік І.Ю."
            />
            <Box sx={{ bgcolor: '#f0f7ff', p: 2, borderRadius: 1, border: '1px solid #2196f3' }}>
              <Typography variant="body2" color="primary" gutterBottom>
                📊 Інформація про звіт:
              </Typography>
              <Typography variant="body2">
                • Ресурс: <strong>{selectedResource}</strong>
              </Typography>
              <Typography variant="body2">
                • Кількість записів: <strong>{filteredReadings.length}</strong>
              </Typography>
              <Typography variant="body2">
                • Формат: <strong>Excel (.xlsx)</strong>
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Скасувати
          </Button>
          <Button
            onClick={handleGenerateAct}
            variant="contained"
            disabled={generating}
            startIcon={<FileDownloadIcon />}
            sx={{ minWidth: { xs: 100, sm: 150 } }}
          >
            {generating ? 'Генерується...' : 'Згенерувати'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary */}
      <Box mt={3} p={{ xs: 1.5, sm: 2 }} component={Paper}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
          Зведена інформація
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Фільтр: {selectedResource}
          {selectedMonth && ` | Місяць: ${monthLabels.find((m) => m.value === selectedMonth)?.label}`}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }} mb={2}>
          <Typography variant="body2">
            <BarChartOutlinedIcon
              sx={{ verticalAlign: 'middle', color: theme.palette.primary.main, mr: 0.5, fontSize: isMobile ? 18 : 20 }}
            />
            Всього записів: <strong>{filteredReadings?.length || 0}</strong>
          </Typography>
          <Typography variant="body2">
            <BoltOutlinedIcon
              sx={{ verticalAlign: 'middle', color: theme.palette.primary.main, mr: 0.5, fontSize: isMobile ? 18 : 20 }}
            />
            Загальне споживання: <strong>{categorySummary.totalConsumption.toFixed(2)}</strong>
          </Typography>
        </Stack>

        <Box mt={2}>
          <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight="bold" gutterBottom>
            <PaymentIcon
              sx={{ verticalAlign: 'middle', color: theme.palette.primary.main, mr: 0.5, fontSize: isMobile ? 18 : 20 }}
            />
            Загальна вартість по категоріях:
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }} mt={1}>
            {Object.keys(categorySummary.categories).map((cat) => {
              const cost = categorySummary.categories[cat];
              if (cost > 0) {
                return (
                  <Typography key={cat} component="div" variant="body2">
                    <Chip label={categoryLabels[cat]} size="small" color="primary" sx={{ mr: 0.5 }} />:
                    <strong> {cost.toFixed(2)}</strong>
                  </Typography>
                );
              }
              return null;
            })}
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Разом: {categorySummary.totalCost.toFixed(2)}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ActsTable;

import { useState, useEffect, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Typography,
  Box, Stack, IconButton, Tooltip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { useMeterReadings } from "../../hooks/useMeterReadings";
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { generateConsumptionAct } from "../../utils/excelGenerator";

const ActsTable = () => {
  const { meterReadings, loading, error, fetchReadings } = useMeterReadings();
  const [generating, setGenerating] = useState(false);
  const [selectedResource, setSelectedResource] = useState("Електроенергія");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actOptions, setActOptions] = useState({
    period: new Date().toISOString().split('T')[0],
    organization: 'ТОВ «Про Тек Вікна Україна»',
    executorName: 'Бенько І. Г.',
    executorTitle: 'інж.-енергетик',
    tenantCompany: 'ТОВ «ГалФрост»',
    tenantRepresentative: 'Ситнік І.Ю.',
    address: 'Львівська обл., с. Зимна Вода, вул. Яворівська, 30'
  });

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const resourceColumnMap = {
    "Електроенергія": {
      consumed: "Спожита електроенергія (кВт·год)",
      calculated: "Розрах. споживачу (кВт·год)",
    },
    "Вода": {
      consumed: "Спожита вода (м³)",
      calculated: "Розрах. споживачу (м³)",
    },
    "Газ": {
      consumed: "Спожитий газ (м³)",
      calculated: "Розрах. споживачу (м³)",
    },
  };

  const transformedReadings = useMemo(() => {
    if (!meterReadings) return [];

    return meterReadings.map(reading => {
      const meterInfo = reading?.MeterTenant?.Meter;
      const tenantInfo = reading?.MeterTenant?.Tenant;
      const locationInfo = reading?.MeterTenant?.Tenant?.Location;
      const energyInfo = reading?.MeterTenant?.Meter?.EnergyResourceType;

      const prevValue = reading.previous_reading || '0.00';
      const currValue = reading.current_reading || '0.00';
      const difference = reading.consumption || '0.00';
      const coefficient = reading.calculation_coefficient || '1.00';
      const rentedArea = reading.tenant_occupied_area || '0.00';
      const totalRentedArea = reading.total_rented_area || '0.00';
      const areaPercentage = reading.area_percentage || '0.00';
      const consumedKwh = reading.total_consumption || '0.00';
      const calculatedKwh = reading.area_based_consumption || '0.00';

      return {
        id: reading.id,
        meterNumber: meterInfo?.serial_number || 'N/A',
        installationPlace: location?.name || 'N/A',
        purpose: energyInfo?.name || 'N/A',
        prevValue: prevValue,
        currValue: currValue,
        difference: difference,
        coefficient: coefficient,
        rentedArea: rentedArea,
        totalArea: totalRentedArea,
        areaPercent: areaPercentage,
        consumedKwh: consumedKwh,
        calculatedKwh: calculatedKwh,
      };
    });
  }, [meterReadings]);

  const filteredReadings = useMemo(() => {
    if (!selectedResource) return transformedReadings;
    return transformedReadings.filter(r => r.purpose === selectedResource);
  }, [selectedResource, transformedReadings]);

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
      alert('❌ Помилка при генерації акту: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box p={2}>
      {/* ШАПКА З КНОПКАМИ */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Акти споживання</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Оновити дані">
            <IconButton onClick={fetchReadings} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {/* 🎯 ОСЬ ГОЛОВНА КНОПКА ГЕНЕРАЦІЇ XLSX */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            disabled={generating || filteredReadings.length === 0 || loading}
            onClick={() => setDialogOpen(true)}
            sx={{ minWidth: 180 }}
          >
            {generating ? "Генерується..." : "Згенерувати акт XLSX"}
          </Button>
        </Stack>
      </Stack>

      {/* ФІЛЬТРИ ПО РЕСУРСАМ */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        {Object.keys(resourceColumnMap).map(resource => (
          <Button
            key={resource}
            variant={selectedResource === resource ? "contained" : "outlined"}
            onClick={() => setSelectedResource(resource)}
            size="medium"
          >
            {resource}
          </Button>
        ))}
      </Stack>

      {/* ПОВІДОМЛЕННЯ ПРО ПОМИЛКИ */}
      {error && (
        <Typography color="error" mb={2} sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
          ⚠️ {error}
        </Typography>
      )}

      {/* ТАБЛИЦЯ */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography>⏳ Завантаження...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>№ лічильника</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Призначення обліку (назва об'єкта)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Тип ресурсу</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Попередні</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Поточні</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Різниця</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Коеф.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Оренд. площа (м²)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Заг. площа (м²)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Відсоток площі (%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {resourceColumnMap[selectedResource]?.consumed}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {resourceColumnMap[selectedResource]?.calculated}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReadings.map((reading, index) => (
                <TableRow key={reading.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell>{reading.meterNumber}</TableCell>
                  <TableCell>{reading.installationPlace}</TableCell>
                  <TableCell>{reading.purpose}</TableCell>
                  <TableCell align="right">{reading.prevValue}</TableCell>
                  <TableCell align="right">{reading.currValue}</TableCell>
                  <TableCell align="right">{reading.difference}</TableCell>
                  <TableCell align="right">{reading.coefficient}</TableCell>
                  <TableCell align="right">{reading.rentedArea}</TableCell>
                  <TableCell align="right">{reading.totalArea}</TableCell>
                  <TableCell align="right">{reading.areaPercent}</TableCell>
                  <TableCell align="right">{reading.consumedKwh}</TableCell>
                  <TableCell align="right">{reading.calculatedKwh}</TableCell>
                </TableRow>
              ))}
              {filteredReadings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      📋 Дані відсутні для типу ресурсу "{selectedResource}"
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ДІАЛОГ НАЛАШТУВАНЬ АКТУ */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
          📄 Налаштування акту споживання
        </DialogTitle>
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
            sx={{ minWidth: 150 }}
          >
            {generating ? "Генерується..." : "Згенерувати"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActsTable;
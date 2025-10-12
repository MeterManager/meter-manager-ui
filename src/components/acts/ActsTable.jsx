import { useState, useEffect, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Typography,
  Box, Stack, IconButton, Tooltip
} from "@mui/material";
import { useMeterReadings } from "../../hooks/useMeterReadings";
import RefreshIcon from '@mui/icons-material/Refresh';
import FileTextIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { useTheme } from "@mui/material/styles";


const ActsTable = () => {
  const { meterReadings, loading, error, fetchReadings, getReadingsSummary } = useMeterReadings();
  const [generating, setGenerating] = useState(false);
  const [selectedResource, setSelectedResource] = useState("Електроенергія");
  const [summary, setSummary] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchReadings();
    getReadingsSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, [fetchReadings, getReadingsSummary, selectedResource]);
  

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
      const locationInfo = meterInfo?.Location; 
      const energyInfo = reading?.MeterTenant?.Meter?.EnergyResourceType;

      const prevValue = reading.previous_reading || '0.00';
      const currValue = reading.current_reading || '0.00';
      const difference = reading.consumption || '0.00';
      const coefficient = reading.calculation_coefficient || 'N/A';
      const occupiedArea = parseFloat(reading.location_occupied_area)?.toFixed(2) || '0.00';
      const consumedKwh = reading.total_consumption || '0.00';
      const calculatedKwh = reading.area_based_consumption || '0.00';

      return {
        id: reading.id,
        meterNumber: meterInfo?.serial_number || 'N/A',
        installationPlace: locationInfo?.name || 'Nевідома локація', 
        address: locationInfo?.address || '', 
        purpose: energyInfo?.name || 'N/A',
        //group: group,
        prevValue: prevValue,
        currValue: currValue,
        difference: difference,
        coefficient: coefficient,
        locationArea: occupiedArea, 
        consumedKwh: consumedKwh,
        calculatedKwh: calculatedKwh,
      };
    });
  }, [meterReadings]);

  const filteredReadings = useMemo(() => {
    if (!selectedResource) return transformedReadings;
    return transformedReadings.filter(r => r.purpose === selectedResource);
  }, [selectedResource, transformedReadings]);


  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Акти споживання</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Оновити">
            <IconButton onClick={fetchReadings}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileTextIcon />}
            disabled={generating}
          >
            {generating ? "Генерується..." : "Згенерувати акт"}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        {Object.keys(resourceColumnMap).map(resource => (
          <Button
            key={resource}
            variant={selectedResource === resource ? "contained" : "outlined"}
            onClick={() => setSelectedResource(resource)}
          >
            {resource}
          </Button>
        ))}
      </Stack>

      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Typography>Завантаження...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell>№ лічильника</TableCell>
                <TableCell>Призначення обліку(назва об'єкта)</TableCell>
                <TableCell>Тип ресурсу</TableCell>
                <TableCell align="right">Попередні</TableCell>
                <TableCell align="right">Поточні</TableCell>
                <TableCell align="right">Різниця</TableCell>
                <TableCell align="right">Коеф.</TableCell>
                <TableCell align="right">Площа (м²)</TableCell> 
                <TableCell align="right">
                  {resourceColumnMap[selectedResource]?.consumed}
                </TableCell>
                <TableCell align="right">
                  {resourceColumnMap[selectedResource]?.calculated}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{reading.meterNumber}</TableCell>
                  <TableCell>{reading.installationPlace}</TableCell>
                  <TableCell>{reading.purpose}</TableCell>
                  <TableCell align="right">{reading.prevValue}</TableCell>
                  <TableCell align="right">{reading.currValue}</TableCell>
                  <TableCell align="right">{reading.difference}</TableCell>
                  <TableCell align="right">{reading.coefficient}</TableCell>
                  <TableCell align="right">{reading.locationArea}</TableCell>
                  <TableCell align="right">{reading.consumedKwh}</TableCell>
                  <TableCell align="right">{reading.calculatedKwh}</TableCell>
                </TableRow>
              ))}
              {filteredReadings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    Дані відсутні
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    {summary && (
      <Box mt={3} p={2} component={Paper}>
        <Typography variant="h6" gutterBottom>
          Зведена інформація
        </Typography>

          {summary[selectedResource] ? (
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                🔹 {selectedResource}
              </Typography>
              <Stack direction="row" spacing={4}>
                <Typography>
                  <BarChartOutlinedIcon sx={{ verticalAlign: "middle", color:theme.palette.primary.main, mr: 0.5 }} />
                  Всього записів:{" "}
                  <strong>{summary[selectedResource].readings?.length || 0}</strong>
                </Typography>
                <Typography>
                  <BoltOutlinedIcon sx={{ verticalAlign: "middle", color:theme.palette.primary.main, mr: 0.5 }} />
                  Загальне споживання:{" "}
                  <strong>
                    {Number(summary[selectedResource].totalConsumption).toFixed(2)}
                  </strong>
                </Typography>
                <Typography>
                  <PaymentIcon sx={{ verticalAlign: "middle",color:theme.palette.primary.main, mr: 0.5 }} />
                  Загальна вартість:{" "}
                  <strong>
                    {Number(summary[selectedResource].totalCost).toFixed(2)}
                  </strong>
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Typography color="text.secondary">Немає даних для {selectedResource}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
export default ActsTable;
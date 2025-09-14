import { useState, useEffect, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Typography,
  Box, Stack, IconButton, Tooltip
} from "@mui/material";
import { useMeterReadings } from "../../hooks/useMeterReadings";
import RefreshIcon from '@mui/icons-material/Refresh';
import FileTextIcon from '@mui/icons-material/Description';

const ActsTable = () => {
  const { meterReadings, loading, error, fetchReadings } = useMeterReadings();
  const [generating, setGenerating] = useState(false);
  const [selectedResource, setSelectedResource] = useState("Електроенергія");

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
      const coefficient = reading.calculation_coefficient || 'N/A';
      const rentedArea = reading.tenant_occupied_area || '0.00';
      const totalRentedArea = reading.total_rented_area || '0.00';
      const areaPercentage = reading.area_percentage || '0.00';
      const consumedKwh = reading.total_consumption || '0.00';
      const calculatedKwh = reading.area_based_consumption || '0.00';

      return {
        id: reading.id,
        meterNumber: meterInfo?.serial_number || 'N/A',
        installationPlace: locationInfo?.name || 'N/A',
        purpose: energyInfo?.name || 'N/A',
        //group: group,
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
                <TableCell align="right">Оренд. площа (м²)</TableCell>
                <TableCell align="right">Заг. площа (м²)</TableCell>
                <TableCell align="right">Відсоток площі (%)</TableCell>
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
                  <TableCell align="right">{reading.rentedArea}</TableCell>
                  <TableCell align="right">{reading.totalArea}</TableCell>
                  <TableCell align="right">{reading.areaPercent}</TableCell>
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
    </Box>
  );
};
export default ActsTable;
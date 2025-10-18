import { useState, useEffect, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Typography,
    Box, Stack, IconButton, Tooltip, Chip,
    FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { useMeterReadings } from "../../hooks/useMeterReadings";
import RefreshIcon from '@mui/icons-material/Refresh';
import FileTextIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { useTheme } from "@mui/material/styles";

const categoryLabels = {
    CA: "СА", 
    CP: "СР", 
    GR: "ГР", 
};

const monthLabels = [
    { value: '01', label: 'Січень' }, { value: '02', label: 'Лютий' }, { value: '03', label: 'Березень' },
    { value: '04', label: 'Квітень' }, { value: '05', label: 'Травень' }, { value: '06', label: 'Червень' },
    { value: '07', label: 'Липень' }, { value: '08', label: 'Серпень' }, { value: '09', label: 'Вересень' },
    { value: '10', label: 'Жовтень' }, { value: '11', label: 'Листопад' }, { value: '12', label: 'Грудень' },
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


const ActsTable = () => {
    const { meterReadings, loading, error, fetchReadings, getReadingsSummary } = useMeterReadings();
    const [generating, setGenerating] = useState(false);
    const [selectedResource, setSelectedResource] = useState("Електроенергія");
   
    const [selectedMonth, setSelectedMonth] = useState(''); 
    const [summary, setSummary] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        fetchReadings();
        getReadingsSummary()
            .then((data) => setSummary(data))
            .catch(() => setSummary(null));
    }, [fetchReadings, getReadingsSummary, selectedResource]);
    

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

            const coefficient = reading.calculation_coefficient || 'N/A';
            const occupiedArea = parseFloat(reading.location_occupied_area)?.toFixed(2) || '0.00';

            const readingDate = reading.reading_date || reading.act_date || ''; 

            return {
                id: reading.id,
                rawReading: reading, 
                meterNumber: meterInfo?.serial_number || 'N/A',
                installationPlace: locationInfo?.name || 'Nевідома локація', 
                purpose: energyInfo?.name || 'N/A',
                coefficient: coefficient,
                locationArea: occupiedArea, 
                readingDate: readingDate,
            };
        });
    }, [meterReadings]);

    const filteredReadings = useMemo(() => {
        let filtered = transformedReadings;

        if (selectedResource) {
            filtered = filtered.filter(r => r.purpose === selectedResource);
        }

        if (selectedMonth) {
            filtered = filtered.filter(r => getMonthFromDate(r.readingDate) === selectedMonth);
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

        filteredReadings.forEach(r => {
            const distributions = ["CA", "CP", "GR"]
                .map((cat) => getDistributionByCategory(r.rawReading, cat))
                .filter(Boolean);

            if (distributions.length > 0) {
                distributions.forEach(dist => {
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

            <Stack direction="row" spacing={2} mb={2} alignItems="center">
                {Object.keys(resourceColumnMap).map(resource => (
                    <Button
                        key={resource}
                        variant={selectedResource === resource ? "contained" : "outlined"}
                        onClick={() => setSelectedResource(resource)}
                        size="small"
                    >
                        {resource}
                    </Button>
                ))}

                <FormControl sx={{ minWidth: 120 }} size="small">
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

            {error && <Typography color="error">{error}</Typography>}
            {loading ? (
                <Typography>Завантаження...</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 1500 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>№ лічильника</TableCell>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>Призначення обліку(назва об'єкта)</TableCell>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>Тип ресурсу</TableCell>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>Категорія</TableCell>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>Коеф.</TableCell>
                                <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold' }}>Відсоток площі (%)</TableCell> 
                                <TableCell colSpan={6} align="center" sx={{ fontWeight: 'bold', borderBottom: 0 }}>Показники та розрахунок</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Попередні</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Поточні</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Різниця</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    {resourceColumnMap[selectedResource]?.consumed}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: theme.palette.action.hover }}>
                                    Вартість (грн)
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReadings.length > 0 ? (
                                filteredReadings.map((r) => {
                                    const distributions = ["CA", "CP", "GR"]
                                        .map((cat) => getDistributionByCategory(r.rawReading, cat))
                                        .filter(Boolean);
                                    
                                    const rowsToRender = distributions.length > 0 ? distributions : [{
                                        category: 'General',
                                        previous_reading: r.rawReading.previous_reading,
                                        current_reading: r.rawReading.current_reading,
                                        difference: r.rawReading.consumption,
                                        consumed_energy: r.rawReading.total_consumption,
                                        calculated_energy: r.rawReading.area_based_consumption,
                                        cost: r.rawReading.total_cost, 
                                    }];
                                    
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
                                            
                                            {/* Категорія */}
                                            <TableCell align="center">
                                                {dist.category === 'General' ? '—' : (
                                                    <Chip 
                                                        label={categoryLabels[dist.category] || dist.category} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: "transparent", 
                                                            border: `1.5px solid ${theme.palette.primary.main}`, 
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                            
                                            {distIndex === 0 && (
                                                <>
                                                    <TableCell rowSpan={rowCount} align="right">{r.coefficient}</TableCell>
                                                    <TableCell rowSpan={rowCount} align="right">{r.locationArea}</TableCell>
                                                </>
                                            )}

                                            <TableCell align="right">{dist.previous_reading || '0.00'}</TableCell>
                                            <TableCell align="right">{dist.current_reading || '0.00'}</TableCell>
                                            <TableCell align="right">{dist.difference || '0.00'}</TableCell>
                                            <TableCell align="right">{dist.consumed_energy || '0.00'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {(dist.total_cost || dist.cost || '0.00')} 
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

            <Box mt={3} p={2} component={Paper}>
                <Typography variant="h6" gutterBottom>
                    Зведена інформація (Фільтр: {selectedResource} {selectedMonth && `| Місяць: ${monthLabels.find(m => m.value === selectedMonth)?.label}`})
                </Typography>

                <Box mb={2}>
                    <Stack direction="row" spacing={4} flexWrap="wrap">
                        <Typography>
                            <BarChartOutlinedIcon sx={{ verticalAlign: "middle", color: theme.palette.primary.main, mr: 0.5 }} />
                            Всього записів:{" "}
                            <strong>{filteredReadings?.length || 0}</strong>
                        </Typography>
                        <Typography>
                            <BoltOutlinedIcon sx={{ verticalAlign: "middle", color: theme.palette.primary.main, mr: 0.5 }} />
                            Загальне споживання:{" "}
                            <strong>
                                {categorySummary.totalConsumption.toFixed(2)}
                            </strong>
                        </Typography>
                    </Stack>
                    
                    <Box mt={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            <PaymentIcon sx={{ verticalAlign: "middle", color: theme.palette.primary.main, mr: 0.5 }} />
                            Загальна вартість по категоріях:
                        </Typography>
                        <Stack direction="row" spacing={4} mt={1}>
                            {Object.keys(categorySummary.categories).map(cat => {
                                const cost = categorySummary.categories[cat];
                                if (cost > 0) {
                                    return (
                                        <Typography key={cat}>
                                            <Chip label={categoryLabels[cat]} size="small" color="primary" sx={{ mr: 0.5 }} />:
                                            <strong> {cost.toFixed(2)}</strong>
                                        </Typography>
                                    );
                                }
                                return null;
                            })}
                            <Typography sx={{ fontWeight: 'bold' }}>
                                Разом: {categorySummary.totalCost.toFixed(2)}
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
export default ActsTable;
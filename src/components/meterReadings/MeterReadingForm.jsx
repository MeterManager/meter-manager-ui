import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TableSortLabel, Stack, Card, CardContent, 
  Tooltip, IconButton, Chip, Grid, Divider, useMediaQuery,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const MeterReadingsTable = ({ readings = [], onDelete, onEdit, orderBy, order, handleSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const categoryLabels = {
    CA: "СА",
    CP: "СР",
    GR: "ГР",
  };

  const getTenantLocationInfo = (reading) => {
    const location = reading?.MeterTenant?.Meter?.Location;
    if (location) {
      return {
        id: location.id,
        name: location.name || "Невідома",
        address: location.address || "",
      };
    }
    return { id: null, name: "Невідома", address: "" };
  };

  const getDistributionByCategory = (reading, category) => {
    if (!reading.distributions || !Array.isArray(reading.distributions)) return null;
    return reading.distributions.find((d) => d.category === category);
  };

  const MobileReadingCard = ({ r }) => {
    const location = getTenantLocationInfo(r);
    const distributions = ["CA", "CP", "GR"]
      .map((cat) => getDistributionByCategory(r, cat))
      .filter(Boolean);

    const totalConsumed = distributions.reduce(
      (sum, dist) => sum + (parseFloat(dist.consumed_energy) || 0), 
      0
    ) || (parseFloat(r.total_consumption) || 0);

    return (
      <Card
        sx={{
          mb: 2,
          boxShadow: 1,
          "&:hover": { boxShadow: 3 },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {r.MeterTenant?.Meter?.serial_number || "Невідомий"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {r.MeterTenant?.Meter?.EnergyResourceType?.name || "Н/Д"}
              </Typography>
            </Box>
            <Chip 
              label={r.reading_date} 
              size="small" 
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Локація:</strong> {location.name}
            </Typography>
            {location.address && (
              <Typography variant="caption" color="text.secondary">
                {location.address}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {distributions.length > 0 ? (
            distributions.map((dist) => (
              <Box 
                key={dist.category} 
                sx={{ 
                  bgcolor: theme.palette.action.hover, 
                  p: 1.5, 
                  borderRadius: 1, 
                  mb: 1.5 
                }}
              >
                <Chip 
                  label={categoryLabels[dist.category] || dist.category} 
                  size="small" 
                  color="primary"
                  sx={{ mb: 1, fontWeight: 'bold' }}
                />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Поточний
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {dist.current_reading}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Попередній
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {dist.previous_reading}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Різниця
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {dist.difference}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Спожито
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {dist.consumed_energy}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Тариф
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {dist.unit_price} грн
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Box sx={{ bgcolor: theme.palette.action.hover, p: 1.5, borderRadius: 1, mb: 1.5 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Поточний
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {r.current_reading || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Попередній
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {r.previous_reading || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Спожито
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {r.total_consumption || '0.00'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Виконавець
              </Typography>
              <Typography variant="body2">
                {r.executor_name || "-"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Редагувати">
                <IconButton size="small" onClick={() => onEdit?.(r)} color="primary">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Видалити">
                <IconButton size="small" color="error" onClick={() => onDelete?.(r.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box 
            sx={{ 
              mt: 1.5, 
              pt: 1.5, 
              borderTop: `2px solid ${theme.palette.primary.main}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Разом спожито:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {totalConsumed.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {isMobile || isTablet ? (
        readings.length > 0 ? (
          readings.map((r) => <MobileReadingCard key={r.id} r={r} />)
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Показники не знайдено
            </Typography>
          </Paper>
        )
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1600 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 60 }}>
                  №
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 100 }}>
                  <TableSortLabel
                    active={orderBy === "reading_date"}
                    direction={orderBy === "reading_date" ? order : "asc"}
                    onClick={() => handleSort("reading_date")}
                  >
                    Дата
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 120 }}>
                  № лічильника
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 200 }}>
                  Об'єкт/Локація
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 120 }}>
                  Тип Ресурсу
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Категорія
                </TableCell>
                <TableCell colSpan={4} align="center" sx={{ fontWeight: "bold", borderBottom: 0, bgcolor: theme.palette.action.hover }}>
                  Показники
                </TableCell>
                <TableCell colSpan={1} align="center" sx={{ fontWeight: "bold", borderBottom: 0, bgcolor: theme.palette.action.selected }}>
                  Розрахунок
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 120 }}>
                  Виконавець
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Дії
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Поточний</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Попередній</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Різниця</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Спожито</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Тариф (грн)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {readings.length > 0 ? (
                readings.map((r, index) => {
                  const location = getTenantLocationInfo(r);
                  const distributions = ["CA", "CP", "GR"]
                    .map((cat) => getDistributionByCategory(r, cat))
                    .filter(Boolean);

                  const rowsToRender = distributions.length > 0 ? distributions : [{
                    category: 'General',
                    current_reading: r.current_reading,
                    previous_reading: r.previous_reading,
                    difference: r.total_consumption,
                    consumed_energy: r.total_consumption,
                    unit_price: r.unit_price,
                  }];

                  const rowCount = rowsToRender.length;
                  const totalConsumedForReading = distributions.reduce(
                    (sum, dist) => sum + (parseFloat(dist.consumed_energy) || 0), 
                    0
                  ) || (parseFloat(r.total_consumption) || 0);

                  return (
                    <React.Fragment key={r.id}>
                      {rowsToRender.map((dist, distIndex) => (
                        <TableRow key={`${r.id}-${dist.category}`} hover>
                          {distIndex === 0 && (
                            <>
                              <TableCell rowSpan={rowCount} align="center">{index + 1}</TableCell>
                              <TableCell rowSpan={rowCount} align="center">{r.reading_date}</TableCell>
                              <TableCell rowSpan={rowCount} align="center">
                                {r.MeterTenant?.Meter?.serial_number || "Н/Д"}
                              </TableCell>
                              <TableCell rowSpan={rowCount} align="center">
                                <Typography variant="body2" fontWeight={500}>{location.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {location.address}
                                </Typography>
                              </TableCell>
                              <TableCell rowSpan={rowCount} align="center">
                                {r.MeterTenant?.Meter?.EnergyResourceType?.name || "Н/Д"}
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            {dist.category === 'General' ? '—' : (
                              <Chip
                                label={categoryLabels[dist.category]}
                                size="small"
                                sx={{
                                  backgroundColor: "transparent",
                                  border: `1.5px solid ${theme.palette.primary.main}`,
                                  fontWeight: 'bold'
                                }}
                              />
                            )}
                          </TableCell>

                          <TableCell align="center">{dist.current_reading ?? '0.00'}</TableCell>
                          <TableCell align="center">{dist.previous_reading ?? '0.00'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            {dist.difference ?? '0.00'}
                          </TableCell>
                          <TableCell align="center">{dist.consumed_energy ?? '0.00'}</TableCell>
                          <TableCell align="center">
                            {dist.unit_price ?? r.unit_price ?? '0.00'}
                          </TableCell>

                          {distIndex === 0 && (
                            <>
                              <TableCell rowSpan={rowCount} align="center">
                                {r.executor_name || "-"}
                              </TableCell>
                              <TableCell rowSpan={rowCount} align="center" sx={{ whiteSpace: "nowrap" }}>
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Tooltip title="Редагувати">
                                    <IconButton size="small" onClick={() => onEdit?.(r)}>
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Видалити">
                                    <IconButton size="small" color="error" onClick={() => onDelete?.(r.id)}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}

                      {rowCount > 0 && (
                        <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                          <TableCell colSpan={10} align="right" sx={{ fontWeight: 600, borderBottom: 0 }}>
                            Разом спожито:
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderBottom: 0 }}>
                            {totalConsumedForReading.toFixed(2)}
                          </TableCell>
                          <TableCell colSpan={2} sx={{ borderBottom: 0 }} />
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Показники не знайдено
                    </Typography>
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

export default MeterReadingsTable;
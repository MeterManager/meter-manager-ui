import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TableSortLabel, Stack, Card, CardContent, Tooltip, IconButton,
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "../../hooks/useMediaQuery";

const MeterReadingsTable = ({ readings = [], onDelete, onEdit, orderBy, order, handleSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:800px)");
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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

      const totalConsumed = distributions.reduce((sum, dist) => sum + (parseFloat(dist.consumed_energy) || 0), 0) || (parseFloat(r.total_consumption) || 0);

      return (
          <Card
              sx={{
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": { boxShadow: 2 },
              }}
          >
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {r.MeterTenant?.Meter?.serial_number || "Невідомий"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          {r.reading_date}
                      </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                      Локація: {location.name} – {location.address}
                  </Typography>
                  
                  {distributions.map((dist) => (
                      <Box key={dist.category} sx={{ bgcolor: theme.palette.action.hover, p: 1, borderRadius: 1, mt: 1 }}>
                          <Chip 
                              label={categoryLabels[dist.category] || dist.category} 
                              size="small" 
                              sx={{ mb: 0.5, fontWeight: 'bold' }}
                          />
                          <Typography variant="body2">
                              Поточний: {dist.current_reading} | Попередній: {dist.previous_reading}
                          </Typography>
                          <Typography variant="body2">
                              Різниця: {dist.difference} | Спожито: {dist.consumed_energy}
                          </Typography>
                          <Typography variant="body2">
                              Тариф (грн): {dist.unit_price} 
                          </Typography>
                      </Box>
                  ))}

                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      Виконавець: {r.executor_name || "-"}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: "bold" }}>
                      Разом спожито: {totalConsumed.toFixed(2)}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
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
                  <Typography variant="body2" color="text.secondary" align="center">
                      Показники не знайдено
                  </Typography>
              )
          ) : (
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 1600 }}> 
                      <TableHead>
                          <TableRow>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>№</TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>
                                  <TableSortLabel
                                      active={orderBy === "reading_date"}
                                      direction={orderBy === "reading_date" ? order : "asc"}
                                      onClick={() => handleSort("reading_date")}
                                  >
                                      Дата
                                  </TableSortLabel>
                              </TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>№ лічильника</TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>Об'єкт/Локація</TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>Тип Ресурсу</TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>Категорія</TableCell>
                              <TableCell colSpan={4} align="center" sx={{ fontWeight: "bold", borderBottom: 0, bgcolor: theme.palette.action.hover }}>
                                  Показники
                              </TableCell>
                              <TableCell colSpan={1} align="center" sx={{ fontWeight: "bold", borderBottom: 0, bgcolor: theme.palette.action.selected }}>
                                  Розрахунок
                              </TableCell>

                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>Виконавець</TableCell>
                              <TableCell align="center" rowSpan={2} sx={{ fontWeight: "bold" }}>Дії</TableCell>
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

                                  const totalConsumedForReading = distributions.reduce((sum, dist) => sum + (parseFloat(dist.consumed_energy) || 0), 0) || (parseFloat(r.total_consumption) || 0);


                                  return (
                                      <>
                                          {rowsToRender.map((dist, distIndex) => (
                                              <TableRow key={`${r.id}-${dist.category}`} hover>
                                                  {/* Спільні комірки */}
                                                  {distIndex === 0 && (
                                                      <>
                                                          <TableCell rowSpan={rowCount} align="center">{index + 1}</TableCell>
                                                          <TableCell rowSpan={rowCount} align="center">{r.reading_date}</TableCell>
                                                          <TableCell rowSpan={rowCount} align="center">{r.MeterTenant?.Meter?.serial_number || "Н/Д"}</TableCell>
                                                          <TableCell rowSpan={rowCount} align="center">
                                                              <Typography variant="body1">{location.name}</Typography>
                                                              <Typography variant="body2" color="text.secondary">({location.address})</Typography>
                                                          </TableCell>
                                                          <TableCell rowSpan={rowCount} align="center">
                                                              {r.MeterTenant?.Meter?.EnergyResourceType?.name || "Н/Д"}
                                                          </TableCell>
                                                      </>
                                                  )}

                                                  {/* Категорія */}
                                                  <TableCell align="center">
                                                      {dist.category === 'General' ? '—' : (
                                                          <Chip 
                                                              label={categoryLabels[dist.category]} 
                                                              size="small" 
                                                              sx={{ 
                                                                  backgroundColor: "transparent",
                                                                  border: `1px solid ${theme.palette.primary.main}`,
                                                                  fontWeight: 'bold'
                                                              }}
                                                          />
                                                      )}
                                                  </TableCell>

                                                  {/* Показники */}
                                                  <TableCell align="center">{dist.current_reading ?? '0.00'}</TableCell>
                                                  <TableCell align="center">{dist.previous_reading ?? '0.00'}</TableCell>
                                                  <TableCell align="center" sx={{ fontWeight: 600 }}>{dist.difference ?? '0.00'}</TableCell>
                                                  <TableCell align="center">{dist.consumed_energy ?? '0.00'}</TableCell>
     
                                                  <TableCell align="center">
                                                      {dist.unit_price ?? r.unit_price ?? '0.00'}
                                                  </TableCell>

                                                  {distIndex === 0 && (
                                                      <TableCell rowSpan={rowCount} align="center">
                                                          {r.executor_name || "-"}
                                                      </TableCell>
                                                  )}

                                                  {distIndex === 0 && (
                                                      <TableCell
                                                          rowSpan={rowCount}
                                                          align="center"
                                                          sx={{ whiteSpace: "nowrap" }}
                                                      >
                                                          <Stack direction="row" spacing={1} justifyContent="center">
                                                              <Tooltip title="Редагувати">
                                                                  <IconButton size="small" onClick={() => onEdit?.(r)}>
                                                                      <Edit fontSize="small" />
                                                                  </IconButton>
                                                              </Tooltip>
                                                              <Tooltip title="Видалити">
                                                                  <IconButton
                                                                      size="small"
                                                                      color="error"
                                                                      onClick={() => onDelete?.(r.id)}
                                                                  >
                                                                      <Delete fontSize="small" />
                                                                  </IconButton>
                                                              </Tooltip>
                                                          </Stack>
                                                      </TableCell>
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
                                                  <TableCell colSpan={2} sx={{ borderBottom: 0 }}/>
                                              </TableRow>
                                          )}
                                      </>
                                  );
                              })
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={10} align="center" sx={{ p: 2 }}>
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
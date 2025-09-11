import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TableSortLabel, Stack, Card, CardContent, Tooltip, IconButton,
} from "@mui/material";
import { Edit, Delete } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "../../hooks/useMediaQuery";

const MeterReadingsTable = ({ readings = [], onDelete, onEdit, orderBy, order, handleSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:800px)");

  const MobileReadingCard = ({ r }) => (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        "&:hover": { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {r.MeterTenant?.Meter?.serial_number || "Невідомий"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {r.reading_date}
          </Typography>
        </Box>
  
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Локація: {r.MeterTenant?.Tenant?.Location?.name || "Невідома"} –{" "}
          {r.MeterTenant?.Tenant?.Location?.address || ""}
        </Typography>
  
        <Typography variant="body2">Поточний: {r.current_reading}</Typography>
        <Typography variant="body2">Споживання: {r.total_consumption}</Typography>
        <Typography variant="body2">Ціна: {r.unit_price}</Typography>
        <Typography variant="body2">Вартість: {r.total_cost}</Typography>
        <Typography variant="body2">Метод: {r.calculation_method}</Typography>
        <Typography variant="body2">Виконавець: {r.executor_name || "-"}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Представник: {r.tenant_representative || "-"}
        </Typography>
  
        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  

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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "reading_date"}
                    direction={orderBy === "reading_date" ? order : "asc"}
                    onClick={() => handleSort("reading_date")}
                  >
                    Дата
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Лічильник</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Локація</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Поточний</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Споживання</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Ціна</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Вартість</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Метод</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Виконавець</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Представник</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {readings.length > 0 ? (
                readings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell align="center">{r.reading_date}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">
                        {r.MeterTenant?.Meter?.serial_number || "Невідомий"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.MeterTenant?.Tenant?.name || "Невідомий"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">
                        {r.MeterTenant?.Tenant?.Location?.name || "Невідома"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.MeterTenant?.Tenant?.Location?.address || ""}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{r.current_reading}</TableCell>
                    <TableCell align="center">{r.total_consumption}</TableCell>
                    <TableCell align="center">{r.unit_price}</TableCell>
                    <TableCell align="center">{r.total_cost}</TableCell>
                    <TableCell align="center">{r.calculation_method}</TableCell>
                    <TableCell align="center">{r.executor_name || "-"}</TableCell>
                    <TableCell align="center">{r.tenant_representative || "-"}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Редагувати">
                          <IconButton  size="small" variant="outlined" onClick={() => onEdit?.(r)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити">
                          <IconButton size="small" color="error" onClick={() => onDelete?.(r.id)}>
                            <Delete fontSize="small" />
                          </IconButton >
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ p: 2 }}>
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

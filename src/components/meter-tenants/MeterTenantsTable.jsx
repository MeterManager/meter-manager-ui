import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, CalendarToday, Person, Speed } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';

const MeterTenantsTable = ({ meterTenants, tenants = [], meters = [], onEdit, onDelete, onAdd }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  const [search, setSearch] = useState('');

  const getTenantName = (tenantId) => tenants.find((t) => t.id === tenantId)?.name || 'Невідомий орендар';
  const getMeterSerial = (meterId) => meters.find((m) => m.id === meterId)?.serial_number || `ID: ${meterId}`;

  const filteredMeterTenants = meterTenants.filter((mt) => {
    const tenantName = getTenantName(mt.tenant_id).toLowerCase();
    const meterSerial = getMeterSerial(mt.meter_id).toLowerCase();
    const query = search.toLowerCase();
    return tenantName.includes(query) || meterSerial.includes(query);
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const MobileMeterTenantCard = ({ meterTenant }) => (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 2 } }}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Орендар:</strong> {getTenantName(meterTenant.tenant_id)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Лічильник:</strong> {getMeterSerial(meterTenant.meter_id)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Початок:</strong> {formatDate(meterTenant.assigned_from)}
            </Typography>
          </Box>

          {meterTenant.assigned_to && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Завершення:</strong> {formatDate(meterTenant.assigned_to)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Редагувати">
              <IconButton size="small" onClick={() => onEdit(meterTenant)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Видалити">
              <IconButton size="small" onClick={() => onDelete(meterTenant.id)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: isMobile ? 'stretch' : 'space-between',
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={onAdd}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : '160px',
            height: '40px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Додати зв'язок
        </Button>

        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          placeholder="Пошук за орендарем або лічильником..."
          sx={{
            width: isMobile ? '100%' : '350px',
            maxWidth: isMobile ? '100%' : '400px',
            flexShrink: 1,
          }}
        />
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Знайдено: {filteredMeterTenants.length} з {meterTenants.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredMeterTenants.length > 0 ? (
            filteredMeterTenants.map((meterTenant) => (
              <MobileMeterTenantCard key={meterTenant.id} meterTenant={meterTenant} />
            ))
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? 'За вашим запитом нічого не знайдено' : "Зв'язки не знайдено"}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell
                  sx={{
                    width: isTablet ? '25%' : '25%',
                    fontWeight: 600,
                  }}
                >
                  Орендар
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '25%' : '25%',
                    fontWeight: 600,
                  }}
                >
                  Лічильник
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '15%' : '15%',
                    fontWeight: 600,
                  }}
                >
                  Дата початку
                </TableCell>
                <TableCell
                  sx={{
                    width: isTablet ? '15%' : '15%',
                    fontWeight: 600,
                  }}
                >
                  Дата завершення
                </TableCell>
                <TableCell
                  sx={{
                    width: '5%',
                    fontWeight: 600,
                  }}
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeterTenants.length > 0 ? (
                filteredMeterTenants.map((mt) => (
                  <TableRow
                    key={mt.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getTenantName(mt.tenant_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {getMeterSerial(mt.meter_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(mt.assigned_from)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(mt.assigned_to)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Редагувати зв'язок">
                          <IconButton size="small" onClick={() => onEdit(mt)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити зв'язок">
                          <IconButton size="small" onClick={() => onDelete(mt.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'За вашим запитом нічого не знайдено' : "Зв'язки не знайдено"}
                    </Typography>
                    {!search && (
                      <Button variant="outlined" onClick={onAdd} sx={{ mt: 2 }}>
                        Додати перший зв'язок
                      </Button>
                    )}
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

export default MeterTenantsTable;

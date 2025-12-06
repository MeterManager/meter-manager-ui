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
  Switch,
  IconButton,
  Chip,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Phone, Email } from '@mui/icons-material';
import useMediaQuery from '../../hooks/useMediaQuery';
import SearchField from '../ui/SearchField';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { translateErrorMessage } from '../../utils/translateError';
import { UA } from '../../utils/uaDictionary';
import { BREAKPOINTS, SIZES, FORM_FIELDS } from '../../constants';

const TenantsTable = ({
  tenants,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  locations = [],
  onEdit,
  onAdd,
  removeTenant,
  updateTenantStatus,
  setLocalError,
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(BREAKPOINTS.mobileWide);
  const [loadingTenantId, setLoadingTenantId] = useState(null);

  const handleActionFailure = (err) => {
    const userMessage = translateErrorMessage(err.message || UA.error_action_failed);
    setLocalError(userMessage);
  };

  const handleStatusChange = async (tenant) => {
    if (isLoading || loadingTenantId !== null) return;
    setLoadingTenantId(tenant.id);
    try {
      await updateTenantStatus(tenant.id, !tenant.isActive);
    } catch (err) {
      handleActionFailure(err);
    } finally {
      setLoadingTenantId(null);
    }
  };

  const handleRemove = async (tenant) => {
    if (isLoading || loadingTenantId !== null) return;
    setLoadingTenantId(tenant.id);
    try {
      await removeTenant(tenant.id);
    } catch (err) {
      handleActionFailure(err);
    } finally {
      setLoadingTenantId(null);
    }
  };

  const getTenantLocations = (tenant) => {
    if (!tenant.locations || !Array.isArray(tenant.locations) || tenant.locations.length === 0) {
      return [];
    }
    return tenant.locations.map((loc) => loc.name);
  };

  const filteredTenants = tenants
    .filter((tenant) => {
      if (locationFilter === '') return true;
      if (locationFilter === 'null') return !tenant.locations || tenant.locations.length === 0;
      return tenant.locations.some((loc) => loc.id === Number(locationFilter));
    })
    .filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        (tenant.contactPerson && tenant.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(search.toLowerCase())) ||
        getTenantLocations(tenant).some((locationName) => locationName.toLowerCase().includes(search.toLowerCase()))
    );

  const MobileTenantCard = ({ tenant }) => {
    const isRowLoading = loadingTenantId === tenant.id;
    const isDisabled = loadingTenantId !== null || isLoading;

    return (
      <Card sx={theme.mixins.card}>
        <CardContent sx={theme.mixins.cardContent}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={theme.mixins.mobileCardTitle}>
                {tenant.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTenantLocations(tenant).join(', ') || UA.common_empty_dash}
              </Typography>
            </Box>
            <Chip
              label={tenant.isActive ? UA.status_active : UA.status_inactive}
              color={tenant.isActive ? 'success' : 'default'}
              size="small"
              sx={theme.mixins.chipStatus}
            />
          </Box>

          {tenant.contactPerson && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {UA.tenants_contact_label}: {tenant.contactPerson}
              </Typography>
            </Box>
          )}

          {(tenant.phone || tenant.email) && (
            <Box sx={{ mb: 2 }}>
              {tenant.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{tenant.phone}</Typography>
                </Box>
              )}
              {tenant.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{tenant.email}</Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isRowLoading ? (
                <CircularProgress size={SIZES.circularProgress.medium} />
              ) : (
                <Switch
                  checked={tenant.isActive}
                  onChange={() => handleStatusChange(tenant)}
                  color="primary"
                  size="small"
                  disabled={isDisabled}
                />
              )}
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title={UA.common_edit}>
                <IconButton size="small" onClick={() => onEdit(tenant)} color="primary" disabled={isDisabled}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={tenant.isActive ? UA.tenants_cannot_delete_active : UA.common_delete}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(tenant)}
                    color="error"
                    disabled={tenant.isActive || isDisabled}
                  >
                    {isRowLoading ? (
                      <CircularProgress size={SIZES.circularProgress.small} />
                    ) : (
                      <Delete fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  };

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
          sx={theme.mixins.buttonPrimary}
          disabled={loadingTenantId !== null || isLoading}
        >
          {UA.tenants_add}
        </Button>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
          }}
        >
          <FormControl
            variant="outlined"
            size={FORM_FIELDS.select.size}
            sx={{
              width: isMobile ? '100%' : '200px',
              flexShrink: 0,
            }}
            disabled={isLoading}
          >
            <InputLabel>{UA.meters_location}</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label={UA.meters_location}
            >
              <MenuItem value="">{UA.tenants_all_locations}</MenuItem>
              <MenuItem value="null">{UA.tenants_no_location}</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            placeholder={UA.tenants_search_placeholder}
            sx={{
              width: '100%',
              maxWidth: '100%',
            }}
            disabled={isLoading}
          />
        </Box>
      </Box>

      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {UA.common_found}: {filteredTenants.length} {UA.common_of} {tenants.length}
        </Typography>
      )}

      {isMobile ? (
        <Box>
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => <MobileTenantCard key={tenant.id} tenant={tenant} />)
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" align="center" color="text.secondary">
                  {search ? UA.tenants_not_found_search : UA.tenants_not_found}
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
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>{UA.tenants_title.slice(0, -1)}</TableCell>
                <TableCell sx={{ width: '25%', fontWeight: 600 }}>{UA.tenants_locations}</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>{UA.tenants_contacts}</TableCell>
                <TableCell sx={{ width: '20%', fontWeight: 600 }}>{UA.meters_status}</TableCell>
                <TableCell sx={{ width: '15%', fontWeight: 600 }}>{UA.meters_actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => {
                  const isRowLoading = loadingTenantId === tenant.id;
                  const isDisabled = loadingTenantId !== null || isLoading;

                  return (
                    <TableRow key={tenant.id} sx={theme.mixins.tableRow}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tenant.name}
                          </Typography>
                          {tenant.contactPerson && (
                            <Typography variant="caption" color="text.secondary">
                              {tenant.contactPerson}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        {getTenantLocations(tenant).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            {UA.common_empty_dash}
                          </Typography>
                        ) : (
                          <ul style={{ paddingLeft: '16px', margin: 0, listStyleType: 'disc' }}>
                            {getTenantLocations(tenant).map((loc, idx) => (
                              <li key={idx}>
                                <Typography variant="body2" color="text.secondary">
                                  {loc}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {tenant.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone fontSize="small" color="action" />
                              <Typography variant="caption">{tenant.phone}</Typography>
                            </Box>
                          )}
                          {tenant.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {tenant.email}
                              </Typography>
                            </Box>
                          )}
                          {!tenant.phone && !tenant.email && (
                            <Typography variant="body2" color="text.secondary">
                              {UA.common_empty_dash}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isRowLoading ? (
                            <CircularProgress size={SIZES.circularProgress.medium} />
                          ) : (
                            <Switch
                              checked={tenant.isActive}
                              onChange={() => handleStatusChange(tenant)}
                              color="primary"
                              size="small"
                              disabled={isDisabled}
                            />
                          )}
                          <Chip
                            label={tenant.isActive ? UA.status_active : UA.status_inactive}
                            color={tenant.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={UA.tenants_edit_tooltip}>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(tenant)}
                              color="primary"
                              disabled={isDisabled}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={tenant.isActive ? UA.tenants_deactivate_first : UA.tenants_delete_tooltip}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleRemove(tenant)}
                                disabled={tenant.isActive || isDisabled}
                                color="error"
                              >
                                {isRowLoading ? (
                                  <CircularProgress size={SIZES.circularProgress.small} />
                                ) : (
                                  <Delete fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {UA.tenants_no_available}
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

export default TenantsTable;

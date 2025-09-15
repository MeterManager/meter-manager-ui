import { Container, Typography, Box, CircularProgress, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import ResourceDeliverySection from '../components/resource-deliveries/ResourceDeliverySection';
import ResourceTypesSection from '../components/resourceTypes/ResourceTypesSection';
import TariffsSection from '../components/tariffs/TariffsSection';
import MetersSection from '../components/meters/MetersSection';
import MeterTenantsSection from '../components/meter-tenants/MeterTenantsSection';
import UsersSection from '../components/users/UsersSection';
import { useAuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { section } = useParams();
  const { isAdmin, loading: authLoading } = useAuthContext();

  if (!isAdmin && !authLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" align="center" sx={{ my: 4 }}>
          У вас немає доступу до дашборду
        </Typography>
      </Container>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'locations':
        return <LocationsSection initialExpanded={true} />;
      case 'resource-types':
        return <ResourceTypesSection initialExpanded={true} />;
      case 'tenants':
        return <TenantsSection initialExpanded={true} />;
      case 'resource-delivery':
        return <ResourceDeliverySection initialExpanded={true} />;
      case 'tariffs':
        return <TariffsSection initialExpanded={true} />;
      case 'meters':
        return <MetersSection initialExpanded={true} />;
      case 'meter-tenants':
        return <MeterTenantsSection initialExpanded={true} />;
      case 'users':
        return <UsersSection initialExpanded={true} />;
      default:
        return (
          <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap">
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <LocationsSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <ResourceTypesSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <TenantsSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <ResourceDeliverySection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <TariffsSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <MetersSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <MeterTenantsSection initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <UsersSection initialExpanded={false} />
            </Box>
          </Stack>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        align="center"
        sx={{
          my: 4,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
        }}
      >
        Панель керування
      </Typography>
      {authLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderSection()
      )}
    </Container>
  );
};

export default DashboardPage;
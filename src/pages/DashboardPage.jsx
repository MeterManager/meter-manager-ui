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
import { useLocations } from '../hooks/useLocations';
import { useTenants } from '../hooks/useTenants';
import { useMeters } from '../hooks/useMeters';
import { useResourceTypes } from '../hooks/useResourceTypes';
import { useAuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { section } = useParams();
  const { isAdmin, loading: authLoading } = useAuthContext();
  const locationsHook = useLocations();
  const resourceTypesHook = useResourceTypes();
  const tenantsHook = useTenants();
  const metersHook = useMeters();

  const loading = authLoading || locationsHook.loading || resourceTypesHook.loading || metersHook.loading;

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
        return <TenantsSection locations={locationsHook.activeLocations} initialExpanded={true} />;
      case 'resource-delivery':
        return (
          <ResourceDeliverySection
            locations={locationsHook.activeLocations}
            resourceTypes={resourceTypesHook.activeResourceTypes}
            initialExpanded={true}
          />
        );
      case 'tariffs':
        return (
          <TariffsSection
            initialExpanded={true}
            locations={locationsHook.activeLocations}
            resourceTypes={resourceTypesHook.activeResourceTypes}
          />
        );
      case 'meters':
        return (
          <MetersSection
            initialExpanded={true}
            locations={locationsHook.activeLocations}
            energyResourceTypes={resourceTypesHook.activeResourceTypes}
          />
        );
      case 'meter-tenants':
        return (
          <MeterTenantsSection
            tenants={tenantsHook.activeTenants}
            meters={metersHook.activeMeters}
            initialExpanded={true}
          />
        );
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
              <TenantsSection locations={locationsHook.activeLocations} initialExpanded={false} />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <ResourceDeliverySection
                locations={locationsHook.activeLocations}
                resourceTypes={resourceTypesHook.activeResourceTypes}
                initialExpanded={false}
              />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <TariffsSection
                initialExpanded={false}
                locations={locationsHook.activeLocations}
                resourceTypes={resourceTypesHook.activeResourceTypes}
              />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <MetersSection
                initialExpanded={false}
                locations={locationsHook.activeLocations}
                energyResourceTypes={resourceTypesHook.activeResourceTypes}
              />
            </Box>
            <Box flex={1} minWidth={{ xs: '100%', md: '300px' }}>
              <MeterTenantsSection
                tenants={tenantsHook.activeTenants}
                meters={metersHook.activeMeters}
                initialExpanded={false}
              />
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
      {loading ? (
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

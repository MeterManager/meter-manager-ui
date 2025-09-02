import { Container, Typography, Box, CircularProgress, Stack } from '@mui/material';
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" sx={{ my: 4 }}>
        Панель керування
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <LocationsSection initialExpanded={false} />
          <ResourceTypesSection initialExpanded={false} />
          <TenantsSection locations={locationsHook.activeLocations}  initialExpanded={false} />
          <ResourceDeliverySection
            locations={locationsHook.activeLocations} 
            resourceTypes={resourceTypesHook.activeResourceTypes}
            initialExpanded={false}
          />
          <TariffsSection
            initialExpanded={false}
            locations={locationsHook.activeLocations}
            resourceTypes={resourceTypesHook.activeResourceTypes}
          />

          <MetersSection
            initialExpanded={false}
            locations={locationsHook.activeLocations}
            energyResourceTypes={resourceTypesHook.activeResourceTypes}
          />
          <MeterTenantsSection tenants={tenantsHook.activeTenants} meters={metersHook.activeMeters} initialExpanded={false} />
          <UsersSection initialExpanded={false} />
        </Stack>
      )}
    </Container>
  );
};

export default DashboardPage;

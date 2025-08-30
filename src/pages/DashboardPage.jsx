import { Container, Typography, Box, CircularProgress, Stack } from '@mui/material';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import ResourceTypesSection from '../components/resourceTypes/ResourceTypesSection';
import TariffsSection from '../components/tariffs/TariffsSection';
import UsersSection from '../components/users/UsersSection';
import { useLocations } from '../hooks/useLocations';
import { useResourceTypes } from '../hooks/useResourceTypes';

const DashboardPage = () => {
  const locationsHook = useLocations();
  const resourceTypesHook = useResourceTypes();

  const loading = locationsHook.loading || resourceTypesHook.loading;

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
          <TenantsSection locations={locationsHook.locations} initialExpanded={false} />
          <TariffsSection
            initialExpanded={false}
            locations={locationsHook.locations}
            resourceTypes={resourceTypesHook.resourceTypes}
          />
          <UsersSection initialExpanded={false} />
        </Stack>
      )}
    </Container>
  );
};

export default DashboardPage;

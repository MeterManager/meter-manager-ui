import { Container, Typography, Box } from '@mui/material';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import ResourceDeliverySection from '../components/resource-deliveries/ResourceDeliverySection';
import { useLocations } from '../hooks/useLocations';
import { useResourceTypes } from '../hooks/useResourceTypes';

const DashboardPage = () => {
  const { locations } = useLocations();
  const { resourceTypes } = useResourceTypes();

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" sx={{ my: 4 }}>
        Панель керування
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LocationsSection initialExpanded={false} />
        <TenantsSection locations={locations} initialExpanded={false} />
        <ResourceDeliverySection locations={locations} resourceTypes={resourceTypes} initialExpanded={false} />
      </Box>
    </Container>
  );
};

export default DashboardPage;

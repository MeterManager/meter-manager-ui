import { Container, Typography, Box } from '@mui/material';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import ResourceDeliverySection from '../components/resource-deliveries/ResourceDeliverySection';
import ResourceTypesSection from '../components/resourceTypes/ResourceTypesSection';
import TariffsSection from '../components/tariffs/TariffsSection';
import MetersSection from '../components/meters/MetersSection';
import MeterTenantsSection from '../components/meter-tenants/MeterTenantsSection';
import { useLocations } from '../hooks/useLocations';
import { useTenants } from '../hooks/useTenants';
import { useMeters } from '../hooks/useMeters';
import { useResourceTypes } from '../hooks/useResourceTypes';

const DashboardPage = () => {
  const { locations } = useLocations();
  const { resourceTypes } = useResourceTypes();
  const { tenants } = useTenants();
  const { meters } = useMeters();

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" sx={{ my: 4 }}>
        Панель керування
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LocationsSection initialExpanded={false} />
        <ResourceTypesSection initialExpanded={false} />
        <TenantsSection locations={locations} initialExpanded={false} />
        <ResourceDeliverySection locations={locations} resourceTypes={resourceTypes} initialExpanded={false} />
        <TariffsSection initialExpanded={false}  locations={locations} resourceTypes={resourceTypes}  />
        <MetersSection 
          initialExpanded={false} 
          locations={locations}
          energyResourceTypes={[]}
        />
        <TenantsSection locations={locations} initialExpanded={false} />
        <MeterTenantsSection 
          tenants={tenants} 
          meters={meters} 
          initialExpanded={false} 
        />
      </Box>
    </Container>
  );
};

export default DashboardPage;

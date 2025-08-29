import { Container, Typography, Box } from '@mui/material';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import MetersSection from '../components/meters/MetersSection';
import MeterTenantsSection from '../components/meter-tenants/MeterTenantsSection';
import { useLocations } from '../hooks/useLocations';
import { useTenants } from '../hooks/useTenants';
import { useMeters } from '../hooks/useMeters';

const DashboardPage = () => {
  const { locations } = useLocations();
  const { tenants } = useTenants();
  const { meters } = useMeters();

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" sx={{ my: 4 }}>
        Панель керування
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LocationsSection initialExpanded={false} />
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

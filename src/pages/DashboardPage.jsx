import { Container, Typography, Box } from '@mui/material';
import LocationsSection from '../components/locations/LocationsSection';
import TenantsSection from '../components/tenants/TenantsSection';
import { useLocations } from '../hooks/useLocations';

const DashboardPage = () => {
  const { locations } = useLocations();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Панель керування
      </Typography>

      <Box sx={{ mb: 4 }}>
        <LocationsSection initialExpanded={true} />
        <TenantsSection locations={locations} initialExpanded={true} />
      </Box>
    </Container>
  );
};

export default DashboardPage;

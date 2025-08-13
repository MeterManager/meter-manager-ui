import { useState, useEffect } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import LocationsTable from '../components/locations/LocationsTable';
import LocationForm from '../components/locations/LocationForm';
import { useLocations } from '../hooks/useLocations';

const LocationsPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState({});
  const [localError, setLocalError] = useState(null);

  const { locations, search, setSearch, addLocation, editLocation, removeLocation, updateLocationStatus, error } =
    useLocations();

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleAdd = () => {
    setEditData({});
    setOpenForm(true);
  };

  const handleEdit = (data) => {
    setEditData(data);
    setOpenForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (data.id) {
        await editLocation(data.id, data);
      } else {
        await addLocation(data);
      }
      setOpenForm(false);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.message || 'Помилка при збереженні локації');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Керування локаціями
      </Typography>

      <LocationsTable
        onEdit={handleEdit}
        onAdd={handleAdd}
        locations={locations}
        removeLocation={removeLocation}
        updateLocationStatus={updateLocationStatus}
        search={search}
        setSearch={setSearch}
        setLocalError={setLocalError}
      />

      <LocationForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setLocalError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editData}
        error={localError}
        locations={locations}
      />

      <Snackbar
        open={!!localError}
        autoHideDuration={6000}
        onClose={() => setLocalError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setLocalError(null)} sx={{ width: '100%' }}>
          {localError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LocationsPage;

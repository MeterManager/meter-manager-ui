import { Button, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ActsTable from '../components/acts/ActsTable';
import { useState } from 'react';

export default function ActsPage() {
  const [acts, setActs] = useState([]);

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <ActsTable acts={acts} />
    </Container>
  );
}

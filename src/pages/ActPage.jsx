import { Button, Container, Typography } from "@mui/material";
import ActsTable from "../components/acts/ActsTable";
import { useState } from "react";

export default function ActsPage() {
  const [acts, setActs] = useState([]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Акти
      </Typography>
      <Button variant="contained" color="primary" >
        Згенерувати акт
      </Button>
      <ActsTable acts={acts} />
    </Container>
  );
}

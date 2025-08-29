import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import TariffsTable from "../tariffs/TariffsTable";
import TariffForm from "../tariffs/TariffForm";
import { useTariffs } from "../../hooks/useTariffs";
import SearchField from '../ui/SearchField'; 

const TariffsSection = ({ initialExpanded = true, locations, resourceTypes }) => {
  const {
    tariffs,
    search, 
    setSearch, 
    addTariff,
    editTariff,
    removeTariff,
    error,
    setError,
  } = useTariffs();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    setEditingTariff(null);
    setFormOpen(true);
  };

  const handleEdit = (tariff) => {
    console.log("TariffsSection handleEdit:", tariff);
    setEditingTariff(tariff);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    console.log("TariffsSection handleFormSubmit:", formData);
    try {
      if (editingTariff?.id) {
        console.log("Updating tariff:", editingTariff.id, formData);
        await editTariff(editingTariff.id, formData);
      } else {
        console.log("Adding new tariff:", formData);
        await addTariff(formData);
      }
      setFormOpen(false);
      setEditingTariff(null);
    } catch (err) {
      console.error("Error in handleFormSubmit:", err);
      setError(err.message || "Помилка при збереженні тарифу");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTariff(null);
  };

  const handleRemove = async (id) => {
    try {
      await removeTariff(id);
    } catch (err) {
      setError(err.message || "Помилка при видаленні тарифу");
    }
  };
  const locationsMap = locations?.reduce((acc, loc) => {
    acc[loc.id] = loc.name;
    return acc;
  }, {}) || {};
  
  const resourceTypesMap = resourceTypes?.reduce((acc, rt) => {
    acc[rt.id] = rt.name;
    return acc;
  }, {}) || {};

  return (
    <>
      <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            },
          }}
          onClick={handleToggle}
        >
          <Typography variant="h5">Тарифи ({tariffs.length})</Typography>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Divider />

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 3 }}>
            <TariffsTable
              tariffs={tariffs}
              search={search} 
              setSearch={setSearch} 
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleRemove}
              setLocalError={setError}
              locationsMap={locationsMap}
              resourceTypesMap={resourceTypesMap}
            />
          </Box>
        </Collapse>
      </Paper>

      <TariffForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingTariff || {}}
        error={error}
        locations={locations}
        resourceTypes={resourceTypes}
      />
    </>
  );
};

export default TariffsSection;

import { useState, useEffect, useMemo } from "react"; 
import {
  Paper, Box, Typography, Collapse, IconButton,
  Divider, Dialog, DialogTitle, DialogContent, Button,
  TextField, 
} from "@mui/material";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import SearchField from "../ui/SearchField";
import MeterReadingsTable from "./MeterReadingsTable";
import MeterReadingForm from "./MeterReadingForm";
import { useMeterReadings } from "../../hooks/useMeterReadings";
import CustomDatePicker from "../ui/DatePicker";

const MeterReadingsSection = ({ initialExpanded = true }) => {
  const { meterReadings, loading, fetchReadings, removeReading, addReading, editReading, error, setError } =
    useMeterReadings();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [formOpen, setFormOpen] = useState(false);
  const [readingToEdit, setReadingToEdit] = useState(null);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [orderBy, setOrderBy] = useState("reading_date");
  const [order, setOrder] = useState("desc");

  // useEffect(() => {
  //   fetchReadings();
  // }, [fetchReadings]);

  const handleToggle = () => setExpanded(!expanded);
  const handleOpenForm = (reading = null) => {
    setReadingToEdit(reading);
    setFormOpen(true);
  };
  const handleDelete = async (id) => {
    try {
      await removeReading(id);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      if (readingToEdit) {
        await editReading(readingToEdit.id, formData);
      } else {
        await addReading(formData);
      }
  
      setFormOpen(false);
      setReadingToEdit(null);

      // await fetchReadings();  
    } catch (err) {
      console.error("Помилка:", err);
    }
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setReadingToEdit(null);
  };

  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const sortedFilteredReadings = useMemo(() => {
    return meterReadings
      .filter((r) => {
        const tenantName = r.MeterTenant?.Tenant?.name || '';
        const meterSerial = r.MeterTenant?.Meter?.serial_number || '';
        const query = search.toLowerCase();
        
        const matchesSearch =
          tenantName.toLowerCase().includes(query) ||
          meterSerial.toLowerCase().includes(query) ||
          r.reading_date.includes(query);

        const matchesDate = !dateFilter || r.reading_date.startsWith(dateFilter);

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        let valA = a[orderBy];
        let valB = b[orderBy];

        if (orderBy === "reading_date") {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
  }, [meterReadings, search, dateFilter, orderBy, order]);

  return (
    <>
      <Paper sx={{ borderRadius: 2, mb: 3 }} elevation={1}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}
          onClick={handleToggle}
        >
          <Typography variant="h5" fontWeight={600}>
            Показники ({meterReadings.length})
          </Typography>
          <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>
        <Divider />
        <Collapse in={expanded} timeout="auto">
          <Box p={3}>
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
               
              }}
            >
              <Button variant="contained" onClick={() => handleOpenForm()}>
                Додати показник
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2,  ml: "auto", }}>
                <SearchField
                  placeholder="Пошук за орендарем або лічильником"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <CustomDatePicker
                  value={dateFilter || null}
                  onChange={(newValue) => setDateFilter(newValue || '')}
                  label="Фільтр по даті"
                  sx={{ ml: "auto", minWidth: 200 }}
                />
              </Box>
            </Box>
            <MeterReadingsTable
              readings={sortedFilteredReadings}
              onDelete={handleDelete}
              onEdit={handleOpenForm}
              orderBy={orderBy}
              order={order}
              handleSort={handleSort}
            />
          </Box>
        </Collapse>
      </Paper>

      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{readingToEdit ? "Редагувати показник" : "Додати показник"}</DialogTitle>
        <DialogContent>
          <MeterReadingForm
            initialData={readingToEdit}
            onSuccess={(response) => {
              handleFormSubmit(response);  
              setFormOpen(false);         
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};



export default MeterReadingsSection;
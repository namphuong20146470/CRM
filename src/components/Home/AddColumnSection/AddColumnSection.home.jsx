import React from "react";
import { Box, TextField, Button } from "@mui/material";

function AddColumnSection({ newField, setNewField, handleAddColumn, isMobile }) {
  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <TextField
        label="Nhập tên trường mới"
        variant="outlined"
        value={newField}
        onChange={(e) => setNewField(e.target.value)}
        sx={{
          flex: 1,
          "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddColumn}
        sx={{
          minWidth: { xs: "100%", sm: 150 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          py: 1,
        }}
      >
        Thêm trường
      </Button>
    </Box>
  );
}

export default AddColumnSection;
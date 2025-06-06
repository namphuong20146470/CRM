import React from "react";
import { Box, TextField, Button } from "@mui/material";

function SearchBar({ searchId, setSearchId, handleFilterClick, isMobile }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        label="Tìm kiếm theo ID Thiết Bị"
        variant="outlined"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        sx={{
          flex: 1,
          maxWidth: { xs: "100%", sm: 500 },
          backgroundColor: "#fff",
          "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
        }}
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={handleFilterClick}
        sx={{
          minWidth: { xs: "100%", sm: 100 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          px: 2,
          py: 1,
        }}
      >
        Filter
      </Button>
    </Box>
  );
}

export default SearchBar;
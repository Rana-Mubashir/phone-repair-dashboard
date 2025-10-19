import React, { useEffect, useState } from "react";
import { Button, Grid, Typography, Box, TextField } from "@mui/material";
import CategoryCard from "./CategoryCard";
import CategoryDrawer from "src/components/drawer/CategoryDrawer";
import axios from "axios";

function Index() {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllCategories();
  }, [searchTerm]);

  async function getAllCategories() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/category/getall?categoryName=${searchTerm}`);
      if (res) {
        setCategories(res?.data?.categories);
      }
    } catch (error) {
      console.log("Error in getting categories", error);
    }
  }

  return (
    <>
      {
        isDrawerOpen && (
          <CategoryDrawer
            open={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            getAllCategories={getAllCategories}
          />
        )
      }

      <Box sx={{ width: "100%", p: 3 }}>

        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Category Settings
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" p={2}>
          <TextField
            label="Search Category"
            variant="outlined"
            fullWidth
            sx={{ maxWidth: 400 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </Box>

        <Box display="flex" justifyContent="flex-end" p={2}>
          <Button variant="contained" color="primary" onClick={() => setIsDrawerOpen(true)}>
            Add Category
          </Button>
        </Box>

        <Grid container spacing={3}>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
                <CategoryCard
                  id={category._id}
                  name={category?.name}
                  image={category?.image}
                  description={category?.description}
                  getAllCategories={getAllCategories}
                />
              </Grid>
            ))
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", width: "100%", mt: 2 }}>
              No Categories Found
            </Typography>
          )}
        </Grid>
      </Box>
    </>
  );
}

export default Index;

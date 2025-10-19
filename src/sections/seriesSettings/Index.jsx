import React, { useEffect, useState } from "react";
import { Button, Grid, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import SeriesDrawer from "src/components/drawer/SeriesDrawer";
import SeriesCard from "./SeriesCard";
import axios from "axios";

function Index() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [data, setData] = useState(null)

  const [categories, setCategories] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    getCategories()
    getSeriesData("")
  }, [])

  async function getSeriesData(categoryId) {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/series/get?categoryId=${categoryId}`)
      if (resp) {
        setData(resp?.data?.data)
      }
    } catch (error) {
      console.log("error in getting series data", error)
    }
  }

  async function getCategories() {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/category/getall`);
      if (resp?.data?.categories) {
        setCategories(resp.data.categories);
      }
    } catch (error) {
      console.log("Error in getting categories", error);
    }
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    getSeriesData(categoryId);
  };


  return (
    <>

      {
        isDrawerOpen && (
          <SeriesDrawer
            open={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            getSeriesData={getSeriesData}
          />
        )
      }
      <Box sx={{ width: "100%", p: 3 }}>

        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Series Settings
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" m={3}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Select Category</InputLabel>
            <Select value={selectedCategory} onChange={handleCategoryChange} displayEmpty>
              <MenuItem value="">All Categories</MenuItem>
              {categories && categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="flex-end" p={2}>
          <Button variant="contained" color="primary" onClick={() => setIsDrawerOpen(true)}>
            Add Series
          </Button>
        </Box>

        {data && data.length > 0 ? (
          data.map((category) => (
            <Box key={category._id} sx={{ mt: 4 }}>
              <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 2 }}>
                {category?.name}
              </Typography>

              {category?.brands.map((brand) => (
                brand?.series.length > 0 && (
                  <Box key={brand._id} sx={{ mb: 3 }}>

                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 5, ml: 2 }}>
                      {brand?.name}
                    </Typography>

                    <Grid container spacing={3}>
                      {brand?.series.map((series, index) => (
                        <SeriesCard
                          key={index}
                          series={series}
                          getSeriesData={getSeriesData}
                        />
                      ))}
                    </Grid>
                  </Box>
                )
              ))}
            </Box>
          ))
        ) : (
          <Typography variant="h6" sx={{ textAlign: "center", width: "100%", mt: 2 }}>
            No Series Found
          </Typography>
        )}
      </Box>
    </>
  );
}

export default Index;

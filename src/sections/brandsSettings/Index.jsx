import React, { useEffect, useState } from "react";
import { Button, Typography, Grid, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import BrandCard from "../../sections/brandsSettings/BrandCard";
import BrandsDrawer from "src/components/drawer/BrandsDrawer";
import axios from "axios";

function Index() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [brands, setBrands] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        getCategories();
        getBrands("");
    }, []);

    async function getCategories(){
        try {
            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/category/getall`);
            if (resp?.data?.categories) {
                setCategories(resp.data.categories);
            }
        } catch (error) {
            console.log("Error in getting categories", error);
        }
    };

    async function getBrands(categoryId) {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/brand/getall?categoryId=${categoryId}`);
            if (resp) {
                setBrands(resp?.data?.brands);
            }
        } catch (error) {
            console.log("Error in getting brands", error);
        }
    };

    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategory(categoryId);
        getBrands(categoryId);
    };

    return (
        <>
            {isDrawerOpen && (
                <BrandsDrawer open={isDrawerOpen} setIsOpen={setIsDrawerOpen} getBrands={() => getBrands(selectedCategory)} categories={categories} />
            )}

            <Box sx={{ width: "100%", p: 3 }}>

                <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
                    <Typography variant="h3" fontWeight="bold">
                        Brands Settings
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="center" mb={3}>
                    <FormControl sx={{ minWidth: 300 }}>
                        <InputLabel>Select Category</InputLabel>
                        <Select value={selectedCategory} onChange={handleCategoryChange} displayEmpty>
                            <MenuItem value=""  >All Categories</MenuItem>
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
                        Add Brand
                    </Button>
                </Box>

                {brands  ?
                    brands.map((bran, index) =>
                        bran?.brands.length > 0 ? (
                            <Box key={bran._id} sx={{ mb: 5 }}>
                                <Box display="flex" mb={2}>
                                    <Typography variant="h4" fontWeight="bold">
                                        {index + 1}: {bran?.name}
                                    </Typography>
                                </Box>

                                <Grid container spacing={3} justifyContent="center">
                                    {bran?.brands.map((brand) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={brand._id}>
                                            <BrandCard brandData={brand} getBrands={() => getBrands(selectedCategory)} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : null
                    )
                    :
                    <p>No Brands In This Category</p>
                }   
            </Box>
        </>
    );
}

export default Index;

import React, { useEffect, useState } from 'react';
import { Drawer, Button, TextField, Box, Typography, IconButton, FormControl, InputLabel, MenuItem, Select } from
    '@mui/material';
import { useDropzone } from "react-dropzone";
import { FiX } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import handleImageUpload from 'src/hooks/imageKitUploader';
import { toast } from 'react-toastify';

const SeriesDrawer = ({ open, setIsOpen, getSeriesData, seriesData }) => {

    const { register, handleSubmit, setValue } = useForm()

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null)

    const [categories, setCategories] = useState(null)
    const [brands, setBrands] = useState()

    const [loading, setLoading] = useState(false)

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedBrand,setSelectedBrand]=useState(null)

    useEffect(() => {
        getCategories()
        setValue("name", seriesData?.name)
        setValue("brandId", seriesData?.brandId)
        setSelectedBrand(seriesData?.brandId)
        setSelectedImage(seriesData?.image)
    }, [])

    async function getCategories() {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/category/getall`)
            if (resp) {
                console.log("response for getting categories", resp?.data?.categories)
                setCategories(resp?.data?.categories)
            }
        } catch (error) {
            console.log("error in getting categories", error)
        }
    }

    async function getBrands(id) {
        setSelectedCategory(id)
        try {
            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/brand/getbycategory/${id}`)
            if (resp) {
                console.log("response for brands", resp)
                setBrands(resp?.data?.brands[0]?.brands)
            }
        } catch (error) {
            console.log("error in getting brands", error)
        }
    }

    const handleAdd = async (data) => {
        setLoading(true)
        try {
            let image = null
            if (imageFile) {
                image = await handleImageUpload(imageFile)
            }
            const values = {
                ...data,
                image
            }
            const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/series/create`, values)
            if (resp) {
                getSeriesData()
                toast.success(resp?.data?.message)
                onClose()
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log("error in series brand", error)
            setLoading(false)
        }
    }

    const handleUpdate = async (data) => {
        setLoading(true)
        try {

            let image = selectedImage
            if (imageFile) {
                image = await handleImageUpload(imageFile)
            }
            const values = {
                ...data,
                image
            }
            const resp = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/brand/update/${seriesData._id}`, values)
            if (resp) {
                toast.success(resp?.data?.message)
                console.log("resp category addition", resp)
                getBrands()
                onClose()
            }
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data?.message)
            console.log("error in adding brand", error)
        }
    }

    const onClose = () => {
        setIsOpen(false)
        setValue("name", null)
        setSelectedImage(null)
        setValue("categoryId", "Select Category")
        setSelectedBrand(null)
        setSelectedCategory(null)
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImageFile(file)
            setSelectedImage(imageUrl);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            const imageUrl = URL.createObjectURL(acceptedFiles[0]);
            setSelectedImage(imageUrl);
            setImageFile(acceptedFiles[0])
        },
    });

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>

            <Box sx={{ width: 380, p: 3 }}>
                <Typography variant="h6" style={{
                    marginBottom: '30px'
                }}>{seriesData ? 'Update Series' : 'Add Series'}</Typography>

                <Box sx={{ textAlign: "center", p: 3, border: "2px dashed #ccc", borderRadius: 2 }}>
                    <Box {...getRootProps()} sx={{ cursor: "pointer", p: 2 }}>
                        <input {...getInputProps()} />
                        <Typography variant="body2" color="textSecondary">
                            Drag & drop an image here, or click to select one
                        </Typography>
                    </Box>

                    {selectedImage && (
                        <Box sx={{ position: "relative", mt: 2, display: "inline-block" }}>
                            {/* Close Button */}
                            <IconButton
                                onClick={() => setSelectedImage(null)}
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    background: "#fff",
                                    color: "#f44336",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                    "&:hover": { background: "#f44336", color: "#fff" },
                                }}
                            >
                                <FiX size={20} />
                            </IconButton>

                            <img
                                src={selectedImage}
                                alt="Selected"
                                style={{
                                    width: "100%",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                }}
                            />
                        </Box>
                    )}

                    <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
                        Select Image
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                </Box>

                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                        labelId="category-select-label"
                        {...register("categoryId", { required: "Category is required" })}
                        value={selectedCategory || ""} // Ensure value is controlled
                        onChange={(e) => getBrands(e.target.value)}
                        displayEmpty
                        sx={{
                            background: "#fff",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                        }}
                    >
                        {categories &&
                            categories.map((cat) => (
                                <MenuItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="category-select-label">Brand</InputLabel>
                    <Select
                        labelId="category-select-label"
                        {...register("brandId", { required: "Brand is required" })}
                        value={selectedBrand || ""} // Ensure value is controlled
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        displayEmpty
                        sx={{
                            background: "#fff",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                        }}
                    >
                        {brands &&
                            brands.map((cat) => (
                                <MenuItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth margin="normal"
                    label="Series Name"
                    name="seriesName"
                    style={{
                        marginTop: '30px'
                    }}
                    {...register("name", { required: "Brand name is required" })}
                />

                <Button disabled={loading} variant="contained" color="primary" fullWidth style={{
                    marginTop: '20px'
                }}
                    onClick={() =>
                        seriesData ? handleSubmit(handleUpdate)() : handleSubmit(handleAdd)()
                    }
                >
                    {loading ? "Processing" : seriesData ? 'Update' : 'Add'}
                </Button>
            </Box>
        </Drawer>
    );
};


export default SeriesDrawer;

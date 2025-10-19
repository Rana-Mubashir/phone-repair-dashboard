import React, { useEffect, useState } from 'react';
import { Drawer, Button, TextField, Box, Typography, IconButton, FormControl, InputLabel, MenuItem, Select } from
    '@mui/material';
import { useDropzone } from "react-dropzone";
import { FiX } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import handleImageUpload from 'src/hooks/imageKitUploader';
import { toast } from 'react-toastify';

const BrandsDrawer = ({ open, setIsOpen, getBrands, brandData,categories  }) => {

    const { register, handleSubmit, setValue, watch } = useForm()

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const selectedCategory = watch("categoryId");

    useEffect(() => {
        setValue("name", brandData?.name)
        setValue("categoryId", brandData?.categoryId)
        setSelectedImage(brandData?.image)
    }, [])

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
            const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/brand/create`, values)
            if (resp) {
                toast.success(resp?.data?.message)
                getBrands()
                onClose()
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log("error in adding brand", error)
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
            const resp = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/brand/update/${brandData._id}`, values)
            if (resp) {
                toast.success(resp?.data?.message)
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
                }}>{brandData ? 'Update Brand' : 'Add Brand'}</Typography>

                <Box sx={{ textAlign: "center", p: 3, border: "2px dashed #ccc", borderRadius: 2 }}>
                    <Box {...getRootProps()} sx={{ cursor: "pointer", p: 2 }}>
                        <input {...getInputProps()} />
                        <Typography variant="body2" color="textSecondary">
                            Drag & drop an image here, or click to select one
                        </Typography>
                    </Box>

                    {selectedImage && (
                        <Box sx={{ position: "relative", mt: 2, display: "inline-block" }}>
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

                <TextField
                    fullWidth margin="normal"
                    label="Brand Name"
                    name="brandName"
                    style={{
                        marginTop: '30px'
                    }}
                    {...register("name", { required: "Brand name is required" })}
                />

                <Button disabled={loading} variant="contained" color="primary" fullWidth style={{
                    marginTop: '20px'
                }}
                    onClick={() =>
                        brandData ? handleSubmit(handleUpdate)() : handleSubmit(handleAdd)()
                    }
                >
                    {loading ? "Processing" : brandData ? 'Update' : 'Add'}
                </Button>
            </Box>
        </Drawer>
    );
};


export default BrandsDrawer;

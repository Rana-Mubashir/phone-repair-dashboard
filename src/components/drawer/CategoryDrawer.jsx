import React, { useEffect, useState } from 'react';
import { Drawer, Button, TextField, Box, Typography, IconButton } from'@mui/material';
import { useDropzone } from "react-dropzone";
import { FiX } from "react-icons/fi";
import handleImageUpload from '../../hooks/imageKitUploader';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';


const CategoryDrawer = ({ open, setIsOpen, categoryData, getAllCategories }) => {

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        setValue('name', categoryData?.name)
        setValue('description', categoryData?.description)
        setSelectedImage(categoryData?.image || null)
    }, [categoryData])

    const onClose = () => {
        setIsOpen(false)
        setSelectedImage(null)
        setValue('name', '')
        setValue('description', '')
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setImageFile(file)
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            setImageFile(acceptedFiles[0])
            const imageUrl = URL.createObjectURL(acceptedFiles[0]);
            setSelectedImage(imageUrl);
        },
    });

    const handleAdd = async (values) => {
        try {
            setLoading(true)
            let imageUrl = null
            if (imageFile) {
                imageUrl = await handleImageUpload(imageFile)
            }
            const data = {
                ...values,
                image: imageUrl
            }
            const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/category/create`, data)
            if (resp) {
                getAllCategories()
                onClose()
                setLoading(false)
                toast.success(resp?.data?.message)
            }
        } catch (error) {
            onClose()
            setLoading(false)
            toast.error(error?.response?.data?.message)
            console.log("error in creating category", error)
        }
    };

    const handleUpdate = async (values) => {
        try {
            setLoading(true)
            let imageUrl = null
            if (imageFile) {
                imageUrl = await handleImageUpload(imageFile)
            }
            const data = {
                ...values,
                image: imageUrl ? imageUrl : selectedImage
            }
            const resp = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/category/update/${categoryData?._id}`, data)
            if (resp) {
                toast.success(resp?.data?.message)
                onClose()
                getAllCategories()
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            close()
            toast.error(error?.response?.data?.message)
            console.log("error in updating category", error)
        }
    }

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>

            <Box sx={{ width: 380, p: 3 }}>
                <Typography variant="h6" style={{
                    marginBottom: '30px'
                }}>{categoryData ? 'Update Category' : 'Add Category'}</Typography>

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

                <TextField
                    fullWidth
                    margin="normal"
                    label="Category Name"
                    {...register("name", { required: "Category Name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    style={{ marginTop: "30px" }}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Category Description"
                    {...register("description", { required: "Category Description is required" })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    multiline
                    rows={4}
                    style={{ marginTop: "30px" }}
                />

                <Button variant="contained" color="primary"
                    onClick={() =>
                        categoryData ? handleSubmit(handleUpdate)() : handleSubmit(handleAdd)()
                    }
                    fullWidth
                    disabled={loading}
                    style={{
                        marginTop: '20px'
                    }}>
                    {categoryData ? 'Update' : 'Add'}
                </Button>
            </Box>
        </Drawer>
    );
};

export default CategoryDrawer;

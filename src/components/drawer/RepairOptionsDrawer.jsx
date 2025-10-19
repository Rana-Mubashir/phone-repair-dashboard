import React, { useEffect, useState } from 'react';
import {
    Drawer, Button, TextField, Box, Typography, IconButton,
    FormControl, InputLabel, MenuItem, Select
} from '@mui/material';
import { useDropzone } from "react-dropzone";
import { FiX } from "react-icons/fi";
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import handleImageUpload from 'src/hooks/imageKitUploader';
import { toast } from 'react-toastify';

const RepairOptionsDrawer = ({ open, setIsOpen, getRepairOptions, deviceId, repairData, setEditRepairOptionData }) => {

    const { register, handleSubmit, setValue, control, reset } = useForm();

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const estimatedTimeData = [
        { _id: "15-min", name: "15 Minutes" },
        { _id: "30-min", name: "30 Minutes" },
        { _id: "1-hr", name: "1 Hour" },
        { _id: "2-hr", name: "2 Hours" },
        { _id: "same-day", name: "Same Day" },
        { _id: "2-days", name: "2 Days" }
    ];

    const warrantyData = [
        { _id: "no-warranty", name: "No Warranty" },
        { _id: "7-days", name: "7 Days" },
        { _id: "15-days", name: "15 Days" },
        { _id: "1-month", name: "1 Month" },
        { _id: "3-months", name: "3 Months" },
        { _id: "6-months", name: "6 Months" },
        { _id: "1-year", name: "1 Year" },
    ];

    useEffect(() => {
        if (repairData) {
            reset({
                name: repairData?.name || '',
                description: repairData?.description || '',
                price: repairData?.price || '',
                warranty: repairData?.warranty || '',
                estimatedTime: repairData?.estimatedTime || '',
            });
            setSelectedImage(repairData?.image || null);
        } else {
            reset({
                name: '',
                description: '',
                price: '',
                warranty: '',
                estimatedTime: '',
            });
            setSelectedImage(null);
        }
    }, [repairData, reset]);

    const handleAdd = async (data) => {
        setLoading(true);
        try {
            let image = null;
            if (imageFile) {
                image = await handleImageUpload(imageFile);
            }
            const values = { ...data, deviceId, image };
            const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/repairoptions/create`, values);
            if (resp) {
                getRepairOptions();
                toast.success(resp?.data?.message);
                onClose();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.error("Add Repair Option Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data) => {
        setLoading(true);
        try {
            let image = selectedImage;
            if (imageFile) {
                image = await handleImageUpload(imageFile);
            }
            const values = { ...data, image };
            const resp = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/repairoptions/update/${repairData._id}`, values);
            if (resp) {
                toast.success(resp?.data?.message);
                getRepairOptions();
                onClose();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.error("Update Repair Option Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onClose = () => {
        setIsOpen(false);
        setSelectedImage(null);
        setImageFile(null);
        setEditRepairOptionData(null);
        reset();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                setImageFile(file);
                setSelectedImage(URL.createObjectURL(file));
            }
        },
    });

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 580, p: 3 }}>
                <Typography variant="h6" mb={3}>
                    {repairData ? 'Update Repair Option' : 'Add Repair Option'}
                </Typography>

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
                                    position: "absolute", top: 5, right: 5,
                                    background: "#fff", color: "#f44336",
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
                                    width: "100%", maxHeight: "200px", objectFit: "contain",
                                    borderRadius: "8px", border: "1px solid #ddd",
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
                    label="Name"
                    {...register("name", { required: "Name is required" })}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    multiline
                    rows={4}
                    {...register("description", { required: "Description is required" })}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Price"
                    {...register("price", { required: "Price is required" })}
                />

                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Estimated Time</InputLabel>
                    <Controller
                        name="estimatedTime"
                        control={control}
                        rules={{ required: "Estimated time is required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Estimated Time"
                            >
                                {estimatedTimeData.map((option) => (
                                    <MenuItem key={option._id} value={option._id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </FormControl>

                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Warranty</InputLabel>
                    <Controller
                        name="warranty"
                        control={control}
                        rules={{ required: "Warranty is required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Warranty"
                            >
                                {warrantyData.map((option) => (
                                    <MenuItem key={option._id} value={option._id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </FormControl>

                <Button
                    disabled={loading}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleSubmit(repairData ? handleUpdate : handleAdd)}
                >
                    {loading ? "Processing..." : repairData ? "Update" : "Add"}
                </Button>
            </Box>
        </Drawer>
    );
};

export default RepairOptionsDrawer;

import React, { useState } from "react";
import { Grid, Typography, IconButton, Card, CardMedia, CardContent } from "@mui/material";
import SeriesDrawer from "src/components/drawer/SeriesDrawer";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

function SeriesCard({ series, getSeriesData }) {
    
    async function handleDelete(id) {
        const confirm = window.confirm("Do you really want to delete?");
        if (confirm) {
            try {
                const resp = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/series/delete/${id}`);
                if (resp) {
                    toast.success(resp?.data?.message);
                    getSeriesData();
                }
            } catch (error) {
                toast.error(error?.response?.data?.message);
                console.log("Error in deleting series", error);
            }
        }
    }

    return (
        <>
        
            <Grid item xs={12} sm={6} md={4} lg={3} key={series._id}>
                <Card
                    sx={{
                        maxWidth: 650, // Increased width
                        borderRadius: "12px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.05)" },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Edit & Delete Icons */}
                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8 }}>
                        {/* <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(series)}
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                            }}
                        >
                            <FaEdit />
                        </IconButton> */}
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(series._id)}
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                            }}
                        >
                            <FaTrash />
                        </IconButton>
                    </div>

                    {/* Image */}
                    <CardMedia
                        component="img"
                        height="200" // Increased height
                        image={series.image}
                        alt={series?.name}
                        sx={{ borderRadius: "12px 12px 0 0", objectFit: "contain" }}
                    />

                    {/* Card Content */}
                    <CardContent sx={{ textAlign: "center", padding: "16px" }}> {/* Increased padding */}
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#333", fontSize: "1.2rem" }}>
                            {series?.name}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </>
    );
}

export default SeriesCard;

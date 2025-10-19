import React, { useState } from "react";
import { Card, CardMedia, CardContent, Typography, IconButton, Box } from "@mui/material";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import BrandsDrawer from "src/components/drawer/BrandsDrawer";
import { toast } from "react-toastify";

function BrandCard({ brandData, getBrands }) {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  async function handleDelete() {
    const confirm = window.confirm("Do you really want to delete this brand?")
    if (confirm) {
      try {
        const resp = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/brand/delete/${brandData._id}`)
        if (resp) {
          toast.success(resp?.data?.message)
          getBrands()
        }
      } catch (error) {
        toast.error(error?.response?.data?.message)
        console.log("error in deleting ", error)
      }
    }
  }

  const handleEdit = () => {
    setIsDrawerOpen(true)
  }

  return (
    <>
      {
        isDrawerOpen &&
        (
          <BrandsDrawer
            open={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            getBrands={getBrands}
            brandData={brandData}
          />
        )
      }
      <Card sx={{ position: "relative", borderRadius: 2, boxShadow: 3, transition: "0.3s", "&:hover": { transform: "translateY(-5px)" } }}>
        <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1 }}>
          <IconButton sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
            onClick={handleEdit}
          >
            <FiEdit size={18} />
          </IconButton>
          <IconButton sx={{ bgcolor: "error.main", color: "white", "&:hover": { bgcolor: "error.dark" } }}
            onClick={() => handleDelete()}
          >
            <FiTrash2 size={18} />
          </IconButton>
        </Box>

        <CardMedia component="img" height="200" image={brandData?.image} alt={brandData?.name} sx={{ borderRadius: "4px 4px 0 0", objectFit: 'contain' }} />

        <CardContent>
          <Typography variant="h6" fontWeight="bold" align="center">
            {brandData?.name}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

export default BrandCard;

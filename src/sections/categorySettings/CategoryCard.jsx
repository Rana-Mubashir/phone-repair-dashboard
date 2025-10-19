import React, { useState } from "react";
import { Card, CardMedia, CardContent, Typography, IconButton, Box } from "@mui/material";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import CategoryDrawer from "src/components/drawer/CategoryDrawer";
import axios from "axios";
import { toast } from "react-toastify";

function CategoryCard({ id, name, image, description, getAllCategories }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({});

  function handleEdit() {
    setCategoryData({
      _id: id,
      name: name,
      image: image,
      description: description,
    });
    setIsDrawerOpen(true);
  }

  async function handleDelete() {
    const confirm = window.confirm("Do You Really Want To Delete This Category?")
    if (confirm) {
      try {
        console.log("id", id)
        const resp = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/category/delete/${id}`)
        if (resp) {
          toast.success(resp?.data?.message)
          getAllCategories()
        }
      } catch (error) {
        console.log("error in deleting category", error)
        toast.error(error?.response?.data?.message)
      }
    }
  }

  return (
    <>
      {
        isDrawerOpen && (
          <CategoryDrawer
            open={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            categoryData={categoryData}
            getAllCategories={getAllCategories}
          />
        )
      }

      <Card
        sx={{
          position: "relative",
          borderRadius: 2,
          boxShadow: 3,
          transition: "0.3s",
          "&:hover": { transform: "translateY(-5px)" },
          maxWidth: 300,
        }}
      >

        <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1 }}>
          <IconButton sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }} onClick={handleEdit}>
            <FiEdit size={18} />
          </IconButton>
          <IconButton sx={{ bgcolor: "error.main", color: "white", "&:hover": { bgcolor: "error.dark" } }}
            onClick={() => handleDelete()}
          >
            <FiTrash2 size={18} />
          </IconButton>
        </Box>

        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={name}
          sx={{ borderRadius: "4px 4px 0 0", objectFit: "contain", padding: "10px" }}
        />

        <CardContent>
          <Typography variant="h6" fontWeight="bold" align="center">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {description || "No description available"}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

export default CategoryCard;

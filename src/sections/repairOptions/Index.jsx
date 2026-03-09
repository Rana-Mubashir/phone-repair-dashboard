
import { useEffect, useState } from "react"
import {
    Box,
    Typography,
    Container,
    Paper,
    TextField,
    Autocomplete,
    Card,
    CardContent,
    CardActions,
    Grid,
    Fab,
    IconButton,
    Button,
    Divider,
} from "@mui/material"
import {
    FaPlus as AddIcon,
    FaEdit as EditIcon,
    FaTrash as DeleteIcon,
    FaSearch as SearchIcon,
    FaTools as BuildIcon,
    FaMoneyBill as MoneyIcon,
    FaClock as TimeIcon,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import axios from "axios";

import RepairOptionsDrawer from "../../components/drawer/RepairOptionsDrawer";
import { toast } from "react-toastify";

// Sample data for devices and repair options
const sampleDevices = [
    { id: 1, name: "iPhone 13" },
    { id: 2, name: "iPhone 12" },
    { id: 3, name: "Samsung Galaxy S21" },
    { id: 4, name: "Google Pixel 6" },
    { id: 5, name: "iPad Pro" },
    { id: 6, name: "MacBook Air" },
]

export default function RepairOptionsPage() {
    const [selectedDevice, setSelectedDevice] = useState(null)
    const [repairOptions, setRepairOptions] = useState(null)
    const [devices, setDevices] = useState(sampleDevices)
    const [editRepairOptionData, setEditRepairOptionData] = useState(null)

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    useEffect(() => {
        getAllDevices()
    }, [])

    async function getAllDevices() {
        try {

            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/device/getdevicesname`)
            if (resp) {
                console.log("resp for devices name", resp?.data?.data)
                setDevices(resp?.data?.data)
            }

        } catch (error) {
            console.log("error in getting devices", error)
        }
    }

    async function getRepairOptions(id) {
        try {

            const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/repairoptions/get/${id}`)

            if (resp) {
                console.log("resp for repair options", resp)
                setRepairOptions(resp?.data?.data)
            }

        } catch (error) {
            console.log("error in getting repair options", error)
        }
    }

    async function handleDelete(id) {
        const confirm = window.confirm("Do you really want to delete?")
        if (confirm) {
            try {
                const resp = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/repairoptions/delete/${id}`)
                if (resp) {
                    toast.success(resp?.data?.message)
                    getRepairOptions(selectedDevice._id)
                }
            } catch (error) {
                console.log("error in deleting option", error)
            }
        }
    }

    const handleEditDrawerOpen = (data) => {
        setIsDrawerOpen(true)
        setEditRepairOptionData(data)
    }

    const handleDeviceChange = (event, newValue) => {
        setSelectedDevice(newValue)
        const id = newValue._id
        getRepairOptions(id)
    }

    return (
        <>
            {
                isDrawerOpen && (
                    <RepairOptionsDrawer
                        open={isDrawerOpen}
                        setIsOpen={setIsDrawerOpen}
                        getRepairOptions={() => getRepairOptions(selectedDevice._id)}
                        deviceId={selectedDevice._id}
                        repairData={editRepairOptionData}
                        setEditRepairOptionData={setEditRepairOptionData}
                    />
                )
            }
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 2,
                        background: "linear-gradient(145deg, #f0f0f0 0%, #e6e6e6 100%)",
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
                        Device Repair Options
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                        Select your device to view available repair services
                    </Typography>

                    <Autocomplete
                        id="device-select"
                        options={devices}
                        getOptionLabel={(option) => option.name}
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search for your device"
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <SearchIcon color="action" sx={{ ml: 1, mr: 0.5 }} />,
                                }}
                            />
                        )}
                        sx={{ maxWidth: 500 }}
                    />
                </Paper>

                {selectedDevice ? (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h5" component="h2">
                                Repair Options for {selectedDevice.name}
                            </Typography>
                            <Fab
                                color="primary"
                                aria-label="add"
                                onClick={() => setIsDrawerOpen(true)}
                                sx={{
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <AddIcon />
                            </Fab>
                        </Box>

                        {repairOptions && repairOptions.length > 0 ? (
                            <Grid container spacing={3}>
                                {repairOptions.map((option) => (
                                    <Grid item xs={12} sm={6} md={4} key={option.id}>
                                        <Card
                                            sx={{
                                                width: 300,
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                borderRadius: 3,
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                "&:hover": {
                                                    transform: "translateY(-5px)",
                                                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                                },
                                                overflow: "hidden",
                                                textAlign: "center",
                                                py: 3,
                                                px: 2,
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            {/* Rounded image */}
                                            <Box
                                                component="img"
                                                src={option?.image}
                                                alt={option?.name}
                                                sx={{
                                                    height: 80,
                                                    width: 80,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    mb: 2,
                                                    border: "2px solid #eee",
                                                }}
                                            />

                                            {/* Content */}
                                            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                                                <Typography variant="h6" component="h3" gutterBottom>
                                                    {option?.name}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {option?.description}
                                                </Typography>

                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
                                                    <MoneyIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                                    <Typography variant="body1" color="text.primary" fontWeight={500}>
                                                        ${option?.price.toFixed(2)}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
                                                    <TimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {option?.estimatedTime}
                                                    </Typography>
                                                </Box>

                                                {/* Warranty Section */}
                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <MdVerified color="green" style={{ marginRight: 8, fontSize: 20 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {option?.warranty || "No warranty"}
                                                    </Typography>
                                                </Box>
                                            </CardContent>

                                            {/* Action buttons */}
                                            <CardActions sx={{ justifyContent: "center", mt: 2 }}>
                                                <IconButton aria-label="edit" color="primary"
                                                onClick={() => handleEditDrawerOpen(option)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="delete"
                                                    color="error"
                                                    onClick={() => handleDelete(option._id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>


                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper
                                sx={{
                                    p: 4,
                                    textAlign: "center",
                                    borderRadius: 2,
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <BuildIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    No repair options available for this device yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Click the + button to add your first repair option
                                </Typography>
                                <Button variant="contained" startIcon={<AddIcon />}
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    Add Repair Option
                                </Button>
                            </Paper>
                        )}
                    </>
                ) : (
                    <Paper
                        sx={{
                            p: 5,
                            textAlign: "center",
                            borderRadius: 2,
                            backgroundColor: "#f5f5f5",
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <BuildIcon sx={{ fontSize: 80, color: "#9e9e9e" }} />
                        </Box>
                        <Typography variant="h5" gutterBottom>
                            Please select a device to view repair options
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Use the search box above to find your device
                        </Typography>
                    </Paper>
                )}
            </Container>
        </>
    )
}

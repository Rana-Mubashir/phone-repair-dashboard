// ShopAddressesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Drawer,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  useTheme,
  CircularProgress,
  Backdrop,
  Tooltip
} from '@mui/material';

// Import icons from react-icons
import { 
  IoAddCircleOutline, 
  IoCreateOutline, 
  IoTrashOutline,
  IoStorefrontOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCloseOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import axios from 'axios';

// API base URL - change this based on your environment
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ShopAddressesPage() {
  const theme = useTheme();
  
  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    timing: '',
    isActive: true
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Fetch all addresses
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/address`);
      console.log("respoonse for addresses",response)
      if (response) {
        setAddresses(response?.data?.data || []);
      } 
    } catch (error) {
      showSnackbar('Network error. Please try again.', 'error');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drawer open for add
  const handleAddNew = () => {
    setSelectedAddress(null);
    setIsEditing(false);
    setFormData({
      name: '',
      address: '',
      timing: '',
      isActive: true
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  // Handle drawer open for edit
  const handleEdit = (address) => {
    setSelectedAddress(address);
    setIsEditing(true);
    setFormData({
      name: address.name,
      address: address.address,
      timing: address.timing,
      isActive: address.isActive
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  // Handle delete dialog
  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/address/${addressToDelete._id}`);
      
      const data =response
      
      if (data) {
        setAddresses(addresses.filter(addr => addr._id !== addressToDelete._id));
        showSnackbar('Address deleted successfully', 'success');
      } else {
        showSnackbar(data.message || 'Failed to delete address', 'error');
      }
    } catch (error) {
      showSnackbar('Network error. Please try again.', 'error');
      console.error('Error deleting address:', error);
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (address) => {
    setActionLoading(true);
    try {
      const response = await axios.patch(`${API_BASE_URL}/address/${address._id}/toggle`);
      
      const data = response
      
      if (data) {
        setAddresses(addresses.map(addr => 
          addr._id === address._id 
            ? { ...addr, isActive: !addr.isActive }
            : addr
        ));
        showSnackbar(`Address ${!address.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showSnackbar(data.message || 'Failed to toggle status', 'error');
      }
    } catch (error) {
      showSnackbar('Network error. Please try again.', 'error');
      console.error('Error toggling status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!formData.timing.trim()) {
      errors.timing = 'Operating hours are required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      let response;
      let data;
      
      if (isEditing && selectedAddress) {
        response = await axios.put(`${API_BASE_URL}/address/${selectedAddress._id}`,formData);
      } else {
        response = await axios.post(`${API_BASE_URL}/address`,formData,);
      }
      
      data =  response.data;
      
      if (data.success) {
        if (isEditing) {
          setAddresses(addresses.map(addr => 
            addr._id === selectedAddress._id 
              ? { ...addr, ...formData }
              : addr
          ));
          showSnackbar('Address updated successfully', 'success');
        } else {
          setAddresses([data.data, ...addresses]);
          showSnackbar('Address added successfully', 'success');
        }
        setDrawerOpen(false);
      } else {
        showSnackbar(data.message || 'Operation failed', 'error');
      }
    } catch (error) {
      showSnackbar('Network error. Please try again.', 'error');
      console.error('Error submitting form:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Shop Addresses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your store locations and operating hours
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <Button
              variant="outlined"
              startIcon={<IoRefreshOutline size={20} />}
              onClick={fetchAddresses}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<IoAddCircleOutline size={20} />}
            onClick={handleAddNew}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add New Address
          </Button>
        </Box>
      </Box>

      {/* Addresses Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : addresses.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          px: 2,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}>
          <IoStorefrontOutline size={48} color={theme.palette.grey[400]} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No addresses found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the "Add New Address" button to create your first store location.
          </Typography>
          <Button
            variant="contained"
            startIcon={<IoAddCircleOutline size={20} />}
            onClick={handleAddNew}
          >
            Add New Address
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} lg={4} key={address._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: address.isActive ? 1 : 0.7,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    opacity: 1
                  }
                }}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  {/* Status Chip and Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Tooltip title="Click to toggle status">
                      <Chip
                        label={address.isActive ? 'Active' : 'Inactive'}
                        color={address.isActive ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleStatus(address)}
                        sx={{ 
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                      />
                    </Tooltip>
                    
                    {/* Action Buttons */}
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(address)}
                          sx={{ mr: 1 }}
                          color="primary"
                        >
                          <IoCreateOutline size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(address)}
                          color="error"
                        >
                          <IoTrashOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Store Name */}
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 600
                    }}
                  >
                    <IoStorefrontOutline color={theme.palette.primary.main} size={20} />
                    {address.name}
                  </Typography>

                  {/* Address */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 2
                    }}
                  >
                    <IoLocationOutline size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{address.address}</span>
                  </Typography>

                  {/* Timing */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <IoTimeOutline size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{address.timing}</span>
                  </Typography>

                  {/* Timestamps */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created: {new Date(address.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last updated: {new Date(address.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => !actionLoading && setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 500 },
            p: 3
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight="600">
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} disabled={actionLoading}>
            <IoCloseOutline size={24} />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Store Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            margin="normal"
            variant="outlined"
            placeholder="e.g., Main Store - Downtown"
            disabled={actionLoading}
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            error={!!formErrors.address}
            helperText={formErrors.address}
            margin="normal"
            variant="outlined"
            multiline
            rows={2}
            placeholder="Enter complete address"
            disabled={actionLoading}
          />

          <TextField
            fullWidth
            label="Operating Hours"
            name="timing"
            value={formData.timing}
            onChange={handleInputChange}
            required
            error={!!formErrors.timing}
            helperText={formErrors.timing}
            margin="normal"
            variant="outlined"
            placeholder="e.g., Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM"
            disabled={actionLoading}
          />

          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                color="primary"
                disabled={actionLoading}
              />
            }
            label="Active Store"
            sx={{ mt: 2, mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={actionLoading}
              sx={{ textTransform: 'none' }}
            >
              {actionLoading ? <CircularProgress size={24} /> : (isEditing ? 'Update Address' : 'Add Address')}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => setDrawerOpen(false)}
              disabled={actionLoading}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{addressToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ShopAddressesPage;
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Drawer,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Badge,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';

import {
  FaSearch,
  FaFilter,
  FaSync,
  FaMapMarkerAlt,
  FaHome,
  FaEnvelope,
  FaPhone,
  FaWrench,
  FaLaptop,
  FaDollarSign,
  FaTimes,
  FaChevronDown,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaIdCard,
  FaNotesMedical,
  FaEye,
  FaCheckCircle,
  FaExclamationCircle,
  FaTruck,
  FaStore
} from 'react-icons/fa';
import axios from 'axios';

function BookedRepairsPage() {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    repairType: 'all',
    repairOption: 'all',
    dateRange: 'all',
    clinic: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    clinic: 0,
    home: 0,
    mail: 0,
    today: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      calculateStats();
    }
  }, [bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {

    //   setTimeout(() => {
    //     const mockBookings = [
    //       {
    //         _id: '1',
    //         bookingNumber: 'BR-2024-001',
    //         firstName: 'John',
    //         lastName: 'Doe',
    //         email: 'john.doe@email.com',
    //         phone: '+1 (555) 123-4567',
    //         deviceName: 'iPhone 13 Pro',
    //         repairType: 'Screen Replacement',
    //         repairOption: 'clinic',
    //         price: 199.99,
    //         date: new Date(),
    //         timeSlot: '10:00 AM - 11:00 AM',
    //         bookingDate: format(new Date(), 'MM/dd/yyyy'),
    //         bookingTime: '09:30 AM',
    //         notes: 'Customer mentioned phone was dropped in water',
    //         clinic: 'Downtown Clinic'
    //       },
    //       {
    //         _id: '2',
    //         bookingNumber: 'BR-2024-002',
    //         firstName: 'Jane',
    //         lastName: 'Smith',
    //         email: 'jane.smith@email.com',
    //         phone: '+1 (555) 987-6543',
    //         deviceName: 'Samsung Galaxy S22',
    //         repairType: 'Battery Replacement',
    //         repairOption: 'home',
    //         price: 89.99,
    //         date: new Date(Date.now() + 86400000),
    //         timeSlot: '2:00 PM - 3:00 PM',
    //         bookingDate: format(new Date(), 'MM/dd/yyyy'),
    //         bookingTime: '11:15 AM',
    //         notes: 'Battery drains quickly',
    //         clinic: 'Mobile Service'
    //       },
    //       {
    //         _id: '3',
    //         bookingNumber: 'BR-2024-003',
    //         firstName: 'Robert',
    //         lastName: 'Johnson',
    //         email: 'robert.j@email.com',
    //         phone: '+1 (555) 456-7890',
    //         deviceName: 'MacBook Pro',
    //         repairType: 'Software Issue',
    //         repairOption: 'mail',
    //         price: 129.99,
    //         date: new Date(Date.now() + 172800000),
    //         timeSlot: '9:00 AM - 5:00 PM',
    //         bookingDate: format(new Date(), 'MM/dd/yyyy'),
    //         bookingTime: '2:30 PM',
    //         notes: 'Device not turning on',
    //         clinic: 'Mail-in Service'
    //       }
    //     ];
    //     setBookings(mockBookings);
    //     setLoading(false);
    //   }, 1500);

    const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/booking`)
    if(resp){
        console.log("resp for booked repairs",resp)
        setBookings(resp?.data?.data || [])
        setLoading(false)
    }

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const stats = bookings.reduce((acc, booking) => {
      acc.total++;
      
      if (booking.repairOption === 'clinic') acc.clinic++;
      if (booking.repairOption === 'home') acc.home++;
      if (booking.repairOption === 'mail') acc.mail++;
      
      if (new Date(booking.date).toDateString() === today) acc.today++;
      
      return acc;
    }, { total: 0, clinic: 0, home: 0, mail: 0, today: 0 });
    
    setStats(stats);
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          booking.bookingNumber?.toLowerCase().includes(searchTerm) ||
          `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchTerm) ||
          booking.email?.toLowerCase().includes(searchTerm) ||
          booking.phone?.includes(searchTerm) ||
          booking.deviceName?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      if (filters.repairType !== 'all' && booking.repairType !== filters.repairType) {
        return false;
      }

      if (filters.repairOption !== 'all' && booking.repairOption !== filters.repairOption) {
        return false;
      }

      if (filters.dateRange !== 'all') {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() + 7);
        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() + 1);

        switch (filters.dateRange) {
          case 'today':
            if (bookingDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'tomorrow':
            if (bookingDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case 'thisWeek':
            if (bookingDate > thisWeek) return false;
            break;
          case 'thisMonth':
            if (bookingDate > thisMonth) return false;
            break;
        }
      }

      return true;
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      repairType: 'all',
      repairOption: 'all',
      dateRange: 'all',
      clinic: 'all'
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const getRepairOptionIcon = (option) => {
    switch (option) {
      case 'clinic':
        return <FaStore size={14} />;
      case 'home':
        return <FaHome size={14} />;
      case 'mail':
        return <FaEnvelope size={14} />;
      default:
        return <FaWrench size={14} />;
    }
  };

  const getRepairOptionColor = (option) => {
    switch (option) {
      case 'clinic':
        return 'primary';
      case 'home':
        return 'success';
      case 'mail':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredBookings = getFilteredBookings();

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main }}>
            <Icon size={20} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Booked Repairs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track all repair bookings
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FaSync />}
              onClick={fetchBookings}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaWrench} label="Total Bookings" value={stats.total} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaStore} label="Clinic Visits" value={stats.clinic} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaHome} label="Home Service" value={stats.home} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaEnvelope} label="Mail-in Repairs" value={stats.mail} color="secondary" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaCalendarAlt} label="Today's Bookings" value={stats.today} color="warning" />
          </Grid>
        </Grid>
      </Box>

      {/* Filters and Table */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, pb: 4 }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {/* Search and Filter Bar */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Search by name, email, phone, device, or booking #..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch size={16} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FaFilter />}
                onClick={() => setShowFilters(!showFilters)}
                endIcon={<FaChevronDown style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />}
              >
                Filters
              </Button>
              {(filters.search || filters.repairType !== 'all' || filters.repairOption !== 'all' || filters.dateRange !== 'all') && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<FaTimes />}
                  onClick={resetFilters}
                >
                  Clear
                </Button>
              )}
            </Stack>

            {/* Advanced Filters */}
            {showFilters && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Repair Type</InputLabel>
                    <Select
                      value={filters.repairType}
                      label="Repair Type"
                      onChange={(e) => setFilters({ ...filters, repairType: e.target.value })}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="Screen Replacement">Screen Replacement</MenuItem>
                      <MenuItem value="Battery Replacement">Battery Replacement</MenuItem>
                      <MenuItem value="Water Damage">Water Damage</MenuItem>
                      <MenuItem value="Software Issue">Software Issue</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Service Option</InputLabel>
                    <Select
                      value={filters.repairOption}
                      label="Service Option"
                      onChange={(e) => setFilters({ ...filters, repairOption: e.target.value })}
                    >
                      <MenuItem value="all">All Options</MenuItem>
                      <MenuItem value="clinic">Clinic Visit</MenuItem>
                      <MenuItem value="home">Home Service</MenuItem>
                      <MenuItem value="mail">Mail-in</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label="Date Range"
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    >
                      <MenuItem value="all">All Dates</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="tomorrow">Tomorrow</MenuItem>
                      <MenuItem value="thisWeek">This Week</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Clinic</InputLabel>
                    <Select
                      value={filters.clinic}
                      label="Clinic"
                      onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}
                    >
                      <MenuItem value="all">All Clinics</MenuItem>
                      <MenuItem value="Downtown Clinic">Downtown Clinic</MenuItem>
                      <MenuItem value="Uptown Clinic">Uptown Clinic</MenuItem>
                      <MenuItem value="Westside Clinic">Westside Clinic</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Bookings Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading bookings...</Typography>
            </Box>
          ) : filteredBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FaLaptop size={48} color={theme.palette.text.disabled} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.search || filters.repairType !== 'all' || filters.repairOption !== 'all' || filters.dateRange !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No repair bookings have been made yet'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>Repair Type</TableCell>
                      <TableCell>Service Option</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow
                        key={booking._id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleViewDetails(booking)}
                      >
                        <TableCell>
                          <Chip
                            label={booking.bookingNumber}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" fontWeight="medium">
                              {booking.firstName} {booking.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {booking.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.deviceName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.repairType}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRepairOptionIcon(booking.repairOption)}
                            label={booking.repairOption}
                            size="small"
                            color={getRepairOptionColor(booking.repairOption)}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FaCalendarAlt size={12} color={theme.palette.text.secondary} />
                            <Typography variant="body2">
                              {format(new Date(booking.date), 'MMM dd, yyyy')}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <FaClock size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {booking.timeSlot}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            ${booking.price?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(booking);
                              }}
                            >
                              <FaEye size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Table Footer */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        {selectedBooking && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Booking Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <FaTimes />
              </IconButton>
            </Stack>

            <Stack spacing={3}>
              {/* Status Badge */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chip
                  label="Confirmed"
                  icon={<FaCheckCircle />}
                  color="success"
                  sx={{ px: 2, py: 1 }}
                />
              </Box>

              {/* Booking Info */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <FaIdCard style={{ marginRight: 8 }} />
                  Booking Information
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Booking Number</Typography>
                    <Typography variant="body2" fontWeight="medium">{selectedBooking.bookingNumber}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Booking Date</Typography>
                    <Typography variant="body2">{selectedBooking.bookingDate} at {selectedBooking.bookingTime}</Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Customer Info */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <FaUser style={{ marginRight: 8 }} />
                  Customer Information
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {selectedBooking.firstName[0]}{selectedBooking.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedBooking.firstName} {selectedBooking.lastName}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Tooltip title="Email">
                          <IconButton size="small" color="primary">
                            <FaEnvelope size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Phone">
                          <IconButton size="small" color="primary">
                            <FaPhone size={14} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Stack>
                  <Divider />
                  <Typography variant="body2">{selectedBooking.email}</Typography>
                  <Typography variant="body2">{selectedBooking.phone}</Typography>
                </Stack>
              </Paper>

              {/* Repair Details */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <FaWrench style={{ marginRight: 8 }} />
                  Repair Details
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Device</Typography>
                    <Typography variant="body2" fontWeight="medium">{selectedBooking.deviceName}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Repair Type</Typography>
                    <Chip
                      label={selectedBooking.repairType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Service Option</Typography>
                    <Chip
                      icon={getRepairOptionIcon(selectedBooking.repairOption)}
                      label={selectedBooking.repairOption}
                      size="small"
                      color={getRepairOptionColor(selectedBooking.repairOption)}
                    />
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Price</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${selectedBooking.price?.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Schedule */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <FaCalendarAlt style={{ marginRight: 8 }} />
                  Schedule
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography variant="h4" color="primary">
                        {format(new Date(selectedBooking.date), 'dd')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(selectedBooking.date), 'MMM')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {format(new Date(selectedBooking.date), 'EEEE, MMMM dd, yyyy')}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <FaClock size={12} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                          {selectedBooking.timeSlot}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              {/* Notes */}
              {selectedBooking.notes && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    <FaNotesMedical style={{ marginRight: 8 }} />
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {selectedBooking.notes}
                  </Typography>
                </Paper>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FaCheckCircle />}
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FaExclamationCircle />}
                  color="warning"
                >
                  Reschedule
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default BookedRepairsPage;
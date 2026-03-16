import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parse, parseISO, isValid } from 'date-fns';
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
  alpha,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextareaAutosize,
  Snackbar,
  Tab,
  Tabs
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
  FaStore,
  FaPaperPlane,
  FaHistory,
  FaCheck,
  FaBan,
  FaUndo
} from 'react-icons/fa';
import axios from 'axios';

function BookedRepairsPage() {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    search: '',
    repairType: 'all',
    repairOption: 'all',
    status: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    clinic: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    clinic: 0,
    home: 0,
    mail: 0,
    today: 0
  });

  // Email Dialog State
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailType, setEmailType] = useState('confirmation');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // Status Update Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Tab for booking details
  const [detailsTab, setDetailsTab] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (bookings.length > 0) {
      calculateStats();
    }
  }, [bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.repairType !== 'all' && { repairType: filters.repairType }),
        ...(filters.repairOption !== 'all' && { repairOption: filters.repairOption }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/booking?${params}`);
      if (resp.data) {
        console.log("bookings response ", resp.data);

        // Apply client-side date filtering
        let filteredData = resp.data.data || [];

        if (filters.dateRange !== 'all' || filters.startDate || filters.endDate) {
          filteredData = filterBookingsByDate(filteredData);
        }

        setBookings(filteredData);

        // Update pagination based on filtered data
        setPagination({
          page: 1,
          limit: pagination.limit,
          total: filteredData.length,
          pages: Math.ceil(filteredData.length / pagination.limit),
          hasNextPage: filteredData.length > pagination.limit,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showSnackbar('Error fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsByDate = (bookingsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookingsList.filter(booking => {
      // Parse the date from the booking (using the 'date' field which is in ISO format)
      let bookingDate = null;

      if (booking.date) {
        bookingDate = parseISO(booking.date);
      } else if (booking.bookingDate) {
        // Handle the string format "3/11/2026"
        const [month, day, year] = booking.bookingDate.split('/').map(Number);
        bookingDate = new Date(year, month - 1, day);
      }

      if (!bookingDate || !isValid(bookingDate)) {
        return false;
      }

      bookingDate.setHours(0, 0, 0, 0);

      // Handle custom date range
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return bookingDate >= startDate && bookingDate <= endDate;
      }

      // Handle predefined ranges
      switch (filters.dateRange) {
        case 'today':
          return isToday(bookingDate);
        case 'tomorrow':
          return isTomorrow(bookingDate);
        case 'thisWeek':
          return isThisWeek(bookingDate, { weekStartsOn: 1 });
        case 'thisMonth':
          return isThisMonth(bookingDate);
        case 'all':
        default:
          return true;
      }
    });
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const stats = bookings.reduce((acc, booking) => {
      acc.total++;

      // Status counts
      if (booking.status === 'pending') acc.pending++;
      else if (booking.status === 'confirmed') acc.confirmed++;
      else if (booking.status === 'completed') acc.completed++;
      else if (booking.status === 'rejected') acc.rejected++;

      // Option counts
      if (booking.repairOption === 'clinic') acc.clinic++;
      if (booking.repairOption === 'home') acc.home++;
      if (booking.repairOption === 'mail') acc.mail++;

      // Today's bookings - using the 'date' field
      if (booking.date) {
        const bookingDate = new Date(booking.date).toDateString();
        if (bookingDate === today) acc.today++;
      } else if (booking.bookingDate) {
        const [month, day, year] = booking.bookingDate.split('/').map(Number);
        const bookingDate = new Date(year, month - 1, day).toDateString();
        if (bookingDate === today) acc.today++;
      }

      return acc;
    }, { total: 0, pending: 0, confirmed: 0, completed: 0, rejected: 0, clinic: 0, home: 0, mail: 0, today: 0 });

    setStats(stats);
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
    setDetailsTab(0);
  };

  const getRepairOptionIcon = (option) => {
    switch (option) {
      case 'clinic': return <FaStore size={14} />;
      case 'home': return <FaHome size={14} />;
      case 'mail': return <FaEnvelope size={14} />;
      default: return <FaWrench size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle size={14} />;
      case 'pending': return <FaClock size={14} />;
      case 'rejected': return <FaBan size={14} />;
      case 'completed': return <FaCheck size={14} />;
      default: return <FaExclamationCircle size={14} />;
    }
  };

  const getRepairOptionColor = (option) => {
    switch (option) {
      case 'clinic': return 'primary';
      case 'home': return 'success';
      case 'mail': return 'secondary';
      default: return 'default';
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      repairType: 'all',
      repairOption: 'all',
      status: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      clinic: 'all'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      dateRange: value,
      // Clear custom dates when switching to predefined ranges
      startDate: value === 'custom' ? prev.startDate : '',
      endDate: value === 'custom' ? prev.endDate : ''
    }));
  };

  // Email Templates
  const emailTemplates = {
    confirmation: {
      subject: `Booking Confirmed - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

Your repair booking has been confirmed!

Booking Details:
- Booking Number: {bookingNumber}
- Device: {deviceName}
- Repair Type: {repairType}
- Date: {date}
- Time: {timeSlot}
- Location: {location}

Thank you for choosing TechFix Pro!

Best regards,
TechFix Pro Team`
    },
    reminder: {
      subject: `Reminder: Upcoming Repair - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

This is a reminder of your upcoming repair appointment:

Date: {date}
Time: {timeSlot}
Device: {deviceName}
Location: {location}

We look forward to seeing you!

TechFix Pro Team`
    },
    rejection: {
      subject: `Booking Update - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

We regret to inform you that we are unable to proceed with your booking at this time.

Booking Number: {bookingNumber}

If you have any questions, please don't hesitate to contact us.

Best regards,
TechFix Pro Team`
    },
    completed: {
      subject: `Repair Completed - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

Your device repair has been completed successfully!

Device: {deviceName}
Repair: {repairType}

You can pick up your device during our business hours.

Thank you for choosing TechFix Pro!`
    }
  };

  const handleEmailTypeChange = (type) => {
    setEmailType(type);
    if (type !== 'custom' && selectedBooking) {
      const template = emailTemplates[type];
      setEmailSubject(template.subject);
      setEmailBody(template.body
        .replace('{customerName}', `${selectedBooking.firstName} ${selectedBooking.lastName}`)
        .replace('{bookingNumber}', selectedBooking.bookingNumber)
        .replace('{deviceName}', selectedBooking.deviceName)
        .replace('{repairType}', selectedBooking.repairType)
        .replace('{date}', selectedBooking.date ? format(parseISO(selectedBooking.date), 'MMM dd, yyyy') : selectedBooking.bookingDate)
        .replace('{timeSlot}', selectedBooking.timeSlot)
        .replace('{location}', selectedBooking.repairOption === 'clinic' && selectedBooking.clinicDetails?.name
          ? selectedBooking.clinicDetails.name
          : selectedBooking.repairOption)
      );
    } else {
      setEmailSubject('');
      setEmailBody('');
    }
  };

  const sendEmail = async () => {
    if (!selectedBooking) return;

    setSendingEmail(true);
    try {
      const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/booking/${selectedBooking._id}/send-email`, {
        type: emailType,
        subject: emailSubject,
        body: emailBody,
        customMessage: emailBody
      });
      console.log("response for email ",resp)
      if (resp) {
        showSnackbar('Email sent successfully', 'success');
        setEmailDialogOpen(false);
        fetchBookings();
      }

    } catch (error) {
      console.error('Error sending email:', error);
      showSnackbar('Failed to send email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const updateBookingStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    setUpdatingStatus(true);
    try {

      const resp = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/booking/${selectedBooking._id}`, {
        status: newStatus,
      });

      console.log("response for status changed", resp)

      if (resp) {
        showSnackbar(`Booking ${newStatus} successfully`, 'success');
        setStatusDialogOpen(false);
        await fetchBookings();
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }

    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

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

  // Format date for display
  const formatBookingDate = (booking) => {
    if (booking.date) {
      return format(parseISO(booking.date), 'MMM dd, yyyy');
    } else if (booking.bookingDate) {
      const [month, day, year] = booking.bookingDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, 'MMM dd, yyyy');
    }
    return 'N/A';
  };

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
            <StatCard icon={FaWrench} label="Total" value={stats.total} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaClock} label="Pending" value={stats.pending} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaCheckCircle} label="Confirmed" value={stats.confirmed} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaCheck} label="Completed" value={stats.completed} color="info" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard icon={FaBan} label="Rejected" value={stats.rejected} color="error" />
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
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
              {(filters.search || filters.repairType !== 'all' || filters.repairOption !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' || filters.startDate || filters.endDate) && (
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Service Option</InputLabel>
                    <Select
                      value={filters.repairOption}
                      label="Service Option"
                      onChange={(e) => setFilters({ ...filters, repairOption: e.target.value, page: 1 })}
                    >
                      <MenuItem value="all">All Options</MenuItem>
                      <MenuItem value="clinic">Clinic Visit</MenuItem>
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
                      onChange={handleDateRangeChange}
                    >
                      <MenuItem value="all">All Dates</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="tomorrow">Tomorrow</MenuItem>
                      <MenuItem value="thisWeek">This Week</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {filters.dateRange === 'custom' && (
                  <>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="End Date"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </Box>

          {/* Bookings Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading bookings...</Typography>
            </Box>
          ) : bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FaLaptop size={48} color={theme.palette.text.disabled} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.search || filters.repairType !== 'all' || filters.repairOption !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' || filters.startDate || filters.endDate
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
                      <TableCell>Status</TableCell>
                      <TableCell>Service Option</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit).map((booking) => (
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
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status}
                            size="small"
                            color={getStatusColor(booking.status)}
                            variant="filled"
                          />
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
                              {formatBookingDate(booking)}
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

              {/* Pagination */}
              <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, bookings.length)} of {bookings.length} bookings
                </Typography>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
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
          sx: { width: { xs: '100%', sm: 600 } }
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

            <Tabs value={detailsTab} onChange={(e, v) => setDetailsTab(v)} sx={{ mb: 3 }}>
              <Tab label="Details" />
              <Tab label="History" />
              <Tab label="Email" />
            </Tabs>

            {detailsTab === 0 && (
              <Stack spacing={3}>
                {/* Status Badge and Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={getStatusIcon(selectedBooking.status)}
                    label={selectedBooking.status?.toUpperCase()}
                    color={getStatusColor(selectedBooking.status)}
                    sx={{ px: 2, py: 1 }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FaUndo />}
                      onClick={() => {
                        // setNewStatus(selectedBooking.status);
                        setStatusDialogOpen(true);
                      }}
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<FaPaperPlane />}
                      onClick={() => setEmailDialogOpen(true)}
                    >
                      Send Email
                    </Button>
                  </Stack>
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
                          {selectedBooking.date ? format(parseISO(selectedBooking.date), 'dd') :
                            selectedBooking.bookingDate ? selectedBooking.bookingDate.split('/')[1] : '--'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedBooking.date ? format(parseISO(selectedBooking.date), 'MMM') :
                            selectedBooking.bookingDate ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(selectedBooking.bookingDate.split('/')[0]) - 1] : ''}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatBookingDate(selectedBooking)}
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

                {/* Location */}
                {selectedBooking.repairOption === 'clinic' && selectedBooking.clinicDetails && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      <FaMapMarkerAlt style={{ marginRight: 8 }} />
                      Clinic Location
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {selectedBooking.clinicDetails.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedBooking.clinicDetails.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedBooking.clinicDetails.timing}
                    </Typography>
                  </Paper>
                )}

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
              </Stack>
            )}

            {detailsTab === 1 && (
              <Stack spacing={3}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Status History
                </Typography>
                {selectedBooking.statusHistory?.length > 0 ? (
                  selectedBooking.statusHistory.map((history, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                          icon={getStatusIcon(history.status)}
                          label={history.status}
                          size="small"
                          color={getStatusColor(history.status)}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(history.changedAt), 'MMM dd, yyyy hh:mm a')}
                        </Typography>
                      </Stack>
                      {history.note && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {history.note}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        By: {history.changedBy}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography color="text.secondary">No status history available</Typography>
                )}

                <Divider />

                <Typography variant="subtitle1" fontWeight="bold">
                  Email History
                </Typography>
                {selectedBooking.emailHistory?.length > 0 ? (
                  selectedBooking.emailHistory.map((email, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{email.subject}</Typography>
                        <Chip
                          label={email.status}
                          size="small"
                          color={email.status === 'sent' ? 'success' : 'error'}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(email.sentAt), 'MMM dd, yyyy hh:mm a')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {email.body}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography color="text.secondary">No email history available</Typography>
                )}
              </Stack>
            )}

            {detailsTab === 2 && (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Send email to customer
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<FaPaperPlane />}
                  onClick={() => setEmailDialogOpen(true)}
                  fullWidth
                >
                  Compose Email
                </Button>

                <Divider />

                <Typography variant="subtitle2">Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<FaCheckCircle />}
                    onClick={() => {
                      handleEmailTypeChange('confirmation');
                      setEmailDialogOpen(true);
                    }}
                  >
                    Send Confirmation
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FaClock />}
                    onClick={() => {
                      handleEmailTypeChange('reminder');
                      setEmailDialogOpen(true);
                    }}
                  >
                    Send Reminder
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<FaCheck />}
                    onClick={() => {
                      handleEmailTypeChange('completed');
                      setEmailDialogOpen(true);
                    }}
                  >
                    Send Completion Notice
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FaBan />}
                    onClick={() => {
                      handleEmailTypeChange('rejection');
                      setEmailDialogOpen(true);
                    }}
                  >
                    Send Rejection
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        )}
      </Drawer>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Send Email to Customer
          <IconButton
            onClick={() => setEmailDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <FaTimes />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Email Type</InputLabel>
              <Select
                value={emailType}
                label="Email Type"
                onChange={(e) => handleEmailTypeChange(e.target.value)}
              >
                <MenuItem value="confirmation">Confirmation</MenuItem>
                <MenuItem value="reminder">Reminder</MenuItem>
                <MenuItem value="rejection">Rejection</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              fullWidth
              required
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Message Body
              </Typography>
              <TextareaAutosize
                minRows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  borderColor: '#ccc',
                  fontFamily: 'inherit'
                }}
              />
            </Box>

            {selectedBooking && (
              <Alert severity="info">
                Sending to: {selectedBooking.firstName} {selectedBooking.lastName} ({selectedBooking.email})
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={sendEmail}
            variant="contained"
            disabled={sendingEmail || !emailSubject || !emailBody}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <FaPaperPlane />}
          >
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Note (optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Add a note about this status change"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={updateBookingStatus}
            variant="contained"
            disabled={updatingStatus || !newStatus}
            startIcon={updatingStatus ? <CircularProgress size={20} /> : null}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BookedRepairsPage;
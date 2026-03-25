import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  Stack,
  InputAdornment,
  Chip,
  Button,
  Menu,
  MenuItem,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { format } from 'date-fns';
import {
  IoSend,
  IoSearch,
  IoEllipsisVertical,
  IoAttach,
  IoSadOutline,
  IoRepeat,
  IoTrashBin,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCheckmarkDone,
  IoPerson,
  IoHeadset,
  IoClose,
  IoRefresh,
  IoArchive,
  IoStar,
  IoStarOutline,
  IoBan,
  IoChevronDown,
  IoHappyOutline,
} from 'react-icons/io5';

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD',
    lastMessage: 'I need help with my account',
    timestamp: new Date(2024, 2, 15, 14, 30),
    unread: 2,
    status: 'online',
    isStarred: true,
    conversation: [
      {
        id: 1,
        text: 'Hi, I need help with my account',
        sender: 'user',
        timestamp: new Date(2024, 2, 15, 14, 30),
        read: false,
      },
      {
        id: 2,
        text: "Hello! I'd be happy to help. What seems to be the issue?",
        sender: 'admin',
        timestamp: new Date(2024, 2, 15, 14, 32),
        read: true,
      },
    ],
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    avatar: 'SS',
    lastMessage: 'When will my order arrive?',
    timestamp: new Date(2024, 2, 15, 13, 15),
    unread: 0,
    status: 'offline',
    isStarred: false,
    conversation: [
      {
        id: 1,
        text: 'When will my order arrive?',
        sender: 'user',
        timestamp: new Date(2024, 2, 15, 13, 15),
        read: true,
      },
    ],
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'MJ',
    lastMessage: 'Can I get a refund?',
    timestamp: new Date(2024, 2, 15, 11, 45),
    unread: 1,
    status: 'online',
    isStarred: false,
    conversation: [
      {
        id: 1,
        text: 'Can I get a refund for my recent purchase?',
        sender: 'user',
        timestamp: new Date(2024, 2, 15, 11, 45),
        read: false,
      },
    ],
  },
];

function ClientChatPage() {
  const theme = useTheme();
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [selectedUser?.conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      read: true,
    };

    // Update conversation
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          conversation: [...user.conversation, newMsg],
          lastMessage: newMessage,
          timestamp: new Date(),
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setSelectedUser({
      ...selectedUser,
      conversation: [...selectedUser.conversation, newMsg],
      lastMessage: newMessage,
      timestamp: new Date(),
    });
    setNewMessage('');

    // Simulate user typing and response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const userResponse = {
          id: Date.now() + 1,
          text: "Thank you for your response. I'll check and get back to you.",
          sender: 'user',
          timestamp: new Date(),
          read: false,
        };
        
        const updatedUsersWithResponse = updatedUsers.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              conversation: [...user.conversation, userResponse],
              lastMessage: userResponse.text,
              timestamp: new Date(),
              unread: user.unread + 1,
            };
          }
          return user;
        });
        
        setUsers(updatedUsersWithResponse);
        setSelectedUser(prev => ({
          ...prev,
          conversation: [...prev.conversation, userResponse],
          lastMessage: userResponse.text,
          timestamp: new Date(),
          unread: prev.unread + 1,
        }));
        setIsTyping(false);
      }, 2000);
    }, 500);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mark messages as read
  const markAsRead = (userId) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, unread: 0 };
      }
      return user;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, unread: 0 });
    }
  };

  // Toggle star user
  const toggleStarUser = (userId) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, isStarred: !user.isStarred };
      }
      return user;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isStarred: !selectedUser.isStarred });
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedConversation(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConversation(null);
  };

  // Format timestamp
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#4caf50';
      case 'offline':
        return '#9e9e9e';
      default:
        return '#ff9800';
    }
  };

  return (
    <Box sx={{ display: 'flex', marginTop:'30px', bgcolor: '#f5f5f5' }}>
      {/* Sidebar Drawer for Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 320 },
        }}
      >
        <ChatSidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            markAsRead(user.id);
            setMobileOpen(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={handleMenuOpen}
          onToggleStar={toggleStarUser}
          formatTime={formatTime}
          getStatusColor={getStatusColor}
        />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 360,
          display: { xs: 'none', md: 'block' },
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <ChatSidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            markAsRead(user.id);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={handleMenuOpen}
          onToggleStar={toggleStarUser}
          formatTime={formatTime}
          getStatusColor={getStatusColor}
        />
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    sx={{ display: { md: 'none' } }}
                    onClick={() => setMobileOpen(true)}
                  >
                    <IoSearch size={20} />
                  </IconButton>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {selectedUser.avatar}
                  </Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedUser.name}
                      </Typography>
                      <Badge
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: getStatusColor(selectedUser.status),
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                          },
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Toggle Details">
                    <IconButton onClick={() => setShowDetails(!showDetails)}>
                      <IoChevronDown size={20} style={{ transform: showDetails ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton>
                      <IoRefresh size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More Options">
                    <IconButton onClick={(e) => handleMenuOpen(e, selectedUser)}>
                      <IoEllipsisVertical size={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* User Details Collapse */}
              <Collapse in={showDetails}>
                <Card sx={{ mt: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(), 'MMMM d, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Total Messages
                        </Typography>
                        <Typography variant="body2">
                          {selectedUser.conversation.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={selectedUser.isStarred}
                              onChange={() => toggleStarUser(selectedUser.id)}
                              color="warning"
                            />
                          }
                          label="Starred Conversation"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>
            </Paper>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {selectedUser.conversation.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor:
                          message.sender === 'admin'
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'background.paper',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Paper>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                      {message.sender === 'admin' && (
                        <IoCheckmarkCircle size={12} color={theme.palette.success.main} />
                      )}
                    </Stack>
                  </Box>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <CircularProgress size={12} />
                      <Typography variant="caption">typing...</Typography>
                    </Stack>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 0,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <IconButton>
                  <IoAttach size={20} />
                </IconButton>
                <IconButton>
                  <IoHappyOutline size={20} />
                </IconButton>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <IoSend size={20} />
                </IconButton>
              </Stack>
            </Paper>
          </>
        ) : (
          // No User Selected
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <IoHeadset size={80} color={theme.palette.grey[400]} />
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start chatting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a user from the sidebar to view and respond to messages
            </Typography>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <IoRepeat size={18} style={{ marginRight: 8 }} />
          Mark as Unread
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {selectedConversation?.isStarred ? (
            <IoStar size={18} style={{ marginRight: 8, color: '#ffc107' }} />
          ) : (
            <IoStarOutline size={18} style={{ marginRight: 8 }} />
          )}
          {selectedConversation?.isStarred ? 'Remove Star' : 'Star Conversation'}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <IoArchive size={18} style={{ marginRight: 8 }} />
          Archive
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <IoBan size={18} style={{ marginRight: 8 }} />
          Block User
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Chat Sidebar Component
const ChatSidebar = ({
  users,
  selectedUser,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onMenuOpen,
  onToggleStar,
  formatTime,
  getStatusColor,
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Conversations
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1 }}
        />
      </Box>
      
      <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        {users.map((user) => (
          <Box key={user.id}>
            <ListItem
              button
              selected={selectedUser?.id === user.id}
              onClick={() => onSelectUser(user)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: getStatusColor(user.status),
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid white',
                    },
                  }}
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {user.avatar}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={user.unread > 0 ? 'bold' : 'normal'}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(user.timestamp)}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 180,
                      }}
                    >
                      {user.lastMessage}
                    </Typography>
                    {user.unread > 0 && (
                      <Chip
                        label={user.unread}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>
                }
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(user.id);
                }}
              >
                {user.isStarred ? (
                  <IoStar size={18} color="#ffc107" />
                ) : (
                  <IoStarOutline size={18} />
                )}
              </IconButton>
            </ListItem>
            <Divider variant="inset" component="li" />
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default ClientChatPage;
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Drawer,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  IoClose,
  IoRepeat,
  IoStar,
  IoStarOutline,
  IoArchive,
  IoBan,
  IoRefresh,
} from 'react-icons/io5';
import ChatSidebar from './chatSidebar';
import ChatHeader from './chatHeader';
import ChatMessages from './chatMessages';
import ChatInput from './chatInput';
import axios from 'axios';

const ClientChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenuUser, setContextMenuUser] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsFetching(true);
      setError(null);
      
      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat`);
      
      if (resp?.data?.chats) {
        // Ensure we're setting an array, even if empty
        const chatsData = Array.isArray(resp.data.chats) ? resp.data.chats : [];
        
        // Add default properties if missing from API response
        const formattedChats = chatsData.map(chat => ({
          ...chat,
          isStarred: chat.isStarred || false,
          isBlocked: chat.isBlocked || false,
          isArchived: chat.isArchived || false,
          unread: chat.unread || 0,
          status: chat.status || 'offline',
          conversation: chat.conversation || [],
          lastMessage: chat.lastMessage || '',
          timestamp: chat.timestamp ? new Date(chat.timestamp) : new Date(),
          avatar: chat.avatar || getInitials(chat.name),
        }));
        
        setUsers(formattedChats);
        console.log("Chats loaded:", formattedChats.length);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log("Error in getting chats:", error);
      setError(error.message || "Failed to load conversations");
      setUsers([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter users based on search and archived status
  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    if (user.isArchived) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser?.conversation]);

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current && !isMobile && !selectedUser.isBlocked) {
      inputRef.current.focus();
    }
  }, [selectedUser, isMobile]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedUser && selectedUser.unread > 0) {
      markAsRead(selectedUser.id);
    }
  }, [selectedUser?.id]);

  // Send message handler
  const handleSendMessage = useCallback(() => {
    if (!newMessage?.trim() || !selectedUser || isLoading || selectedUser.isBlocked) return;

    setIsLoading(true);

    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      read: true,
    };

    // Update users list with new message
    const updatedUsers = users.map((user) => {
      if (user?.id === selectedUser.id) {
        return {
          ...user,
          conversation: [...(user?.conversation || []), newMsg],
          lastMessage: newMessage,
          timestamp: new Date(),
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setSelectedUser((prev) =>
      prev
        ? {
            ...prev,
            conversation: [...(prev.conversation || []), newMsg],
            lastMessage: newMessage,
            timestamp: new Date(),
          }
        : null
    );
    setNewMessage('');

    // Simulate auto-response after delay
    setTimeout(() => {
      setIsTyping(true);

      setTimeout(() => {
        const userResponse = {
          id: Date.now() + 1,
          text: "Thank you for your message. I'll get back to you shortly.",
          sender: 'user',
          timestamp: new Date(),
          read: false,
        };

        const updatedUsersWithResponse = updatedUsers.map((user) => {
          if (user?.id === selectedUser.id) {
            return {
              ...user,
              conversation: [...(user?.conversation || []), userResponse],
              lastMessage: userResponse.text,
              timestamp: new Date(),
              unread: (user?.unread || 0) + 1,
            };
          }
          return user;
        });

        setUsers(updatedUsersWithResponse);
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                conversation: [...(prev.conversation || []), userResponse],
                lastMessage: userResponse.text,
                timestamp: new Date(),
                unread: (prev.unread || 0) + 1,
              }
            : null
        );
        setIsTyping(false);
        setIsLoading(false);
      }, 2000);
    }, 500);
  }, [newMessage, selectedUser, users, isLoading]);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Mark messages as read
  const markAsRead = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.id === userId ? { ...user, unread: 0 } : user
      )
    );
  }, []);

  // Toggle star conversation
  const toggleStarUser = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.id === userId ? { ...user, isStarred: !user?.isStarred } : user
      )
    );
    setSelectedUser((prev) =>
      prev && prev.id === userId ? { ...prev, isStarred: !prev.isStarred } : prev
    );
  }, []);

  // Archive conversation
  const archiveConversation = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.id === userId ? { ...user, isArchived: true } : user
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
    setAnchorEl(null);
  }, [selectedUser]);

  // Block user
  const blockUser = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.id === userId ? { ...user, isBlocked: true } : user
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
    setAnchorEl(null);
  }, [selectedUser]);

  // Mark conversation as unread
  const markAsUnread = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.id === userId ? { ...user, unread: Math.max(user?.unread || 0, 1) } : user
      )
    );
    setAnchorEl(null);
  }, []);

  // Handle context menu
  const handleMenuOpen = useCallback((event, user) => {
    setAnchorEl(event.currentTarget);
    if (user) {
      setContextMenuUser(user);
    }
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchChats();
  }, []);

  // Loading state
  if (isFetching) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading conversations...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<IoRefresh />}
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        bgcolor: theme.palette.background.default,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Mobile Drawer for Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: 360,
            height: '100%',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <IoClose size={24} />
          </IconButton>
        </Box>
        <ChatSidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setMobileDrawerOpen(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={handleMenuOpen}
          onToggleStar={toggleStarUser}
          isLoading={isFetching}
        />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 360,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <ChatSidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setShowDetails(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={handleMenuOpen}
          onToggleStar={toggleStarUser}
          isLoading={isFetching}
        />
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {selectedUser ? (
          <>
            <ChatHeader
              user={selectedUser}
              showDetails={showDetails}
              onShowDetails={setShowDetails}
              onMenuOpen={(e) => handleMenuOpen(e, selectedUser)}
              onToggleStar={toggleStarUser}
              onRefresh={handleRefresh}
            />

            <ChatMessages
              messages={selectedUser?.conversation || []}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              ref={inputRef}
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={selectedUser?.isBlocked || isLoading}
              isLoading={isLoading}
              placeholder={
                selectedUser?.isBlocked
                  ? 'This user is blocked'
                  : 'Type your message... (Shift+Enter for new line)'
              }
            />
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 3,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                fontSize: '4rem',
                opacity: 0.4,
              }}
            >
              💬
            </Box>
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {users.length === 0 ? 'No conversations yet' : 'Select a conversation to start'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length === 0
                  ? 'New conversations will appear here when users message you'
                  : 'Choose a user from the sidebar to view and respond to messages'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (contextMenuUser) markAsUnread(contextMenuUser.id);
          }}
        >
          <IoRepeat size={18} style={{ marginRight: 12 }} />
          Mark as Unread
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (contextMenuUser) toggleStarUser(contextMenuUser.id);
          }}
        >
          {contextMenuUser?.isStarred ? (
            <>
              <IoStar size={18} style={{ marginRight: 12, color: '#ffc107' }} />
              Remove Star
            </>
          ) : (
            <>
              <IoStarOutline size={18} style={{ marginRight: 12 }} />
              Star Conversation
            </>
          )}
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (contextMenuUser) archiveConversation(contextMenuUser.id);
          }}
        >
          <IoArchive size={18} style={{ marginRight: 12 }} />
          Archive
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            if (contextMenuUser) blockUser(contextMenuUser.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <IoBan size={18} style={{ marginRight: 12 }} />
          Block User
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ClientChatPage;
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
  Button,
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
import { io } from "socket.io-client";

const ClientChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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
  const [socketConnected, setSocketConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {

   socketRef.current.on("connect", () => {
      console.log("Socket connected");
      socketRef.current.emit("join", sessionId);
    });
    
    // Socket connection events
    socketRef.current.on("connect", () => {
      console.log("Admin socket connected:", socketRef.current.id);
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Admin socket disconnected");
      setSocketConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    // IMPORTANT: Listen for 'receive_message' event (same as user side)
    // This is the event that will be emitted when user sends a message
    socketRef.current.on("receive_message", (data) => {
      console.log("Admin received message via socket:", data);
      
      // Update users list with new message
      setUsers((prevUsers) => {
        const existingUserIndex = prevUsers.findIndex(
          user => user.sessionId === data.sessionId
        );

        const newMessageObj = {
          _id: Date.now(),
          message: data.message,
          role: data.role, // This should be 'user' for messages from users
          timestamp: data.timestamp || new Date(),
          sessionId: data.sessionId
        };

        if (existingUserIndex !== -1) {
          // Update existing user
          const updatedUsers = [...prevUsers];
          const user = updatedUsers[existingUserIndex];
          
          updatedUsers[existingUserIndex] = {
            ...user,
            conversation: [...(user.conversation || []), newMessageObj],
            lastMessage: data.message,
            timestamp: new Date(),
            // Increment unread count if not the selected user
            unread: selectedUser?.sessionId === data.sessionId ? 0 : (user.unread || 0) + 1
          };
          
          return updatedUsers;
        } else {
          // Add new user to the list
          const newUser = {
            _id: data.sessionId,
            sessionId: data.sessionId,
            name: `User ${data.sessionId.slice(0, 8)}`,
            email: `user_${data.sessionId.slice(0, 8)}@example.com`,
            conversation: [newMessageObj],
            lastMessage: data.message,
            timestamp: new Date(),
            unread: selectedUser?.sessionId === data.sessionId ? 0 : 1,
            isStarred: false,
            isBlocked: false,
            isArchived: false,
            status: 'online',
            avatar: getInitials(`User ${data.sessionId.slice(0, 8)}`)
          };
          
          return [newUser, ...prevUsers];
        }
      });

      // Update selected user if it's the current conversation
      if (selectedUser?.sessionId === data.sessionId) {
        setSelectedUser((prev) => ({
          ...prev,
          conversation: [...(prev.conversation || []), {
            _id: Date.now(),
            message: data.message,
            role: data.role,
            timestamp: data.timestamp || new Date()
          }],
          lastMessage: data.message,
          timestamp: new Date()
        }));
        
        // Mark as read immediately if it's the selected user
        markAsRead(data.sessionId);
      }
    });

    // Listen for typing indicators from users (optional)
    // socketRef.current.on("user_typing", (data) => {
    //   console.log("User typing:", data);
    //   if (selectedUser?.sessionId === data.sessionId) {
    //     setIsTyping(data.isTyping);
    //     // Auto-clear typing indicator after 2 seconds
    //     setTimeout(() => {
    //       setIsTyping(false);
    //     }, 2000);
    //   }
    // });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser]); 

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat`);
      console.log("resp for chats", resp);
      
      if (resp?.data?.chats) {
        const chatsData = Array.isArray(resp.data.chats) ? resp.data.chats : [];

        const formattedChats = chatsData.map(chat => ({
          ...chat,
          _id: chat._id || chat.sessionId,
          sessionId: chat.sessionId,
          isStarred: chat.isStarred || false,
          isBlocked: chat.isBlocked || false,
          isArchived: chat.isArchived || false,
          unread: chat.unread || 0,
          status: chat.status || 'offline',
          conversation: chat.messages || [],
          lastMessage: chat.messages?.[chat.messages.length - 1]?.message || '',
          timestamp: chat.timestamp ? new Date(chat.timestamp) : new Date(),
          avatar: chat.avatar || getInitials(chat.name || `User ${chat.sessionId?.slice(0, 8)}`),
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

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    if (user.isArchived) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.sessionId?.toLowerCase() || '').includes(searchLower)
    );
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser?.conversation]);

  useEffect(() => {
    if (selectedUser && inputRef.current && !isMobile && !selectedUser.isBlocked) {
      inputRef.current.focus();
    }
  }, [selectedUser, isMobile]);

  useEffect(() => {
    if (selectedUser && selectedUser.unread > 0) {
      markAsRead(selectedUser.sessionId);
    }
  }, [selectedUser?.sessionId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage?.trim() || !selectedUser || isLoading || selectedUser.isBlocked) return;

    setIsLoading(true);

    const messageText = newMessage.trim();
    const newMsg = {
      message: messageText,
      role: 'admin',
      sessionId: selectedUser.sessionId,
      timestamp: new Date()
    };

    try {
      const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/chat`, newMsg);
      console.log("response for send message", resp);
      
      if (resp.data) {
        if (socketRef.current && socketConnected) {
          socketRef.current.emit("send_message", {
            sessionId: selectedUser.sessionId,
            message: messageText,
            role: 'admin',
            timestamp: new Date()
          });
          console.log("Message emitted via socket to user");
        } else {
          console.warn("Socket not connected, message saved to database only");
        }

        const updatedMessage = {
          _id: resp.data.message?._id || Date.now(),
          message: messageText,
          role: 'admin',
          timestamp: new Date(),
          sessionId: selectedUser.sessionId
        };

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user?.sessionId === selectedUser.sessionId
              ? {
                  ...user,
                  conversation: [...(user?.conversation || []), updatedMessage],
                  lastMessage: messageText,
                  timestamp: new Date(),
                }
              : user
          )
        );

        // Update selected user
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                conversation: [...(prev.conversation || []), updatedMessage],
                lastMessage: messageText,
                timestamp: new Date(),
              }
            : null
        );

        setNewMessage('');
      }
    } catch (error) {
      console.log("error in sending message", error);
      setError("Failed to send message. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, selectedUser, isLoading, socketConnected]);

  const handleTyping = useCallback((isTyping) => {
    if (selectedUser && socketRef.current && socketConnected) {
      socketRef.current.emit("admin_typing", {
        sessionId: selectedUser.sessionId,
        isTyping: isTyping
      });
    }
  }, [selectedUser, socketConnected]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const markAsRead = useCallback((sessionId) => {
    // Update in UI
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.sessionId === sessionId ? { ...user, unread: 0 } : user
      )
    );
    
    axios.post(`${import.meta.env.VITE_SERVER_URL}/api/chat/mark-read`, { sessionId })
      .catch(err => console.log("Error marking as read:", err));
  }, []);

  const toggleStarUser = useCallback((sessionId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.sessionId === sessionId ? { ...user, isStarred: !user?.isStarred } : user
      )
    );
    setSelectedUser((prev) =>
      prev && prev.sessionId === sessionId ? { ...prev, isStarred: !prev.isStarred } : prev
    );
    
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/chat/star/${sessionId}`)
      .catch(err => console.log("Error updating star status:", err));
  }, []);

  const archiveConversation = useCallback((sessionId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.sessionId === sessionId ? { ...user, isArchived: true } : user
      )
    );
    if (selectedUser?.sessionId === sessionId) {
      setSelectedUser(null);
    }
    setAnchorEl(null);
    
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/chat/archive/${sessionId}`)
      .catch(err => console.log("Error archiving conversation:", err));
  }, [selectedUser]);

  const blockUser = useCallback((sessionId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.sessionId === sessionId ? { ...user, isBlocked: true } : user
      )
    );
    if (selectedUser?.sessionId === sessionId) {
      setSelectedUser(null);
    }
    setAnchorEl(null);
    
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/chat/block/${sessionId}`)
      .catch(err => console.log("Error blocking user:", err));
  }, [selectedUser]);

  const markAsUnread = useCallback((sessionId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user?.sessionId === sessionId ? { ...user, unread: Math.max(user?.unread || 0, 1) } : user
      )
    );
    setAnchorEl(null);
    
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/chat/unread/${sessionId}`)
      .catch(err => console.log("Error marking as unread:", err));
  }, []);

  const handleMenuOpen = useCallback((event, user) => {
    setAnchorEl(event.currentTarget);
    if (user) {
      setContextMenuUser(user);
    }
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = useCallback(() => {
    fetchChats();
  }, []);

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

  if (error && !users.length) {
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
      {!socketConnected && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 1000,
            borderRadius: 2
          }}
        >
          Connecting to real-time service...
        </Alert>
      )}

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
            setShowDetails(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuOpen={handleMenuOpen}
          onToggleStar={toggleStarUser}
          isLoading={isFetching}
        />
      </Drawer>

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
              socketConnected={socketConnected}
            />

            <ChatMessages
              messages={selectedUser?.conversation || []}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              ref={inputRef}
              value={newMessage}
              onChange={(value) => {
                setNewMessage(value);
                if (value.trim()) {
                  handleTyping(true);
                  // Clear typing indicator after delay
                  clearTimeout(window.typingTimeout);
                  window.typingTimeout = setTimeout(() => {
                    handleTyping(false);
                  }, 1000);
                }
              }}
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
            if (contextMenuUser) markAsUnread(contextMenuUser.sessionId);
          }}
        >
          <IoRepeat size={18} style={{ marginRight: 12 }} />
          Mark as Unread
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (contextMenuUser) toggleStarUser(contextMenuUser.sessionId);
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
            if (contextMenuUser) archiveConversation(contextMenuUser.sessionId);
          }}
        >
          <IoArchive size={18} style={{ marginRight: 12 }} />
          Archive
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            if (contextMenuUser) blockUser(contextMenuUser.sessionId);
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
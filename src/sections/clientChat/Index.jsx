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

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {

    socketRef.current = io(import.meta.env.VITE_SERVER_URL);

    if (selectedUser) {
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        socketRef.current.emit("join", selectedUser?.sessionId);
      });
    }

    socketRef.current.on("receive_message", (data) => {
      console.log("Admin received message via socket:", data);

      setUsers((prevUsers) => {
        const existingUserIndex = prevUsers.findIndex(
          user => user.sessionId === data.sessionId
        );

        console.log("existing user index",existingUserIndex)

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
          lastMessage: chat.messages[chat.messages.length - 1]?.message || '',
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
        if (socketRef.current) {
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
  }, [newMessage, selectedUser, isLoading]);


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
              onToggleStar={toggleStarUser}
              onRefresh={handleRefresh}
            />

            <ChatMessages
              messages={selectedUser?.conversation || []}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              ref={inputRef}
              value={newMessage}
              onChange={(value) => {
                setNewMessage(value);
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
    </Box>
  );
};

export default ClientChatPage;
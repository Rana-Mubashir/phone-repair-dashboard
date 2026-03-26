
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
  Typography
} from '@mui/material';
import {
  IoClose,
  IoRepeat,
  IoStar,
  IoStarOutline,
  IoArchive,
  IoBan,
} from 'react-icons/io5';
// import { getRandomAutoResponse } from '@/utils/chatHelpers';
import ChatSidebar from './chatSidebar';
import ChatHeader from './chatHeader';
import ChatMessages from './chatMessages';
import ChatInput from './chatInput';

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
    isBlocked: false,
    isArchived: false,
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
    notes: 'VIP customer - handle with priority',
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
    isBlocked: false,
    isArchived: false,
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
    isBlocked: false,
    isArchived: false,
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
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma@example.com',
    avatar: 'EW',
    lastMessage: 'Thank you for your help!',
    timestamp: new Date(2024, 2, 15, 10, 20),
    unread: 0,
    status: 'offline',
    isStarred: false,
    isBlocked: false,
    isArchived: false,
    conversation: [
      {
        id: 1,
        text: 'Can you help me reset my password?',
        sender: 'user',
        timestamp: new Date(2024, 2, 15, 9, 45),
        read: true,
      },
      {
        id: 2,
        text: 'Of course! Let me send you a reset link.',
        sender: 'admin',
        timestamp: new Date(2024, 2, 15, 9, 50),
        read: true,
      },
      {
        id: 3,
        text: 'Thank you for your help!',
        sender: 'user',
        timestamp: new Date(2024, 2, 15, 10, 20),
        read: true,
      },
    ],
  },
];

const ClientChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenuUser, setContextMenuUser] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      !user.isArchived &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser?.conversation]);

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current && !isMobile) {
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
    if (!newMessage.trim() || !selectedUser || isLoading) return;

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
    setSelectedUser((prev) =>
      prev
        ? {
            ...prev,
            conversation: [...prev.conversation, newMsg],
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
          text: "hello",
          sender: 'user',
          timestamp: new Date(),
          read: false,
        };

        const updatedUsersWithResponse = updatedUsers.map((user) => {
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
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                conversation: [...prev.conversation, userResponse],
                lastMessage: userResponse.text,
                timestamp: new Date(),
                unread: prev.unread + 1,
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
        user.id === userId ? { ...user, unread: 0 } : user
      )
    );
  }, []);

  // Toggle star conversation
  const toggleStarUser = useCallback((userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isStarred: !user.isStarred } : user
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
        user.id === userId ? { ...user, isArchived: true } : user
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
        user.id === userId ? { ...user, isBlocked: true } : user
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
        user.id === userId ? { ...user, unread: Math.max(user.unread, 1) } : user
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
              onRefresh={() => {
                // Refresh handler can be extended for API calls
                console.log('[v0] Refreshing conversation for user:', selectedUser.name);
              }}
            />

            <ChatMessages
              messages={selectedUser.conversation}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              ref={inputRef}
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={selectedUser.isBlocked}
              isLoading={isLoading}
              placeholder={
                selectedUser.isBlocked
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
                Select a conversation to start
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a user from the sidebar to view and respond to messages
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

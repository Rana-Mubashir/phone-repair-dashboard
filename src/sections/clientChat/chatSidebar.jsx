import React, { useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  Avatar,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { IoSearch, IoEllipsisVertical, IoStar, IoStarOutline } from 'react-icons/io5';
import { getAvatarColor, formatListItemTime, formatMessageTime } from '../../utils/chatHelpers';

const ChatSidebar = ({
  users,
  selectedUser,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onMenuOpen,
  onToggleStar,
  isLoading = false,
}) => {
  const theme = useTheme();

  // Sort users: starred first, then by unread count, then by timestamp
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.isStarred !== b.isStarred) {
        return a.isStarred ? -1 : 1;
      }
      if (a.unread !== b.unread) {
        return b.unread - a.unread;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [users]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Conversations
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Conversations List */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bg: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        {sortedUsers.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              gap: 1,
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
          </Box>
        ) : (
          sortedUsers.map((user) => (
            <React.Fragment key={user.id}>
              <ListItem
                component="div"
                selected={selectedUser?.id === user.id}
                onClick={() => onSelectUser(user)}
                sx={{
                  py: 1.5,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  bgcolor: selectedUser?.id === user.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  borderLeft: selectedUser?.id === user.id
                    ? `3px solid ${theme.palette.primary.main}`
                    : '3px solid transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 56 }}>
                  <Badge
                    overlap="circular"
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: user.status === 'online' ? '#4caf50' : '#9e9e9e',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: `2px solid ${theme.palette.background.paper}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(user.id),
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                       U
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={user.unread > 0 ? 600 : 500}
                        noWrap
                        sx={{
                          flex: 1,
                          color: user.unread > 0 ? theme.palette.text.primary : 'inherit',
                        }}
                      >
                        {user.chatId}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        {user?.lastMessage.message || "last message"}
                      </Typography>
                    </Stack>
                  }
                  sx={{
                    '& .MuiListItemText-secondary': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    },
                  }}
                />

                {user.unread > 0 && (
                  <Chip
                    label={user.unread > 99 ? '99+' : user.unread}
                    size="small"
                    color="primary"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      ml: 1,
                      flexShrink: 0,
                    }}
                  />
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: 1,
                    minWidth: 'max-content',
                    fontSize: '0.7rem',
                  }}
                >
                  {formatMessageTime(new Date(user.createdAt))}
                </Typography>
              </ListItem>

              <Divider variant="inset" component="li" sx={{ my: 0 }} />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatSidebar;

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Stack,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Collapse,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  IoChevronDown,
  IoRefresh,
  IoEllipsisVertical,
} from 'react-icons/io5';
import { format } from 'date-fns';
import { getAvatarColor, getStatusColor } from '../../utils/chatHelpers';

const ChatHeader= ({
  user,
  showDetails,
  onShowDetails,
  onRefresh,
  onMenuOpen,
  onToggleStar,
}) => {
  const theme = useTheme();

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          bgcolor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          {/* User Info */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
            <Badge
              overlap="circular"
              // variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: getStatusColor(user.status),
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: `3px solid ${theme.palette.background.paper}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor:'#45B7D1',
                  width: 48,
                  height: 48,
                  fontWeight: 'bold',
                }}
              >
                U
              </Avatar>
            </Badge>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  noWrap
                  sx={{ flex: 1 }}
                >
                  {user.chatId}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Tooltip title="Toggle details">
              <IconButton
                size="small"
                onClick={() => onShowDetails(!showDetails)}
                sx={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <IoChevronDown size={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh conversation">
              <IconButton
                size="small"
                onClick={onRefresh}
              >
                <IoRefresh size={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={onMenuOpen}
              >
                <IoEllipsisVertical size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* User Details Collapse */}
        <Collapse in={showDetails}>
          <Card
            sx={{
              mt: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Messages
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {user.conversation.length}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Unread
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {user.unread}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.isStarred}
                        onChange={() => onToggleStar(user.id)}
                        color="warning"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {user.isStarred ? 'Remove from starred' : 'Add to starred'}
                      </Typography>
                    }
                  />
                </Grid>

                {user.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        p: 1,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 1,
                        fontStyle: 'italic',
                      }}
                    >
                      {user.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Collapse>
      </Paper>
    </>
  );
};

export default ChatHeader;

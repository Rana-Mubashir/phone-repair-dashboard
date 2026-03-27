'use client';

import React, { forwardRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import { IoCheckmarkCircle, IoCheckmarkDone } from 'react-icons/io5';
import { formatMessageTime } from '../../utils/chatHelpers';

const ChatMessages = (
  ({ messages }) => {
    const theme = useTheme();

    return (
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bg: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start the conversation by sending a message
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'admin' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.3s ease-in-out',
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(10px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    maxWidth: { xs: '85%', sm: '70%' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'admin' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor:
                        message.role === 'admin'
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'light'
                            ? '#f0f0f0'
                            : theme.palette.grey[800],
                      color:
                        message.role === 'admin'
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      borderRadius: 2,
                      wordBreak: 'break-word',
                      boxShadow:
                        message.role === 'admin'
                          ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                          : `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow:
                          message.role === 'admin'
                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                            : `0 2px 6px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                      }}
                    >
                      {message.message}
                    </Typography>
                  </Paper>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {/* {formatMessageTime(message.createdAt)} */}
                    </Typography>
                    {message.role === 'admin' && (
                      message.read ? (
                        <IoCheckmarkDone
                          size={14}
                          color={theme.palette.primary.main}
                          title="Seen"
                        />
                      ) : (
                        <IoCheckmarkCircle
                          size={14}
                          color={theme.palette.success.main}
                          title="Delivered"
                        />
                      )
                    )}
                  </Stack>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;

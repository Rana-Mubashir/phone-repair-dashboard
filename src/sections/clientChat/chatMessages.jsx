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
  ({ messages, isTyping }) => {
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
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
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
                    alignItems: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor:
                        message.sender === 'admin'
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'light'
                            ? '#f0f0f0'
                            : theme.palette.grey[800],
                      color:
                        message.sender === 'admin'
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      borderRadius: 2,
                      wordBreak: 'break-word',
                      boxShadow:
                        message.sender === 'admin'
                          ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                          : `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow:
                          message.sender === 'admin'
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
                      {message.text}
                    </Typography>
                    {message.edited && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontStyle: 'italic',
                        }}
                      >
                        (edited)
                      </Typography>
                    )}
                  </Paper>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatMessageTime(message.timestamp)}
                    </Typography>
                    {message.sender === 'admin' && (
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

            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? '#f0f0f0'
                        : theme.palette.grey[800],
                    borderRadius: 2,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.6,
                      },
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      typing...
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            {/* <div ref={ref} /> */}
          </>
        )}
      </Box>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;

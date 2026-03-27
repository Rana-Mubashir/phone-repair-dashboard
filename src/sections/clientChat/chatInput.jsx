
import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  IoSend,
  IoAttach,
  IoHappyOutline,
} from 'react-icons/io5';

const ChatInput =(
  (
    {
      value,
      onChange,
      onSend,
      onKeyPress,
      disabled = false,
      isLoading = false,
      placeholder = 'Type your message...',
    },
  ) => {
    const theme = useTheme();
    const containerRef = useRef(null);

    // Auto-scroll container into view
    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, []);

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
        }}
        // ref={containerRef}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            // inputRef={ref}
            fullWidth
            multiline
            maxRows={4}
            minRows={1}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={disabled || isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : theme.palette.grey[900],
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? '#efefef' : theme.palette.grey[800],
                },
                '&.Mui-focused': {
                  bgcolor: theme.palette.background.paper,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '0.95rem',
                lineHeight: 1.5,
                '&::placeholder': {
                  opacity: 0.6,
                },
              },
            }}
          />

          <Tooltip title={isLoading ? 'Sending...' : 'Send message (Shift+Enter for new line)'}>
            <span>
              <IconButton
                color="primary"
                onClick={onSend}
                disabled={!value.trim() || disabled || isLoading}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.action.disabledBackground,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IoSend size={20} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;

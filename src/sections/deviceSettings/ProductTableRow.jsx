import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
// import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

// import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import axios from 'axios';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  id,
  name,
  category,
  brand,
  series,
  handleClick,
  getDevices
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null)
  }

  const handleDelete = async () => {
    setOpen(null);
    const confirm = window.confirm("Do you really want to delete?")
    if (confirm) {
      try {
        const resp = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/device/delete/${id}`)
        if (resp) {
          toast.success(resp?.data?.message)
          getDevices()
        }

      } catch (error) {
        console.log("error in deleting ", error)
        toast.error(error?.response?.data?.message)
      }
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{category}</TableCell>

        <TableCell>{brand}</TableCell>

        <TableCell>{series}</TableCell>

        {/* <TableCell>
          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
        </TableCell> */}

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        {/* <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem> */}

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  // avatarUrl: PropTypes.any,
  email: PropTypes.any,
  handleClick: PropTypes.func,
  // isVerified: PropTypes.any,
  name: PropTypes.any,
  // role: PropTypes.any,
  selected: PropTypes.any,
  contactNo: PropTypes.any,
  // status: PropTypes.string,
};

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { users } from 'src/_mock/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from './TableNoData';
import ProductTableRow from './ProductTableRow';
import ProductTableHead from './ProductTableHead';
import TableEmptyRows from './TableEmptyRows';
import ProductTableToolbar from './ProductTableToolbar';
import { emptyRows, applyFilter, getComparator } from '../user/utils';

import DeviceDrawer from 'src/components/drawer/DeviceDrawer';
import axios from 'axios';

// ----------------------------------------------------------------------

export default function Index() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [devices, setDevices] = useState(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)


  useEffect(() => {
    getDevices()
  }, [])

  async function getDevices() {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/device/get`)
      if (resp) {
        console.log("resp for getting devices", resp?.data?.devices)
        setDevices(resp?.data?.devices)
      }
    } catch (error) {
      console.log("error in getting devices", error)
    }
  }

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <>
      {
        isDrawerOpen && (
          <DeviceDrawer open={isDrawerOpen} setIsOpen={setIsDrawerOpen} getDevices={getDevices} />
        )
      }
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Devices</Typography>

          <Button variant="contained" color="primary" startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setIsDrawerOpen(true)}
          >
            New Device
          </Button>
        </Stack>

        <Card>
          <ProductTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <ProductTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'category', label: 'Category' },
                    { id: 'brand', label: 'Brand' },
                    { id: 'series', label: 'series' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {
                    devices && devices.map((row) => (
                      <ProductTableRow
                        key={row._id}
                        id={row._id}
                        name={row?.device}
                        category={row?.category}
                        brand={row?.brand}
                        series={row?.series}
                        selected={selected.indexOf(row.name) !== -1}
                        handleClick={(event) => handleClick(event, row.name)}
                        getDevices={getDevices}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, users.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            page={page}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}

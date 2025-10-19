/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';
import { ToastContainer } from 'react-toastify';



// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <>
      <ToastContainer position="top-center" autoClose={4000} />
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </>
  );
}

import { lazy, Suspense, useEffect } from 'react';
import { Navigate, useNavigate, Outlet, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import DeviceSetting from 'src/pages/DeviceSetting';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CategorySetting = lazy(() => import('src/pages/CategorySetting'));
export const BrandsSetting = lazy(() => import('src/pages/BrandsSetting'));
export const SeriesSetting = lazy(() => import('src/pages/SeriesSetting'));
export const RepairOptions = lazy(() => import('src/pages/RepairOptions'));
export const ShopAddresses = lazy(() => import('src/pages/ShopAddresses'));
export const BookedRepairs = lazy(() => import('src/pages/BookedRepairs'));


// ----------------------------------------------------------------------

export default function Router() {

  // const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const isUser = localStorage.getItem('userData')
    if (!isUser) {
      navigate('/')
    }
  }, [navigate])

  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { path: 'dashboard', element: <IndexPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'category-settings', element: <CategorySetting /> },
        { path: 'brands-settings', element: <BrandsSetting /> },
        { path: 'series-settings', element: <SeriesSetting /> },
        { path: 'device-settings', element: <DeviceSetting /> },
        { path: 'repair-options', element: <RepairOptions /> },
        { path: 'shop-addresses', element: <ShopAddresses /> },
        { path: 'booked-repairs', element: <BookedRepairs /> },
      ],
    },
    {
      path: '',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}

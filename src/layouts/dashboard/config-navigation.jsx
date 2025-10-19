import SvgColor from "src/components/svg-color";
import { FiSettings } from 'react-icons/fi'; // you can use others like MdSettings, AiFillSetting, etc.

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Catalog',
    icon: <FiSettings size={21}/>, // or any folder-style icon
    children: [
      {
        title: 'Category Settings',
        path: '/category-settings',
      },
      {
        title: 'Brands Settings',
        path: '/brands-settings',
      },
      {
        title: 'Series Settings',
        path: '/series-settings',
      },
      {
        title: 'Device Settings',
        path: '/device-settings',
      },
    ],
  },
  {
    title: 'Repair Options',
    icon: <FiSettings size={21}/>,
    path:'/repair-options'
  },
];

export default navConfig;

import SvgColor from "src/components/svg-color";
import { FiSettings ,FiTool, FiMapPin} from 'react-icons/fi'; // you can use others like MdSettings, AiFillSetting, etc.

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },

  {
    title: 'Repairs',
    icon: <FiTool size={21} />,
    children: [
      {
        title: 'Booked Repairs',
        path: '/booked-repairs',
      },
      {
        title: 'Repair Options',
        path: '/repair-options',
      },
    ],
  },

  {
    title: 'Catalog',
    icon: <FiSettings size={21} />,
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
    title: 'Shop Settings',
    icon: <FiMapPin size={21} />,
    children: [
      {
        title: 'Shop Addresses',
        path: '/shop-addresses',
      },
    ],
  },
];


export default navConfig;

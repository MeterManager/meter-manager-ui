import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Assignment, Assessment, Settings } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const NavigationMenu = () => {
  const location = useLocation();

  const menuItems = [
    { key: '1', text: 'Подача показників', icon: <Assignment />, path: '/' },
    { key: '2', text: 'Панель керування', icon: <Dashboard />, path: '/dashboard' },
    { key: '3', text: 'Звіти', icon: <Assessment />, path: '/reports' },
    { key: '4', text: 'Налаштування', icon: <Settings />, path: '/settings' },
  ];

  return (
    <List component="nav">
      {menuItems.map((item) => (
        <ListItemButton key={item.key} component={Link} to={item.path} selected={location.pathname === item.path}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default NavigationMenu;

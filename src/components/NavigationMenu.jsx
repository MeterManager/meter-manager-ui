import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Assignment, Assessment, Settings } from '@mui/icons-material';

const NavigationMenu = ({ selectedMenuItem, onMenuSelect }) => {
  const handleItemClick = (key) => {
    onMenuSelect(key);
  };

  const menuItems = [
    { key: '1', text: 'Панель керування', icon: <Dashboard /> },
    { key: '2', text: 'Подача показників', icon: <Assignment /> },
    { key: '3', text: 'Звіти', icon: <Assessment /> },
    { key: '4', text: 'Налаштування', icon: <Settings /> },
  ];

  return (
    <List component="nav">
      {menuItems.map((item) => (
        <ListItemButton
          key={item.key}
          selected={selectedMenuItem === item.key}
          onClick={() => handleItemClick(item.key)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default NavigationMenu;
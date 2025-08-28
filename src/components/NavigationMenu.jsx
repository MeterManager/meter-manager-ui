import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { useState } from 'react';
import { Dashboard, Bolt, Assessment, Settings, LocationOn, Person, ExpandLess, ExpandMore } from '@mui/icons-material';

const NavigationMenu = ({ selectedMenuItem, onMenuSelect }) => {
  const [openSubMenu, setOpenSubMenu] = useState(false);

  const handleSubMenuToggle = () => {
    setOpenSubMenu(!openSubMenu);
  };

  const handleItemClick = (key) => {
    onMenuSelect(key);
  };

  const menuItems = [
    { key: '1', text: 'Панель керування', icon: <Dashboard /> },
    {
      key: '2',
      text: 'Лічильники',
      icon: <Bolt />,
      subMenu: [
        { key: '2-1', text: 'Всі лічильники' },
        { key: '2-2', text: 'Електрика' },
        { key: '2-3', text: 'Вода' },
        { key: '2-4', text: 'Газ' },
      ],
    },
    { key: '3', text: 'Звіти', icon: <Assessment /> },
    { key: '4', text: 'Налаштування', icon: <Settings /> },
  ];

  return (
    <List component="nav">
      {menuItems.map((item) => (
        <div key={item.key}>
          <ListItem
            button
            selected={selectedMenuItem === item.key}
            onClick={() => (item.subMenu ? handleSubMenuToggle() : handleItemClick(item.key))}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {item.subMenu && (openSubMenu ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
          {item.subMenu && (
            <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subMenu.map((subItem) => (
                  <ListItem
                    key={subItem.key}
                    button
                    sx={{ pl: (theme) => theme.custom.subMenuPadding }}
                    selected={selectedMenuItem === subItem.key}
                    onClick={() => handleItemClick(subItem.key)}
                  >
                    <ListItemText primary={subItem.text} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </div>
      ))}
    </List>
  );
};

export default NavigationMenu;

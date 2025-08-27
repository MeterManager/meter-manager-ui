import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, IconButton, Box } from '@mui/material';
import { useState } from 'react';
import { Dashboard, Settings, Description, ExpandLess, ExpandMore, ChevronLeft, ChevronRight } from '@mui/icons-material';
import Logo from './ui/Logo';

const Sidebar = ({ collapsed, onCollapse, selectedMenuItem, onMenuSelect }) => {
  const [openSubMenu, setOpenSubMenu] = useState(false);

  const handleSubMenuToggle = () => {
    setOpenSubMenu(!openSubMenu);
  };

  const handleItemClick = (key) => {
    onMenuSelect(key);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={true}
      sx={{
        width: (theme) => collapsed ? theme.custom.collapsedDrawerWidth : theme.custom.drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: (theme) => collapsed ? theme.custom.collapsedDrawerWidth : theme.custom.drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Logo collapsed={collapsed} />
      <List sx={{ flexGrow: 1 }}>
        <ListItem
          button
          selected={selectedMenuItem === '1'}
          onClick={() => handleItemClick('1')}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 56 }}>
            <Dashboard />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Панель керування" />}
        </ListItem>

        <ListItem button onClick={handleSubMenuToggle}>
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 56 }}>
            <Settings />
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText primary="Лічильники" />
              {openSubMenu ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>

        <Collapse in={openSubMenu && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {['Всі лічильники', 'Електрика', 'Вода', 'Газ'].map((text, index) => (
              <ListItem
                key={`2-${index + 1}`}
                button
                sx={{ pl: 4 }}
                selected={selectedMenuItem === `2-${index + 1}`}
                onClick={() => handleItemClick(`2-${index + 1}`)}
              >
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItem
          button
          selected={selectedMenuItem === '3'}
          onClick={() => handleItemClick('3')}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 56 }}>
            <Description />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Звіти" />}
        </ListItem>

        <ListItem
          button
          selected={selectedMenuItem === '4'}
          onClick={() => handleItemClick('4')}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 56 }}>
            <Settings />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Налаштування" />}
        </ListItem>
      </List>

      <Box
        sx={{
          mt: 'auto',
          display: 'flex',
          justifyContent: 'right',
          p: (theme) => theme.custom.iconButtonPadding,
        }}
      >
        <IconButton onClick={onCollapse} sx={{ color: 'inherit' }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
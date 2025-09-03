import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Button,
  SwipeableDrawer,
  Collapse,
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  Dashboard,
  Settings,
  Description,
  ChevronLeft,
  ChevronRight,
  ExitToApp,
  Menu,
  Assignment,
  AccountCircle,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('expandedMenus');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const { isAuthenticated, user, loginWithRedirect, handleLogout, isAdmin } = useAuthContext();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', collapsed);
    }
  }, [collapsed]);

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus));
    }
  }, [expandedMenus]);

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    { key: '1', label: 'Подача показників', icon: <Assignment />, path: '/' },
    ...(isAdmin ? [{ 
      key: '2', 
      label: 'Панель керування', 
      icon: <Dashboard />, 
      path: '/dashboard',
      hasSubmenu: true,
      submenu: [
        { key: '2-1', label: 'Локації', path: '/dashboard/locations' },
        { key: '2-2', label: 'Типи ресурсів', path: '/dashboard/resource-types' },
        { key: '2-3', label: 'Орендарі', path: '/dashboard/tenants' },
        { key: '2-4', label: 'Поставки ресурсів', path: '/dashboard/resource-delivery' },
        { key: '2-5', label: 'Тарифи', path: '/dashboard/tariffs' },
        { key: '2-6', label: 'Лічильники', path: '/dashboard/meters' },
        { key: '2-7', label: 'Прив\'язка лічильників', path: '/dashboard/meter-tenants' },
        { key: '2-8', label: 'Користувачі', path: '/dashboard/users' }
      ]
    }] : []),
    { key: '3', label: 'Звіти', icon: <Description />, path: '/reports' },
    { key: '4', label: 'Налаштування', icon: <Settings />, path: '/settings' },
  ];

  const MenuItem = ({ item, isCollapsed }) => {
    const hasSubmenu = item.hasSubmenu && item.submenu;
    const isExpanded = expandedMenus[item.key];

    if (hasSubmenu) {
      return (
        <>
          <ListItemButton
            onClick={() => toggleMenu(item.key)}
            sx={{
              minHeight: 48,
              justifyContent: isCollapsed && !isMobile ? 'center' : 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed && !isMobile ? 0 : 3,
                color: 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {(!isCollapsed || isMobile) && (
              <>
                <ListItemText primary={item.label} />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
          
          {isExpanded && (!isCollapsed || isMobile) && (
            <Collapse in={isExpanded} timeout="auto">
              <List component="div" disablePadding>
                {item.submenu.map((subItem) => (
                  <ListItemButton
                    key={subItem.key}
                    component={NavLink}
                    to={subItem.path}
                    sx={{
                      pl: 8,
                      minHeight: 40,
                      '&.active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRight: '3px solid #ffffff',
                      },
                    }}
                  >
                    <ListItemText primary={subItem.label}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}/>
                  </ListItemButton>

                ))}
              </List>
            </Collapse>
          )}
        </>
      );
    }

    return (
      <ListItemButton
        component={NavLink}
        to={item.path}
        sx={{
          minHeight: 48,
          justifyContent: isCollapsed && !isMobile ? 'center' : 'initial',
          px: 2.5,
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRight: isCollapsed && !isMobile ? 'none' : '3px solid #ffffff',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed && !isMobile ? 0 : 3,
            color: 'inherit',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {(!isCollapsed || isMobile) && <ListItemText primary={item.label} />}
      </ListItemButton>
    );
  };

  const UserSection = ({ isCollapsed }) => (
    <Box sx={{ mt: 'auto', p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
      {!isCollapsed || isMobile ? (
        <Box sx={{ px: 1 }}>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.875rem', fontWeight: 500 }} noWrap>
                {user?.full_name || user?.name || 'Користувач'}
              </Typography>
              <IconButton onClick={handleLogout} sx={{ color: 'inherit' }}>
                <ExitToApp />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              onClick={loginWithRedirect}
              fullWidth
              size="small"
              sx={{
                textTransform: 'none',
                color: 'inherit',
                borderColor: 'currentColor',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              Увійти / Зареєструватися
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={isAuthenticated ? handleLogout : loginWithRedirect}
            sx={{
              color: 'inherit',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            {isAuthenticated ? <ExitToApp /> : <AccountCircle />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  const drawerWidth = collapsed ? theme.custom.collapsedDrawerWidth : theme.custom.drawerWidth;

  const DrawerContent = ({ isCollapsed }) => (
    <>
      <List sx={{ flexGrow: 1, pt: isMobile ? 8 : 1 }}>
        {menuItems.map((item) => (
          <MenuItem key={item.key} item={item} isCollapsed={isCollapsed} />
        ))}
      </List>
      <UserSection isCollapsed={isCollapsed} />
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              sx={{ color: 'inherit', '&:hover': { backgroundColor: 'transparent' } }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            color: '#ffffff',
            backgroundColor: theme.palette.primary.main,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              boxShadow: 'none',
            },
          }}
        >
          <Menu />
        </IconButton>
      )}

      {isMobile ? (
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          sx={{
            '& .MuiDrawer-paper': {
              width: theme.custom.drawerWidth,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <DrawerContent isCollapsed={false} />
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: 'width 0.3s ease-in-out',
              overflowX: 'hidden',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <DrawerContent isCollapsed={collapsed} />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
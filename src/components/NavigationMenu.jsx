import { Menu } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';

const NavigationMenu = ({ selectedMenuItem, onMenuSelect }) => {
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Панель керування',
    },
    {
      key: '2',
      icon: <ThunderboltOutlined />,
      label: 'Лічильники',
      children: [
        { key: '2-1', label: 'Всі лічильники' },
        { key: '2-2', label: 'Електрика' },
        { key: '2-3', label: 'Вода' },
        { key: '2-4', label: 'Газ' },
      ],
    },
    {
      key: '3',
      icon: <BarChartOutlined />,
      label: 'Звіти',
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'Налаштування',
    },
  ];

  return (
    <Menu
      theme="dark"
      selectedKeys={[selectedMenuItem]}
      mode="inline"
      items={menuItems}
      onSelect={({ key }) => onMenuSelect(key)}
    />
  );
};

export default NavigationMenu;

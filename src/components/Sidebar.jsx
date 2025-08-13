import { Menu, Layout } from 'antd';
import { DashboardOutlined, SettingOutlined, FileTextOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse, selectedMenuItem, onMenuSelect }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" selectedKeys={[selectedMenuItem]} onSelect={({ key }) => onMenuSelect(key)} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          Панель керування
        </Menu.Item>
        <Menu.SubMenu key="2" icon={<SettingOutlined />} title="Лічильники">
          <Menu.Item key="2-1">Всі лічильники</Menu.Item>
          <Menu.Item key="2-2">Електрика</Menu.Item>
          <Menu.Item key="2-3">Вода</Menu.Item>
          <Menu.Item key="2-4">Газ</Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="3" icon={<FileTextOutlined />}>
          Звіти
        </Menu.Item>
        <Menu.Item key="4" icon={<SettingOutlined />}>
          Налаштування
        </Menu.Item>
        <Menu.Item key="5" icon={<EnvironmentOutlined />}>
          Локації
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;

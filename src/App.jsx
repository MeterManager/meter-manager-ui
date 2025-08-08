import '@ant-design/v5-patch-for-react-19';
import './App.css';
import { useState } from 'react';

import { Layout, Menu } from 'antd';

import { DashboardOutlined, ThunderboltOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'MM' : 'MeterManager'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={menuItems}
          onSelect={({ key }) => setSelectedMenuItem(key)}
        />
      </Sider>

      <Layout></Layout>
    </Layout>
  );
};

export default App;

import '@ant-design/v5-patch-for-react-19';
import './App.css';
import { useState } from 'react';
import { Layout } from 'antd';

import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');

  const handleCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  const handleMenuSelect = (key) => {
    setSelectedMenuItem(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={handleCollapse}
        selectedMenuItem={selectedMenuItem}
        onMenuSelect={handleMenuSelect}
      />
      <MainContent selectedMenuItem={selectedMenuItem} />
    </Layout>
  );
};

export default App;

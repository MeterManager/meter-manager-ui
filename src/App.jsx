import '@ant-design/v5-patch-for-react-19';
import './App.css'
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Modal,
  InputNumber,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Divider,
  Badge,
  Avatar,
  Dropdown,
  notification
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BarChartOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Панель керування'
    },
    {
      key: '2',
      icon: <ThunderboltOutlined />,
      label: 'Лічильники',
      children: [
        { key: '2-1', label: 'Всі лічильники' },
        { key: '2-2', label: 'Електрика' },
        { key: '2-3', label: 'Вода' },
        { key: '2-4', label: 'Газ' }
      ]
    },
    {
      key: '3',
      icon: <BarChartOutlined />,
      label: 'Звіти'
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'Налаштування'
    }
  ];

  const userMenuItems = [
    { key: '1', label: 'Профіль' },
    { key: '2', label: 'Налаштування' },
    { key: '3', label: 'Вийти' }
  ];

  const handleAddMeter = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    notification.success({
      message: 'Успішно!',
      description: 'Лічильник додано успішно.'
    });
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          background: '#001529'
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
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

      <Layout>
       

      </Layout>

      
    </Layout>
  );
};

export default App;
import { Layout, Typography } from 'antd';
import LocationsPage from '../pages/LocationsPage';

const { Content } = Layout;
const { Title } = Typography;

const MainContent = ({ selectedMenuItem }) => {
  const getContentByMenuItem = (key) => {
    switch (key) {
      case '1':
        return (
          <div>
            <Title level={2}>Панель керування</Title>
            <p>Тут буде основна панель керування з статистикою та основними функціями.</p>
          </div>
        );
      case '2':
      case '2-1':
        return (
          <div>
            <Title level={2}>Всі лічильники</Title>
            <p>Тут буде список всіх лічильників.</p>
          </div>
        );
      case '2-2':
        return (
          <div>
            <Title level={2}>Лічильники електрики</Title>
            <p>Тут будуть лічильники електроенергії.</p>
          </div>
        );
      case '2-3':
        return (
          <div>
            <Title level={2}>Лічильники води</Title>
            <p>Тут будуть лічильники води.</p>
          </div>
        );
      case '2-4':
        return (
          <div>
            <Title level={2}>Лічильники газу</Title>
            <p>Тут будуть лічильники газу.</p>
          </div>
        );
      case '3':
        return (
          <div>
            <Title level={2}>Звіти</Title>
            <p>Тут будуть звіти по споживанню.</p>
          </div>
        );
      case '4':
        return (
          <div>
            <Title level={2}>Налаштування</Title>
            <p>Тут будуть налаштування системи.</p>
          </div>
        );
      case '5':
        return <LocationsPage />;
      default:
        return (
          <div>
            <Title level={2}>Панель керування</Title>
            <p>Оберіть пункт меню для відображення контенту.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: '8px' }}>
        {getContentByMenuItem(selectedMenuItem)}
      </Content>
    </Layout>
  );
};

export default MainContent;

// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, App as AntApp, Button } from 'antd';
import { ScanOutlined, EditOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import ParticipantPage from './pages/ParticipantPage';
import ConsumerPage from './pages/ConsumerPage';

const { Header, Content, Footer } = Layout;

const contentWrapperStyle = {
  background: '#fff',
  padding: 24,
  minHeight: 280,
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
};

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const items = [
    {
      label: <Link to="/">{t('nav_consumer')}</Link>,
      key: 'home',
      icon: <ScanOutlined />,
    },
    {
      label: <Link to="/participant">{t('nav_participant')}</Link>,
      key: 'participant',
      icon: <EditOutlined />,
    },
  ];

  return (
    <AntApp> 
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'white', fontSize: '20px', marginRight: '50px', whiteSpace: 'nowrap' }}>
              {t('app_title')}
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['home']}
              items={items}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button 
              type="primary" 
              icon={<GlobalOutlined />} 
              onClick={toggleLanguage}
              style={{ marginLeft: 'auto' }}
            >
              {i18n.language === 'zh' ? 'English' : '中文'}
            </Button>
          </Header>
          <Content style={{ padding: '20px 50px' }}>
            <div style={contentWrapperStyle}>
              <Routes>
                <Route path="/" element={<ConsumerPage />} />
                <Route path="/participant" element={<ParticipantPage />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            {t('footer')}
          </Footer>
        </Layout>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;
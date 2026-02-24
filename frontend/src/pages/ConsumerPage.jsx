// src/pages/ConsumerPage.jsx
import React, { useState } from 'react';
import { Input, Timeline, Typography, Spin, Descriptions, Empty, Row, Col, App } from 'antd';
import { getFoodHistory, queryFood } from '../api';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
const { Title } = Typography;

const ConsumerPage = () => {
  const { message } = App.useApp(); 
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [currentFood, setCurrentFood] = useState(null);
  const [foodHistory, setFoodHistory] = useState([]);

  const onSearch = async (value) => {
    const foodId = value.trim();
    if (!foodId) {
      message.error(t('consumer_msg_empty_id'));
      return;
    }
    
    setLoading(true);
    setCurrentFood(null);
    setFoodHistory([]);

    try {
      const [currentRes, historyRes] = await Promise.all([
        queryFood(foodId),
        getFoodHistory(foodId)
      ]);

      setCurrentFood(currentRes.data);
      
      const timelineItems = historyRes.data.map(item => ({
        color: item.record.status === '已生产' ? 'green' : 'blue',
        icon: <ClockCircleOutlined />,
        children: (
          <>
            <p><strong>{item.record.status}</strong> ({t('consumer_history_owner')}: {item.record.ownerOrg})</p>
            <p>{t('consumer_history_details')}: {item.record.details}</p>
            <p>{t('consumer_history_time')}: {new Date(item.timestamp).toLocaleString()}</p>
            <p style={{ fontSize: '10px', color: '#999' }}>TxID: {item.txId.substring(0, 30)}...</p>
          </>
        ),
      }));
      setFoodHistory(timelineItems);

      message.success(t('consumer_msg_success', { id: foodId }));

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message;
      if (errorMsg.includes('不存在')) {
        message.error(t('consumer_msg_not_found', { id: foodId }));
      } else {
        message.error(t('consumer_msg_error', { error: errorMsg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Title level={3}>{t('consumer_title')}</Title>
      <Search
        placeholder={t('consumer_search_placeholder')}
        enterButton={t('consumer_search_btn')}
        size="large"
        onSearch={onSearch}
        loading={loading}
      />
      {!currentFood && !loading && (
        <Empty description={t('consumer_empty')} style={{ marginTop: '50px' }} />
      )}
      {currentFood && (
        <Row gutter={16} style={{ marginTop: '30px' }}>
          <Col span={12}>
            <Title level={4}>{t('consumer_current_status', { id: currentFood.id })}</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label={t('consumer_status_label')}>{currentFood.status}</Descriptions.Item>
              <Descriptions.Item label={t('consumer_owner_label')}>{currentFood.ownerOrg}</Descriptions.Item>
              <Descriptions.Item label={t('consumer_origin_label')}>{currentFood.origin}</Descriptions.Item>
              <Descriptions.Item label={t('consumer_supplier_label')}>{currentFood.supplierName}</Descriptions.Item>
              <Descriptions.Item label={t('consumer_time_label')}>{new Date(currentFood.createTime).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label={t('consumer_details_label')}>{currentFood.details}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Title level={4}>{t('consumer_history_title')}</Title>
            <Timeline
              mode="left"
              items={foodHistory}
            />
          </Col>
        </Row>
      )}
    </Spin>
  );
};

export default ConsumerPage;
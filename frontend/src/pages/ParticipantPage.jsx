// src/pages/ParticipantPage.jsx
import React from 'react';
import { Form, Input, Button, Select, Tabs, Spin, Typography, App } from 'antd';
import { createFood, updateFoodStatus } from '../api';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;

const ParticipantPage = () => {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const handleCreate = async (values) => {
    console.log('创建食品:', values);
    setLoading(true);
    try {
      const data = { ...values, org: 'Supplier' };
      const res = await createFood(data);
      message.success(res.data.message || t('consumer_msg_success', { id: values.id }));
      createForm.resetFields();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message;
      message.error(t('participant_msg_create_fail', { error: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    console.log('更新状态:', values);
    setLoading(true);
    try {
      const res = await updateFoodStatus(values);
      message.success(res.data.message || t('consumer_msg_success', { id: values.id }));
      updateForm.resetFields();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message;
      message.error(t('participant_msg_update_fail', { error: errorMsg }));
    } finally {
      setLoading(false);
    }
  };
  
  const items = [
    {
      key: '1',
      label: t('participant_tab_create'),
      children: (
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          style={{ maxWidth: 500 }}
        >
          <Form.Item
            name="id"
            label={t('participant_create_id')}
            rules={[{ required: true, message: t('participant_create_id_req') }]}
          >
            <Input placeholder={t('participant_create_id_ph')} />
          </Form.Item>
          <Form.Item
            name="origin"
            label={t('participant_create_origin')}
            rules={[{ required: true, message: t('participant_create_origin_req') }]}
          >
            <Input placeholder={t('participant_create_origin_ph')} />
          </Form.Item>
          <Form.Item
            name="details"
            label={t('participant_create_details')}
            rules={[{ required: true, message: t('participant_create_details_req') }]}
          >
            <Input.TextArea placeholder={t('participant_create_details_ph')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('participant_create_submit')}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: t('participant_tab_update'),
      children: (
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ maxWidth: 500 }}
        >
          <Form.Item
            name="org"
            label={t('participant_update_org')}
            rules={[{ required: true, message: t('participant_update_org_req') }]}
          >
            <Select placeholder={t('participant_update_org_ph')}>
              <Option value="Processor">{t('participant_update_org_processor')}</Option>
              <Option value="Logistics">{t('participant_update_org_logistics')}</Option>
              <Option value="Retailer">{t('participant_update_org_retailer')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="id"
            label={t('participant_create_id')}
            rules={[{ required: true, message: t('participant_create_id_req') }]}
          >
            <Input placeholder={t('participant_create_id_ph')} />
          </Form.Item>
           <Form.Item
            name="newStatus"
            label={t('participant_update_status')}
            rules={[{ required: true, message: t('participant_update_status_req') }]}
          >
            <Select placeholder={t('participant_update_status_ph')}>
              <Option value="加工中">{t('participant_update_status_processing')}</Option>
              <Option value="运输中">{t('participant_update_status_transit')}</Option>
              <Option value="已上架">{t('participant_update_status_shelved')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="newDetails"
            label={t('participant_update_details')}
            rules={[{ required: true, message: t('participant_update_details_req') }]}
          >
            <Input.TextArea placeholder={t('participant_update_details_ph')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('participant_update_submit')}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Title level={3}>{t('participant_title')}</Title>
      <Tabs defaultActiveKey="1" items={items} />
    </Spin>
  );
};

export default ParticipantPage;
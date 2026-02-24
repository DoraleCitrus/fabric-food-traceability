import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Premium Food Safety Traceability System",
      "nav_consumer": "Consumer Traceability",
      "nav_participant": "Participant Operations",
      "footer": "Fabric Premium Food Safety Traceability System ©2026 Created for Blockchain Final Project",
      
      "consumer_title": "Consumer Traceability Query",
      "consumer_search_placeholder": "Enter food batch ID (simulate scanning)",
      "consumer_search_btn": "Query",
      "consumer_empty": "No query results",
      "consumer_current_status": "Current Status (Batch: {{id}})",
      "consumer_status_label": "Current Status",
      "consumer_owner_label": "Current Owner",
      "consumer_origin_label": "Origin",
      "consumer_supplier_label": "Supplier",
      "consumer_time_label": "On-chain Time",
      "consumer_details_label": "Latest Details",
      "consumer_history_title": "Complete Flow History",
      "consumer_history_owner": "Owner",
      "consumer_history_details": "Details",
      "consumer_history_time": "Time",
      "consumer_msg_empty_id": "Please enter the food batch ID",
      "consumer_msg_success": "Batch {{id}} queried successfully",
      "consumer_msg_not_found": "No record found for batch {{id}}",
      "consumer_msg_error": "Query failed: {{error}}",

      "participant_title": "Participant Operations Panel",
      "participant_tab_create": "Create Food (Supplier)",
      "participant_tab_update": "Update Status (Processor/Logistics/Retailer)",
      "participant_create_id": "Food Batch ID",
      "participant_create_id_req": "Please enter the batch ID",
      "participant_create_id_ph": "e.g., P1001",
      "participant_create_origin": "Origin",
      "participant_create_origin_req": "Please enter the origin",
      "participant_create_origin_ph": "e.g., Yantai, Shandong",
      "participant_create_details": "Details",
      "participant_create_details_req": "Please enter details",
      "participant_create_details_ph": "e.g., Fuji Apples 10 tons",
      "participant_create_submit": "Submit to Chain",
      "participant_update_org": "Select Your Organization",
      "participant_update_org_req": "Please select an organization",
      "participant_update_org_ph": "Select your identity",
      "participant_update_org_processor": "Processor",
      "participant_update_org_logistics": "Logistics",
      "participant_update_org_retailer": "Retailer",
      "participant_update_status": "New Status",
      "participant_update_status_req": "Please enter the new status",
      "participant_update_status_ph": "Select a target status",
      "participant_update_status_processing": "Processing (Processor Op)",
      "participant_update_status_transit": "In Transit (Logistics Op)",
      "participant_update_status_shelved": "On Shelf (Retailer Op)",
      "participant_update_details": "Update Details",
      "participant_update_details_req": "Please enter details",
      "participant_update_details_ph": "e.g., Washed and packed / Cold chain transit / Shelved at Supermarket A",
      "participant_update_submit": "Update Status",
      "participant_msg_create_fail": "Creation failed: {{error}}",
      "participant_msg_update_fail": "Update failed: {{error}}"
    }
  },
  zh: {
    translation: {
      "app_title": "高端食品安全溯源系统",
      "nav_consumer": "消费者溯源",
      "nav_participant": "参与方操作",
      "footer": "Fabric 高端食品安全溯源系统 ©2026 Created for Blockchain Final Project",
      
      "consumer_title": "消费者溯源查询",
      "consumer_search_placeholder": "请输入食品批次号 (模拟扫码)",
      "consumer_search_btn": "查询",
      "consumer_empty": "暂无查询结果",
      "consumer_current_status": "当前状态 (批次: {{id}})",
      "consumer_status_label": "当前状态",
      "consumer_owner_label": "当前持有者",
      "consumer_origin_label": "来源地",
      "consumer_supplier_label": "供应商",
      "consumer_time_label": "上链时间",
      "consumer_details_label": "最新详情",
      "consumer_history_title": "完整流转历史",
      "consumer_history_owner": "持有者",
      "consumer_history_details": "详情",
      "consumer_history_time": "时间",
      "consumer_msg_empty_id": "请输入食品批次号",
      "consumer_msg_success": "批次 {{id}} 查询成功",
      "consumer_msg_not_found": "未找到批次 {{id}} 的记录",
      "consumer_msg_error": "查询失败: {{error}}",

      "participant_title": "参与方操作面板",
      "participant_tab_create": "创建食品 (供应商)",
      "participant_tab_update": "更新状态 (加工/物流/零售)",
      "participant_create_id": "食品批次号 (ID)",
      "participant_create_id_req": "请输入批次号",
      "participant_create_id_ph": "例如: P1001",
      "participant_create_origin": "来源地",
      "participant_create_origin_req": "请输入来源地",
      "participant_create_origin_ph": "例如: 山东烟台",
      "participant_create_details": "详情",
      "participant_create_details_req": "请输入详情",
      "participant_create_details_ph": "例如: 红富士苹果 10吨",
      "participant_create_submit": "提交上链",
      "participant_update_org": "选择你的组织",
      "participant_update_org_req": "请选择组织",
      "participant_update_org_ph": "选择你的身份",
      "participant_update_org_processor": "Processor (加工厂)",
      "participant_update_org_logistics": "Logistics (物流商)",
      "participant_update_org_retailer": "Retailer (零售商)",
      "participant_update_status": "新的状态",
      "participant_update_status_req": "请输入新状态",
      "participant_update_status_ph": "选择一个目标状态",
      "participant_update_status_processing": "加工中 (Processor 操作)",
      "participant_update_status_transit": "运输中 (Logistics 操作)",
      "participant_update_status_shelved": "已上架 (Retailer 操作)",
      "participant_update_details": "更新详情",
      "participant_update_details_req": "请输入详情",
      "participant_update_details_ph": "例如: 已清洗并打包 / 冷链运输中 / 已在A超市上架",
      "participant_update_submit": "更新状态",
      "participant_msg_create_fail": "创建失败: {{error}}",
      "participant_msg_update_fail": "更新失败: {{error}}"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 查询食品当前状态
 * @param {string} id - 食品批次号
 */
export const queryFood = (id) => {
  return apiClient.get(`/queryFood/${id}`);
};

/**
 * 查询食品历史
 * @param {string} id - 食品批次号
 */
export const getFoodHistory = (id) => {
  return apiClient.get(`/getFoodHistory/${id}`);
};

/**
 * 创建食品 (供应商)
 * @param {object} data - { id, origin, details, org: 'Supplier' }
 */
export const createFood = (data) => {
  return apiClient.post('/createFood', data);
};

/**
 * 更新食品状态 (加工厂, 物流商, 零售商)
 * @param {object} data - { id, newStatus, newDetails, org }
 */
export const updateFoodStatus = (data) => {
  return apiClient.put('/updateFoodStatus', data);
};
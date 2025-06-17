/**
 * Bank API service for frontend integration
 */

import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for bank API
const bankApi = axios.create({
  baseURL: `${API_BASE_URL}/bank`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
bankApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get account information
 * @param {string} accountId - Account ID
 * @returns {Promise} - API response
 */
export const getAccountInfo = async (accountId) => {
  try {
    const response = await bankApi.get('/account-info', {
      params: { account_id: accountId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

/**
 * Get transaction history
 * @param {string} accountId - Account ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} - API response
 */
export const getTransactionHistory = async (accountId, startDate, endDate) => {
  try {
    const response = await bankApi.get('/transactions', {
      params: { 
        account_id: accountId,
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

/**
 * Transfer funds between accounts
 * @param {string} fromAccount - Source account ID
 * @param {string} toAccount - Destination account ID
 * @param {number} amount - Amount to transfer
 * @param {string} description - Transaction description
 * @returns {Promise} - API response
 */
export const transferFunds = async (fromAccount, toAccount, amount, description) => {
  try {
    const response = await bankApi.post('/transfer', {
      from_account: fromAccount,
      to_account: toAccount,
      amount: amount,
      description: description
    });
    return response.data;
  } catch (error) {
    console.error('Error transferring funds:', error);
    throw error;
  }
};

/**
 * Get exchange rates
 * @param {string} baseCurrency - Base currency code
 * @returns {Promise} - API response
 */
export const getExchangeRates = async (baseCurrency = 'VND') => {
  try {
    const response = await bankApi.get('/exchange-rates', {
      params: { base_currency: baseCurrency }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

/**
 * Process a bank-related query from the chatbot
 * @param {Object} query - Query object
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise} - API response
 */
export const processBankQuery = async (query, userId, accountId) => {
  try {
    const response = await bankApi.post('/chatbot-query', {
      query: query,
      user_id: userId,
      account_id: accountId
    });
    return response.data;
  } catch (error) {
    console.error('Error processing bank query:', error);
    throw error;
  }
};

export default {
  getAccountInfo,
  getTransactionHistory,
  transferFunds,
  getExchangeRates,
  processBankQuery
};
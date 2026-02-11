import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const getQuickBooksinfo = async (payload) => {
    return AxiosService.get(`${BASE_URL}/quickbooks/info`, payload);
};

export const setupQuickBooks = async () => {
    return AxiosService.post(`${BASE_URL}/quickbooks/setup`);
};

export const disconnectQuickBooks = async () => {
    return AxiosService.post(`${BASE_URL}/quickbooks/disconnect`);
};

export const toggleQuickBooks = async (payload) => {
    return AxiosService.post(`${BASE_URL}/quickbooks/toggle`, payload);
};

export const saveIntegrationDefaults = async (payload) => {
    return AxiosService.post(`${BASE_URL}/quickbooks/save-defaults`, payload);
};

export const getQuickBooksDepositBanks = async () => {
    return AxiosService.get(`${BASE_URL}/quickbooks/deposit-banks`);
};

export const getQuickBooksExpenseBankAccounts = async () => {
    return AxiosService.get(`${BASE_URL}/quickbooks/expense-bank-accounts`);
};

export const getQuickBooksCreditCardAccounts = async () => {
    return AxiosService.get(`${BASE_URL}/quickbooks/credit-card-accounts`);
};

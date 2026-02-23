import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/subscriptions/search`, payload, {
        params
    });
};

export const show = (id) => {
    return AxiosService.get(`${BASE_URL}/subscriptions/${id}`, {
        params: { include: 'company,plan,payments' }
    });
};

export const searchPayments = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/subscription-payments/search`, payload, {
        params
    });
};

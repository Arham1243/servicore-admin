import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const getConfiguration = () => {
    return AxiosService.get(`${BASE_URL}/email-configuration`);
};

export const updateConfiguration = (payload) => {
    return AxiosService.post(`${BASE_URL}/email-configuration`, payload);
};

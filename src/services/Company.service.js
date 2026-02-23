import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/companies/search`, payload, {
        params
    });
};

export const impersonate = (companyId) => {
    return AxiosService.post(`${BASE_URL}/companies/${companyId}/impersonate`);
};

import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/menus/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/menus`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/menus/${id}`, payload);
};

export const changeStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/menus/${id}/change-status`,
        payload
    );
};

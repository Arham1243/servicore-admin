import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/admins/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/admins`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/admins/${id}`, payload);
};

export const show = (id) => {
    return AxiosService.get(`${BASE_URL}/admins/${id}`);
};

export const changeStatus = (id, payload) => {
    return AxiosService.post(`${BASE_URL}/admins/${id}/change-status`, payload);
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/admins/${id}/delete`);
};

import AxiosService from './Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const dashboardService = {
    async getSummary() {
        const response = await AxiosService.get(
            `${BASE_URL}/dashboard/summary`
        );
        return response.data;
    }
};

import AxiosService from './Axios.service';
const AUTH_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const login = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/login`, payload);
};

export const logout = () => {
    return AxiosService.post(`${AUTH_BASE_URL}/logout`);
};

export const forgotPassword = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/password/forgot`, payload);
};

export const resetPassword = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/password/reset`, payload);
};

export const setupPassword = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/password/set`, payload);
};

export const me = () => {
    return AxiosService.get(`${AUTH_BASE_URL}/me`);
};

export const verifyOtp = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/otp/verify`, payload);
};

export const resendOtp = (payload) => {
    return AxiosService.post(`${AUTH_BASE_URL}/otp/resend`, payload);
};

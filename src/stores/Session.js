import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCookies } from 'vue3-cookies';

import { AuthService } from '@/services';
import { updateAbility } from '@/plugins/ability';

export const useSessionStore = defineStore('SessionStore', () => {
    const { cookies } = useCookies();
    const user = ref(null);
    const permissions = ref([]);
    const intendedRoute = ref(sessionStorage.getItem('intendedRoute'));
    const freeTrialPlanAvailable = ref(false);

    const startUserSession = (data) => {
        const date = new Date();

        const authCookie = getCookie() || {};
        authCookie.access_token = data.access_token;
        authCookie.expires_in = date.setSeconds(
            date.getSeconds() + data.expires_in
        );

        if (data.refresh_token) {
            authCookie.refresh_token = data.refresh_token;
        }

        setCookie(authCookie);
    };

    const clearSessionState = () => {
        cookies.remove('servicore_admin_cookie', null);
        sessionStorage.removeItem('email');
        user.value = null;
    };

    const setCookie = (value) => {
        cookies.set('servicore_admin_cookie', value, '7d');
    };

    const getCookie = () => {
        return cookies.get('servicore_admin_cookie');
    };

    const setEmail = (value) => {
        sessionStorage.setItem('email', value);
    };

    const getEmail = () => {
        return sessionStorage.getItem('email');
    };

    const me = async () => {
        try {
            const res = (await AuthService.me()).data;
            user.value = res.data;
            freeTrialPlanAvailable.value = res.free_trial_plan_available;
            permissions.value = res.permissions || [];
            updateAbility(permissions.value);
            return user.value;
        } catch (error) {
            throw error;
        }
    };

    const setIntended = (route) => {
        intendedRoute.value = route;
        sessionStorage.setItem('intendedRoute', route);
    };

    const consumeIntended = () => {
        const route = intendedRoute.value;
        intendedRoute.value = null;
        sessionStorage.removeItem('intendedRoute');
        return route;
    };

    return {
        startUserSession,
        clearSessionState,
        me,
        user,
        permissions,
        freeTrialPlanAvailable,

        setEmail,
        setCookie,
        getCookie,

        getEmail,
        setIntended,
        consumeIntended
    };
});

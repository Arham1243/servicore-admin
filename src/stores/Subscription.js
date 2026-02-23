import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { SubscriptionService } from '@/services';

export const useSubscriptionStore = defineStore('SubscriptionStore', () => {
    const globalStore = useGlobalStore();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await SubscriptionService.search(payload, params);
            return res.data;
        });
    };

    const show = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await SubscriptionService.show(id);
            return res.data;
        });
    };

    const searchPayments = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await SubscriptionService.searchPayments(payload, params);
            return res.data;
        });
    };

    return {
        search,
        show,
        searchPayments
    };
});

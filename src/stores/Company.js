import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { CompanyService } from '@/services';

export const useCompanyStore = defineStore('CompanyStore', () => {
    const globalStore = useGlobalStore();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CompanyService.search(payload, params);
            return res.data;
        });
    };

    const impersonate = (companyId) => {
        return globalStore.actionWrapper(async () => {
            const res = await CompanyService.impersonate(companyId);
            return res.data;
        });
    };

    return {
        search,
        impersonate
    };
});

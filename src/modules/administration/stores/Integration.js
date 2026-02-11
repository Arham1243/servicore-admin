import { defineStore } from 'pinia';
import { IntegrationService } from '@/modules/administration/services';
import { useGlobalStore } from '@/stores';

export const useIntegrationStore = defineStore('IntegrationStore', () => {
    const globalStore = useGlobalStore();

    const getQuickBooksinfo = () => {
        return globalStore.actionWrapper(async () => {
            const res = await IntegrationService.getQuickBooksinfo();
            return res;
        });
    };

    const setupQuickBooks = () => {
        return globalStore.actionWrapper(async () => {
            const res = await IntegrationService.setupQuickBooks();
            return res;
        });
    };

    const disconnectQuickBooks = () => {
        return globalStore.actionWrapper(async () => {
            const res = await IntegrationService.disconnectQuickBooks();
            return res;
        });
    };

    const toggleQuickBooks = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await IntegrationService.toggleQuickBooks(payload);
            return res;
        });
    };

    const saveIntegrationDefaults = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await IntegrationService.saveIntegrationDefaults(payload);
            globalStore.showSuccess(
                'QuickBooks defaults saved',
                'QuickBooks defaults saved successfully'
            );
            return res;
        });
    };

    const getQuickBooksDepositBanks = () => {
        return globalStore.actionWrapper(async () => {
            const res = await IntegrationService.getQuickBooksDepositBanks();
            return res.data;
        });
    };

    const getQuickBooksExpenseBankAccounts = () => {
        return globalStore.actionWrapper(async () => {
            const res =
                await IntegrationService.getQuickBooksExpenseBankAccounts();
            return res.data;
        });
    };

    const getQuickBooksCreditCardAccounts = () => {
        return globalStore.actionWrapper(async () => {
            const res =
                await IntegrationService.getQuickBooksCreditCardAccounts();
            return res.data;
        });
    };

    return {
        getQuickBooksinfo,
        setupQuickBooks,
        disconnectQuickBooks,
        toggleQuickBooks,
        saveIntegrationDefaults,
        getQuickBooksDepositBanks,
        getQuickBooksExpenseBankAccounts,
        getQuickBooksCreditCardAccounts
    };
});

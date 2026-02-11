import { defineStore } from 'pinia';
import { CommonService } from '@/services';
import { useGlobalStore } from '@/stores';

export const useCommonStore = defineStore('CommonStore', () => {
    const globalStore = useGlobalStore();

    return {
    };
});

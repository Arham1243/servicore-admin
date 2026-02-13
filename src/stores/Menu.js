import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { MenuService } from '@/services';

export const useMenuStore = defineStore('MenuStore', () => {
    const globalStore = useGlobalStore();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.search(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.create(payload);
            globalStore.showSuccess(
                'Menu created',
                'Menu created successfully'
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.update(id, payload);
            globalStore.showSuccess(
                'Menu updated',
                'Menu updated successfully'
            );
            return res.data;
        });
    };
    const changeStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.changeStatus(id, payload);
            globalStore.showSuccess(
                'Menu updated',
                'Menu updated successfully'
            );
            return res.data;
        });
    };
    return {
        changeStatus,
        search,
        create,
        update,
    };
});

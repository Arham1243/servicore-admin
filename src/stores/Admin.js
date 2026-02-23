import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { AdminService } from '@/services';

export const useAdminStore = defineStore('AdminStore', () => {
    const globalStore = useGlobalStore();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.create(payload);
            globalStore.showSuccess(
                'Admin created',
                'Admin created successfully'
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.update(id, payload);
            globalStore.showSuccess(
                'Admin updated',
                'Admin updated successfully'
            );
            return res.data;
        });
    };

    const show = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.show(id);
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.deleteItem(id);
            globalStore.showSuccess(
                'Admin deleted',
                'Admin deleted successfully'
            );
            return res.data;
        });
    };

    const changeStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminService.changeStatus(id, payload);
            globalStore.showSuccess(
                'Admin updated',
                'Admin status updated successfully'
            );
            return res.data;
        });
    };

    return {
        changeStatus,
        search,
        create,
        update,
        show,
        deleteItem
    };
});

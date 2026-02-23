import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { AdminRoleService } from '@/services';

export const useAdminRoleStore = defineStore('AdminRoleStore', () => {
    const globalStore = useGlobalStore();
    const currentItem = ref({});

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.search(payload, params);
            return res.data;
        });
    };

    const getItem = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.show(id);
            currentItem.value = res.data.data;
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.create(payload);
            globalStore.showSuccess(
                'Role created',
                'Role created successfully'
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.update(id, payload);
            globalStore.showSuccess(
                'Role updated',
                'Role updated successfully'
            );
            return res.data;
        });
    };

    const changeStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.changeStatus(id, payload);
            globalStore.showSuccess(
                'Role status updated',
                'Role status updated successfully'
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.deleteItem(id);
            globalStore.showSuccess(
                'Role deleted',
                'Role deleted successfully'
            );
            return res.data;
        });
    };

    const getRolePermissions = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.getRolePermissions(id);
            return res.data;
        });
    };

    const syncRolePermissions = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AdminRoleService.syncRolePermissions(id, payload);
            globalStore.showSuccess(
                'Role permissions synced',
                'Role permissions synced successfully'
            );
            return res.data;
        });
    };

    return {
        search,
        create,
        update,
        deleteItem,
        changeStatus,
        getItem,
        getRolePermissions,
        syncRolePermissions,
        currentItem
    };
});

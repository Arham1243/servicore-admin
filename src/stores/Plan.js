import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { PlanService } from '@/services';

export const usePlanStore = defineStore('PlanStore', () => {
    const globalStore = useGlobalStore();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.search(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.create(payload);
            globalStore.showSuccess(
                'Plan created',
                'Plan created successfully'
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.update(id, payload);
            globalStore.showSuccess(
                'Plan updated',
                'Plan updated successfully'
            );
            return res.data;
        });
    };
    const show = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.show(id);
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.deleteItem(id);
            globalStore.showSuccess(
                'Plan deleted',
                'Plan deleted successfully'
            );
            return res.data;
        });
    };
    const changeStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.changeStatus(id, payload);
            globalStore.showSuccess(
                'Plan updated',
                'Plan status updated successfully'
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

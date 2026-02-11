import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGlobalStore } from '@/stores';
import { EmailConfigurationService } from '@/modules/administration/services';

export const useEmailConfigurationStore = defineStore(
    'EmailConfigurationStore',
    () => {
        const globalStore = useGlobalStore();
        const currentConfig = ref(null);

        const getConfiguration = () => {
            return globalStore.actionWrapper(async () => {
                const res = await EmailConfigurationService.getConfiguration();
                currentConfig.value = res.data.data;
                return res.data;
            });
        };

        const updateConfiguration = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await EmailConfigurationService.updateConfiguration(
                        payload
                    );
                globalStore.showSuccess(
                    'Configuration updated',
                    'Email configuration updated successfully'
                );
                return res.data;
            });
        };

        return {
            getConfiguration,
            updateConfiguration,
            currentConfig
        };
    }
);

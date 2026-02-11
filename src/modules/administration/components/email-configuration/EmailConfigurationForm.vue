<script setup>
import { ref, onBeforeMount } from 'vue';
import { useEmailConfigurationStore } from '@/modules/administration/stores';
import { useFormDirty } from '@/composables/useFormDirty';
import { useGlobalStore } from '@/stores';

const emailConfigurationStore = useEmailConfigurationStore();
const globalStore = useGlobalStore();
const busy = ref(false);
const loading = ref(false);
const formData = ref({
    domain: '',
    api_key: ''
});
const { isDirty, resetDirty } = useFormDirty(formData);

onBeforeMount(async () => {
    await getConfiguration();
});

function cancel() {
    getConfiguration();
}

const save = async () => {
    try {
        busy.value = true;
        await emailConfigurationStore.updateConfiguration(formData.value);
        await getConfiguration();
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const getConfiguration = async () => {
    try {
        loading.value = true;
        const res = await emailConfigurationStore.getConfiguration();
        formData.value = {
            domain: res.data.domain || '',
            api_key: res.data.api_key || ''
        };
        resetDirty(formData.value);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <template v-else>
        <TitleHeader>
            <template #title>
                <h1 class="text-2xl font-bold">Email Configuration</h1>
            </template>
            <template #actions>
                <Button
                    label="Cancel"
                    variant="outlined"
                    @click="cancel"
                    :disabled="!isDirty || busy"
                />
                <Button
                    :disabled="!isDirty || busy"
                    label="Save"
                    icon="pi pi-check"
                    @click="save"
                    :loading="busy"
                />
            </template>
        </TitleHeader>

        <Card class="py-3 px-2">
            <template #content>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required">Domain</label>
                        <InputField
                            variant="text"
                            id="domain"
                            v-model="formData.domain"
                            @keyup.enter="save"
                            :disabled="busy"
                            class="w-full"
                            placeholder="Enter Mailgun domain"
                        />
                    </div>
                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required">API Key</label>
                        <Password
                            id="api_key"
                            v-model="formData.api_key"
                            @keyup.enter="save"
                            :disabled="busy"
                            class="w-full"
                            inputClass="w-full"
                            placeholder="Enter Mailgun API key"
                            :feedback="false"
                            toggleMask
                        />
                    </div>
                </div>
            </template>
        </Card>
    </template>
</template>

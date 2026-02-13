<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { usePlanStore, useGlobalStore } from '@/stores';
import { useFormDirty } from '@/composables/useFormDirty';

const props = defineProps({
    mode: { type: String, required: true }
});

const router = useRouter();
const route = useRoute();
const planStore = usePlanStore();
const globalStore = useGlobalStore();
const busy = ref(false);
const loading = ref(false);
const planId = ref(route.params.id);
const isEditMode = ref(props.mode === 'edit');
const showUnsavedDialog = ref(false);
let nextRoute = null;

const formData = ref({
    name: '',
    description: '',
    monthly_sale_price: null,
    monthly_cost_price: null,
    yearly_sale_price: null,
    yearly_cost_price: null,
    trial_days: null,
    status: true
});

const { isDirty, resetDirty } = useFormDirty(formData);

onBeforeMount(async () => {
    if (isEditMode.value) {
        await getItem();
    }
});

onBeforeRouteLeave((to, from, next) => {
    if (isDirty.value) {
        showUnsavedDialog.value = true;
        nextRoute = next;
    } else {
        next();
    }
});

const pushRoute = (name, params = {}) => router.push({ name, params });

function cancel() {
    if (isDirty.value) {
        showUnsavedDialog.value = true;
    } else {
        goBack();
    }
}

function confirmDiscard() {
    showUnsavedDialog.value = false;
    if (nextRoute) {
        const go = nextRoute;
        nextRoute = null;
        go();
    } else {
        goBack();
    }
}

function goBack() {
    pushRoute('Plans');
}

async function resetForm() {
    if (isEditMode.value) {
        await getItem();
    } else {
        Object.assign(formData.value, {
            name: '',
            description: '',
            monthly_sale_price: null,
            monthly_cost_price: null,
            yearly_sale_price: null,
            yearly_cost_price: null,
            trial_days: null,
            status: true
        });
    }
    globalStore.clearErrors();
}

const save = async () => {
    try {
        busy.value = true;
        if (isEditMode.value) {
            await planStore.update(planId.value, formData.value);
            await getItem();
        } else {
            const res = await planStore.create(formData.value);
            resetForm();
            pushRoute('EditPlan', { id: res?.data?.id });
        }
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const getItem = async () => {
    if (!planId.value) return;
    try {
        loading.value = true;
        const res = await planStore.show(planId.value);
        formData.value = {
            name: res.data.name || '',
            description: res.data.description || '',
            monthly_sale_price: res.data.monthly_sale_price,
            monthly_cost_price: res.data.monthly_cost_price,
            yearly_sale_price: res.data.yearly_sale_price,
            yearly_cost_price: res.data.yearly_cost_price,
            trial_days: res.data.trial_days,
            status: res.data.status
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
                <div class="flex items-center gap-5">
                    <Button
                        type="button"
                        variant="outlined"
                        icon="pi pi-chevron-left"
                        size="large"
                        @click="goBack"
                        iconClass="!text-sm"
                        :disabled="busy"
                    />
                    <h1 class="text-2xl font-bold">
                        {{ isEditMode ? 'Edit Plan' : 'New Plan' }}
                    </h1>
                </div>
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
                <div class="grid grid-cols-12 gap-4 space-y-2">
                    <div class="col-span-12 flex justify-end">
                        <div>
                            <div class="flex items-center gap-3">
                                <ToggleSwitch
                                    binary
                                    inputId="status"
                                    v-model="formData.status"
                                    size="large"
                                    :disabled="busy"
                                />
                                <label
                                    for="status"
                                    class="text-gray-600 text-lg cursor-pointer"
                                >
                                    {{
                                        formData.status ? 'Active' : 'Inactive'
                                    }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12">
                        <label class="block mb-2 required">Plan Name</label>
                        <InputField
                            variant="text"
                            id="name"
                            v-model="formData.name"
                            @keyup.enter="save"
                            :disabled="busy"
                            class="w-full"
                        />
                    </div>

                    <div class="col-span-12">
                        <label class="block mb-2">Description</label>
                        <InputField
                            variant="textarea"
                            id="description"
                            v-model="formData.description"
                            :disabled="busy"
                            class="w-full"
                            rows="3"
                        />
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required"
                            >Monthly Sale Price</label
                        >
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            id="monthly_sale_price"
                            v-model="formData.monthly_sale_price"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="2"
                            @keyup.enter="save"
                            prefix="$"
                            :min="0.01"
                        />
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required"
                            >Monthly Cost Price</label
                        >
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            id="monthly_cost_price"
                            v-model="formData.monthly_cost_price"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="2"
                            @keyup.enter="save"
                            prefix="$"
                            :min="0.01"
                        />
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required"
                            >Yearly Sale Price</label
                        >
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            id="yearly_sale_price"
                            v-model="formData.yearly_sale_price"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="2"
                            @keyup.enter="save"
                            prefix="$"
                            :min="0.01"
                        />
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2 required"
                            >Yearly Cost Price</label
                        >
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            id="yearly_cost_price"
                            v-model="formData.yearly_cost_price"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="2"
                            @keyup.enter="save"
                            prefix="$"
                            :min="0.01"
                        />
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                        <label class="block mb-2">Trial Days</label>
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            id="trial_days"
                            v-model="formData.trial_days"
                            variant="number"
                            :maxFractionDigits="0"
                            :minFractionDigits="0"
                            @keyup.enter="save"
                            :min="0"
                        />
                    </div>
                </div>
            </template>
        </Card>

        <Confirmation
            v-model="showUnsavedDialog"
            header="Unsaved Changes"
            content="You have unsaved changes. If you continue, those changes will be lost. Do you want to discard them?"
            variant="danger"
            confirmButtonText="Discard Changes"
            cancelButtonText="Keep Editing"
            @confirm="confirmDiscard"
        />
    </template>
</template>

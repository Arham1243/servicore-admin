<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { usePaymentMethodStore } from '@/modules/administration/stores';
import { useGlobalStore, useSessionStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { truncate } from 'lodash-es';
import { useHelpers } from '@/composables';

const helpers = useHelpers();

const paymentMethodStore = usePaymentMethodStore();
const globalStore = useGlobalStore();
const sessionStore = useSessionStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const searchText = ref('');
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const isEditMode = ref(false);
const quicbooksConnected = sessionStore?.myCompany?.qbo_connected;
const busy = ref(false);
const totalRecords = ref();
const showDialog = ref(false);
const deleteDialog = ref(false);
const changeStatusDialog = ref(false);
const defaultDialog = ref(false);
const quickBooksList = ref([]);
const formData = ref({
    name: '',
    is_default: false,
    is_card_payment: false,
    system_link: '',
    status: true
});

onBeforeMount(async () => {
    await getQuickBooksList();
    await getItems();
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editItem(),
            permission: 'administration.edit'
        },
        {
            label: isItemActive.value ? 'Make Inactive' : 'Make Active',
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showChangeStatusDialog(),
            disabled: isItemDefault.value && isItemActive.value,
            permission: 'administration.edit'
        },
        !isItemDefault.value && {
            label: 'Set as Default',
            icon: 'pi pi-star',
            command: () => showDefaultDialog(),
            disabled: !isItemActive.value,
            permission: 'administration.edit'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'administration.delete'
        }
    ].filter(Boolean);

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status;
});

const isItemDefault = computed(() => {
    return selectedItem.value && selectedItem.value.is_default;
});

const getQboAccountName = (id) => {
    if (!id || !quickBooksList.value) return null;
    const account = quickBooksList.value.find((acc) => acc.Id == id);
    return account ? account.Name : null;
};

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    showDialog.value = true;
};

const closeDialog = () => {
    showDialog.value = false;
    resetForm();
};

const onShow = () => {
    resetForm();
};

const resetForm = () => {
    formData.value.name = '';
    formData.value.is_card_payment = false;
    formData.value.system_link = '';
    formData.value.status = true;
    formData.value.is_default = false;
    globalStore.clearErrors();
};

const editItem = () => {
    resetForm();
    formData.value.name = selectedItem.value.name;
    formData.value.system_link = selectedItem.value.system_link;
    formData.value.is_card_payment = selectedItem.value.is_card_payment;
    formData.value.is_default = selectedItem.value.is_default;
    formData.value.status = selectedItem.value.status;
    openDialog('edit');
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showChangeStatusDialog = () => {
    changeStatusDialog.value = true;
};

const showDefaultDialog = () => {
    defaultDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            filters: [
                {
                    field: 'is_system',
                    operator: '=',
                    value: false
                }
            ]
        };
        if (!payload.sort || payload.sort.length === 0) {
            payload.sort = [{ field: 'status', direction: 'desc' }];
        }
        const res = await paymentMethodStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const getQuickBooksList = async () => {
    if (!quicbooksConnected) return;
    try {
        loading.value = true;
        const res = await paymentMethodStore.getQuickBooksList();
        quickBooksList.value = res.data;
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    try {
        if (items.value.length === 0) {
            formData.value.is_default = true;
        }
        busy.value = true;
        if (isEditMode.value) {
            await paymentMethodStore.update(
                selectedItem.value.id,
                formData.value
            );
        } else {
            await paymentMethodStore.create(formData.value);
        }
        await getQuickBooksList();
        closeDialog();
        await getItems();
        selectedItem.value = {};
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await paymentMethodStore.deleteItem(selectedItem.value.id);
        }
        await getItems();
        selectedItem.value = {};
    } finally {
        loading.value = false;
    }
};

const changeStatus = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await paymentMethodStore.changeStatus(selectedItem.value.id);
        }
        await getItems();
        selectedItem.value = {};
    } finally {
        loading.value = false;
    }
};

const makeDefault = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await paymentMethodStore.makeDefault(selectedItem.value.id);
        }
        await getItems();
        selectedItem.value = {};
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <TitleHeader>
        <template #title>
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold">Payment Methods</h1>
                <p class="mt-2 text-sm sm:text-base mx-auto sm:mx-0 mb-0">
                    These payment methods are used for receiving and reconciling
                    invoices.
                </p>
            </div>
        </template>
        <template #actions>
            <Button
                v-if="$ability.can('administration.create')"
                label="Add New"
                @click="openDialog('add')"
            />
        </template>
    </TitleHeader>

    <Card class="py-3 px-2">
        <template #content>
            <BaseTable
                :value="items"
                :page="pagination.page"
                :rows="pagination.limit"
                :total-records="totalRecords"
                :loading="loading"
                @sort="onSortChange"
                @page="onPageChange"
            >
                <template #header>
                    <div class="flex justify-end mb-5">
                        <Search
                            v-model="searchText"
                            @search="search"
                            class="w-full sm:w-1/2 md:w-1/3 lg:w-1/3"
                        />
                    </div>
                </template>
                <template #empty> No payment methods found. </template>
                <Column
                    :sortable="true"
                    field="name"
                    header="Payment Method Name"
                >
                    <template #body="{ data }">
                        <div class="flex items-center gap-4 flex-wrap">
                            <span
                                v-tooltip.top="
                                    data.name?.length > 30
                                        ? data.name
                                        : undefined
                                "
                            >
                                {{ truncate(data.name, { length: 30 }) }}
                            </span>
                            <Tag
                                severity="info"
                                v-if="data.is_default"
                                value="Default"
                            />
                        </div>
                    </template>
                </Column>

                <Column
                    field="system_link"
                    header="System Link"
                    v-if="quicbooksConnected"
                >
                    <template #body="{ data }">
                        <span
                            v-if="
                                quicbooksConnected &&
                                data.system_link &&
                                data.system_link !== 'NC'
                            "
                        >
                            {{ getQboAccountName(data.system_link) }}
                        </span>
                    </template>
                </Column>

                <Column
                    header="Is Card"
                    :sortable="true"
                    field="is_card_payment"
                >
                    <template #body="{ data }">
                        <Tag
                            class="!text-xs"
                            v-if="data.is_card_payment"
                            :severity="data.is_card_payment ? 'info' : 'danger'"
                            :value="data.is_card_payment ? 'Yes' : 'No'"
                        />
                    </template>
                </Column>

                <Column header="Status" :sortable="true" field="status">
                    <template #body="{ data }">
                        <StatusTag
                            :status="data.status ? 'active' : 'inactive'"
                        />
                    </template>
                </Column>

                <Column
                    v-if="
                        $ability.can('administration.edit') ||
                        $ability.can('administration.delete')
                    "
                    header="Actions"
                    class="flex justify-end"
                >
                    <template #body="{ data }">
                        <Button
                            class="!px-3 !py-2"
                            label="Actions"
                            variant="outlined"
                            iconPos="right"
                            icon="pi pi-chevron-down"
                            size="small"
                            @click="showActions($event, data)"
                        />

                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                        />
                    </template>
                </Column>
            </BaseTable>
        </template>
    </Card>

    <BaseDialog
        v-if="
            $ability.can('administration.edit') ||
            $ability.can('administration.create')
        "
        v-model:visible="showDialog"
        @update:visible="onShow"
        :busy="busy"
        :isEditMode="isEditMode"
        :header="isEditMode ? 'Edit Payment Method' : 'New Payment Method'"
        :confirmLabel="isEditMode ? 'Update' : 'Save'"
        :formData="formData"
        :initialData="isEditMode ? selectedItem : null"
        :enableDirtyCheck="true"
        :confirmBeforeSave="isEditMode ? true : false"
        @cancel="closeDialog"
        @confirm="save"
    >
        <div class="mb-3 col-span-12">
            <label class="block required mb-3" for="name">Name</label>
            <InputField
                variant="text"
                id="name"
                v-model="formData.name"
                class="w-full"
                @keyup.enter="save"
                :disabled="busy"
            />
        </div>

        <div class="mb-3 col-span-12">
            <label class="block mb-3" for="system_link">System Link</label>
            <InputField
                v-if="quicbooksConnected"
                filter
                id="system_link"
                v-model="formData.system_link"
                :loading="loading"
                variant="dropdown"
                :options="quickBooksList"
                optionLabel="Name"
                optionValue="Id"
                placeholder="Select"
                class="w-full"
                :disabled="busy || loading"
            />
            <InputField
                v-else
                variant="text"
                id="system_link"
                value="NC"
                class="w-full"
                @keyup.enter="save"
                :disabled="true"
            />
            <Message
                v-if="quicbooksConnected"
                severity="warn"
                icon="pi pi-info-circle"
                class="block !mt-4"
            >
                Linking account will result in automatic updates in QuickBooks
                using ServiCore definitions.</Message
            >
        </div>

        <div class="mb-3 col-span-12 flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <InputField
                    binary
                    inputId="is_card_payment"
                    variant="checkbox"
                    v-model="formData.is_card_payment"
                    :disabled="busy"
                />
                <label class="cursor-pointer" for="is_card_payment">
                    Is a card Payment
                </label>
            </div>
        </div>

        <div class="mb-3 col-span-12">
            <label class="block mb-3">Status</label>
            <div class="flex items-center gap-3">
                <InputField
                    inputId="status"
                    variant="switch"
                    v-model="formData.status"
                    :disabled="busy"
                />
                <label class="cursor-pointer mt-1" for="status">{{
                    formData.status ? 'Active' : 'Inactive'
                }}</label>
            </div>
        </div>
    </BaseDialog>

    <Confirmation
        v-if="$ability.can('administration.delete')"
        v-model="deleteDialog"
        variant="danger"
        header="Delete Payment Method"
        content="Are you sure you want to delete this payment method?"
        @confirm="deleteItem"
    />

    <Confirmation
        v-if="$ability.can('administration.edit')"
        v-model="changeStatusDialog"
        variant="danger"
        :header="isItemActive ? 'Make Inactive' : 'Make Active'"
        :content="`Are you sure you want to make this payment method ${isItemActive ? 'inactive' : 'active'}?`"
        :confirmButtonText="isItemActive ? 'Make Inactive' : 'Make Active'"
        @confirm="changeStatus"
    />

    <Confirmation
        v-if="$ability.can('administration.edit')"
        v-model="defaultDialog"
        variant="success"
        :header="`Set ${selectedItem?.name} as Default`"
        :content="`Are you sure you want to make this payment method default?`"
        @confirm="makeDefault"
    />
</template>

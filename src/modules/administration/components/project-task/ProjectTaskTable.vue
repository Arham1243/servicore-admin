<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useProjectTemplateTaskStore } from '@/modules/administration/stores';
import { useRevenueCategoryStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { truncate } from 'lodash-es';
import { useHelpers } from '@/composables';

const { filterByPermission, filterActiveWithSelected } = useHelpers();

const projectTemplateTaskStore = useProjectTemplateTaskStore();
const revenueCategoryStore = useRevenueCategoryStore();
const globalStore = useGlobalStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const searchText = ref('');
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const isEditMode = ref(false);
const busy = ref(false);
const totalRecords = ref();
const showDialog = ref(false);
const deleteDialog = ref(false);
const changeStatusDialog = ref(false);
const revenueCategories = ref([]);
const loadingRevenueCategories = ref(false);
const maxOrderLoading = ref(false);
const formData = ref({
    name: '',
    order: null,
    revenue_category_id: null,
    update_tasks_revenue_category: false,
    add_to_all_projects: false,
    status: true,
    is_default: false
});

onBeforeMount(async () => {
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
            permission: 'administration.edit'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'administration.delete'
        }
    ];

    return filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status;
});

const checkboxError = ref('');

// Watch revenue category changes
watch(
    () => formData.value.revenue_category_id,
    (newVal) => {
        if (isEditMode && newVal !== originalRevenueCategory.value) {
            // Only show error if checkbox is unchecked
            if (!formData.value.update_tasks_revenue_category) {
                checkboxError.value =
                    'You must check this to apply the new revenue category to all related project tasks.';
            } else {
                checkboxError.value = '';
            }
        } else {
            checkboxError.value = '';
        }
    }
);

// Watch checkbox changes
watch(
    () => formData.value.update_tasks_revenue_category,
    (val) => {
        if (val) {
            // Checkbox checked → remove error
            checkboxError.value = '';
        } else if (
            formData.value.revenue_category_id !== originalRevenueCategory.value
        ) {
            // Checkbox unchecked + revenue changed → show error
            checkboxError.value =
                'You must check this to apply the new revenue category to all related project tasks.';
        }
    }
);

const isConfirmDisabled = computed(() => {
    // Only disable in edit mode when revenue category changed but checkbox not checked
    return isEditMode.value && checkboxError.value !== '';
});

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    showDialog.value = true;
    getRevenueCategories();
    if (!isEditMode.value) {
        getMaxOrder();
    }
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
    formData.value.revenue_category_id = null;
    formData.value.order = null;
    formData.value.update_tasks_revenue_category = false;
    formData.value.add_to_all_projects = false;
    formData.value.status = true;
    formData.value.is_default = false;
    globalStore.clearErrors();
};
const originalRevenueCategory = ref(null);
const editItem = () => {
    resetForm();
    formData.value.name = selectedItem.value.name;
    formData.value.is_default = selectedItem.value.is_default;
    formData.value.revenue_category_id = selectedItem.value.revenue_category_id;
    formData.value.order = selectedItem.value.order;
    formData.value.status = selectedItem.value.status;
    originalRevenueCategory.value = selectedItem.value.revenue_category_id;
    checkboxError.value = '';

    openDialog('edit');
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showChangeStatusDialog = () => {
    changeStatusDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const onRowReorder = async (event) => {
    const { dragIndex, dropIndex } = event;
    const pageOffset = pagination.limit * (pagination.page - 1);
    const movedItem = items.value[dragIndex - pageOffset];
    const movedItemId = movedItem.id;

    try {
        loading.value = true;
        const payload = {
            order: dropIndex + 1
        };
        await projectTemplateTaskStore.changeOrder(movedItemId, payload);
        await getItems();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
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
            includes: [{ relation: 'revenueCategory' }]
        };
        if (!payload.sort || payload.sort.length === 0) {
            payload.sort = [{ field: 'status', direction: 'desc' }];
        }
        const res = await projectTemplateTaskStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const getRevenueCategories = async (searchText = '') => {
    try {
        loadingRevenueCategories.value = true;
        const params = { limit: 300 };
        const payload = {
            search: {
                value: searchText
            }
        };
        const res = await revenueCategoryStore.search(payload, params);
        revenueCategories.value = filterActiveWithSelected(
            res.data,
            formData.value.revenue_category_id
        );
    } finally {
        loadingRevenueCategories.value = false;
    }
};

const getMaxOrder = async () => {
    try {
        maxOrderLoading.value = true;
        const res = await projectTemplateTaskStore.getMaxOrder();
        formData.value.order = res + 1;
    } finally {
        maxOrderLoading.value = false;
    }
};

const save = async () => {
    try {
        busy.value = true;
        if (isEditMode.value) {
            await projectTemplateTaskStore.update(
                selectedItem.value.id,
                formData.value
            );
        } else {
            await projectTemplateTaskStore.create(formData.value);
        }
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
            await projectTemplateTaskStore.deleteItem(selectedItem.value.id);
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
            await projectTemplateTaskStore.changeStatus(selectedItem.value.id);
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
                <h1 class="text-2xl sm:text-3xl font-bold">Project Tasks</h1>
                <p class="mt-2 text-sm sm:text-base mx-auto sm:mx-0 mb-0">
                    These tasks will be used in defining projects.
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
                @rowReorder="onRowReorder"
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
                <template #empty> No project tasks found. </template>
                <Column
                    class="w-[3rem]"
                    :sortable="true"
                    field="order"
                    header="Order"
                />
                <Column
                    class="w-[20rem]"
                    :sortable="true"
                    field="name"
                    header="Project Task Name"
                >
                    <template #body="{ data }">
                        <span
                            v-tooltip.top="
                                data.name?.length > 30 ? data.name : undefined
                            "
                        >
                            {{ truncate(data.name, { length: 30 }) }}
                        </span>
                    </template>
                </Column>

                <Column
                    :sortable="true"
                    field="revenueCategory.name"
                    header="Revenue Category"
                />

                <Column
                    header="Default for Projects"
                    :sortable="true"
                    field="is_default"
                >
                    <template #body="{ data }">
                        <Tag
                            v-if="data.is_default"
                            class="!text-xs"
                            :severity="data.is_default ? 'info' : 'warn'"
                            :value="data.is_default ? 'Yes' : 'No'"
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
        :header="isEditMode ? 'Edit Project Task' : 'New Project Task'"
        :confirmLabel="isEditMode ? 'Update' : 'Save'"
        :formData="formData"
        :initialData="isEditMode ? selectedItem : null"
        :enableDirtyCheck="true"
        :confirmBeforeSave="isEditMode ? true : false"
        :disableConfirm="isConfirmDisabled"
        @cancel="closeDialog"
        @confirm="save"
    >
        <div class="mb-3 col-span-12">
            <label class="block required mb-3" for="name">Order</label>
            <InputField
                variant="text"
                id="order"
                v-model="formData.order"
                class="w-full"
                @keyup.enter="save"
                :disabled="busy || maxOrderLoading"
            />
        </div>

        <div class="mb-3 col-span-12">
            <label class="block required mb-3" for="name"
                >Project Task Name</label
            >
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
            <label class="block required mb-2" for="revenue_category_id"
                >Revenue Category</label
            >
            <ApiDropdown
                showClear
                filter
                placeholder="Select"
                :loading="loadingRevenueCategories"
                @search="getRevenueCategories"
                :options="revenueCategories"
                optionLabel="name"
                optionValue="id"
                id="revenue_category_id"
                v-model="formData.revenue_category_id"
                class="w-full"
                :disabled="busy || loadingRevenueCategories"
            />

            <div
                class="!mt-3 col-span-12 flex flex-col gap-2"
                v-if="isEditMode"
            >
                <div class="flex items-center gap-2">
                    <InputField
                        id="update_tasks_revenue_category"
                        binary
                        inputId="update_tasks_revenue_category"
                        variant="checkbox"
                        v-model="formData.update_tasks_revenue_category"
                        :disabled="busy"
                    />
                    <label
                        class="cursor-pointer"
                        for="update_tasks_revenue_category"
                    >
                        Update revenue category for all project tasks
                    </label>
                </div>

                <small
                    v-if="checkboxError"
                    class="mt-[0.35rem] text-[84%] block text-[#e24c4c]"
                    id="text-error"
                    data-testid="validation-error"
                >
                    {{ checkboxError }}
                </small>
            </div>
        </div>

        <div class="col-span-12 flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <InputField
                    id="is_default"
                    binary
                    inputId="is_default"
                    variant="checkbox"
                    v-model="formData.is_default"
                    :disabled="busy"
                />
                <label class="cursor-pointer" for="is_default">
                    Default task for projects
                </label>
            </div>
        </div>

        <div
            class="!mb-3 col-span-12 flex flex-col gap-2"
            v-if="!isEditMode && formData.is_default"
        >
            <div class="flex items-center gap-2">
                <InputField
                    id="add_to_all_projects"
                    binary
                    inputId="add_to_all_projects"
                    variant="checkbox"
                    v-model="formData.add_to_all_projects"
                    :disabled="busy"
                />
                <label class="cursor-pointer" for="add_to_all_projects">
                    Add this task to all existing projects
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
        header="Delete Project Task"
        content="Are you sure you want to delete this project task?"
        @confirm="deleteItem"
    />

    <Confirmation
        v-if="$ability.can('administration.edit')"
        v-model="changeStatusDialog"
        variant="danger"
        :header="isItemActive ? 'Make Inactive' : 'Make Active'"
        :content="`Are you sure you want to make this project task ${isItemActive ? 'inactive' : 'active'}?`"
        :confirmButtonText="isItemActive ? 'Make Inactive' : 'Make Active'"
        @confirm="changeStatus"
    />
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { usePlanStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRouter } from 'vue-router';

const planStore = usePlanStore();
const router = useRouter();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const searchText = ref('');
const menu = ref();
const deleteDialog = ref(false);
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();
const changeStatusDialog = ref(false);

onBeforeMount(async () => {
    await getItems();
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => goToEdit()
        },
        {
            label: isItemActive.value ? 'Make Inactive' : 'Make Active',
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showChangeStatusDialog()
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ].filter(Boolean);

    return allMenuItems;
});

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status;
});

const goToAdd = () => {
    router.push({ name: 'AddPlan' });
};

const goToEdit = () => {
    if (!selectedItem.value?.id) return;
    router.push({ name: 'EditPlan', params: { id: selectedItem.value.id } });
};

const showChangeStatusDialog = () => {
    changeStatusDialog.value = true;
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
        const payload = { ...sortFilters.getSortFilters(searchText.value) };
        if (!payload.sort || payload.sort.length === 0) {
            payload.sort = [{ field: 'name', direction: 'asc' }];
        }
        const res = await planStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await planStore.deleteItem(selectedItem.value.id);
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
            await planStore.changeStatus(selectedItem.value.id);
        }
        await getItems();
        selectedItem.value = {};
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '--';
    return `$${Number(value).toFixed(2)}`;
};
</script>

<template>
    <TitleHeader>
        <template #title>
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold">Plans</h1>
            </div>
        </template>
        <template #actions>
            <Button label="Add Plan" icon="pi pi-plus" @click="goToAdd" />
        </template>
    </TitleHeader>

    <Card class="py-3 px-2">
        <template #content>
            <BaseTable
                :reorderableColumns="true"
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
                <template #empty> No plans found. </template>
                <Column
                    columnKey="name"
                    :sortable="true"
                    field="name"
                    header="Name"
                >
                    <template #body="{ data }">
                        <router-link
                            :to="{
                                name: 'EditPlan',
                                params: { id: data.id }
                            }"
                            class="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                            <div class="flex items-center gap-4 flex-wrap">
                                {{ data.name }}
                                <Tag
                                    severity="info"
                                    class="whitespace-nowrap"
                                    v-if="data.trial_days > 0"
                                    value="Free Trial"
                                />
                            </div>
                        </router-link>
                    </template>
                </Column>

                <Column
                    columnKey="description"
                    field="description"
                    header="Description"
                >
                    <template #body="{ data }">
                        {{ data.description || '-' }}
                    </template>
                </Column>

                <Column
                    columnKey="monthly_sale_price"
                    :sortable="true"
                    field="monthly_sale_price"
                    header="Monthly Sale Price"
                >
                    <template #body="{ data }">
                        {{ formatCurrency(data.monthly_sale_price) }}
                    </template>
                </Column>

                <Column
                    columnKey="monthly_cost_price"
                    :sortable="true"
                    field="monthly_cost_price"
                    header="Monthly Cost Price"
                >
                    <template #body="{ data }">
                        {{ formatCurrency(data.monthly_cost_price) }}
                    </template>
                </Column>

                <Column
                    columnKey="yearly_sale_price"
                    :sortable="true"
                    field="yearly_sale_price"
                    header="Yearly Sale Price"
                >
                    <template #body="{ data }">
                        {{ formatCurrency(data.yearly_sale_price) }}
                    </template>
                </Column>

                <Column
                    columnKey="yearly_cost_price"
                    :sortable="true"
                    field="yearly_cost_price"
                    header="Yearly Cost Price"
                >
                    <template #body="{ data }">
                        {{ formatCurrency(data.yearly_cost_price) }}
                    </template>
                </Column>

                <Column
                    columnKey="trial_days"
                    :sortable="true"
                    field="trial_days"
                    header="Trial Days"
                >
                    <template #body="{ data }">
                        {{ data.trial_days ?? '--' }}
                    </template>
                </Column>

                <Column
                    columnKey="status"
                    header="Status"
                    :sortable="true"
                    field="status"
                >
                    <template #body="{ data }">
                        <StatusTag
                            :status="data.status ? 'active' : 'inactive'"
                        />
                    </template>
                </Column>

                <Column
                    columnKey="actions"
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

    <Confirmation
        v-model="changeStatusDialog"
        variant="danger"
        :header="isItemActive ? 'Make Inactive' : 'Make Active'"
        :content="`Are you sure you want to make this plan ${isItemActive ? 'inactive' : 'active'}?`"
        :confirmButtonText="isItemActive ? 'Make Inactive' : 'Make Active'"
        @confirm="changeStatus"
    />

    <Confirmation
        v-model="deleteDialog"
        variant="danger"
        header="Delete Plan"
        content="Are you sure you want to delete this plan?"
        @confirm="deleteItem"
    />
</template>

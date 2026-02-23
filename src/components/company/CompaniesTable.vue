<script setup>
import { onBeforeMount, ref } from 'vue';
import { useCompanyStore } from '@/stores/Company';
import { PaginationOptions, SortFilterOptions } from '@/config';

const companyStore = useCompanyStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const searchText = ref('');
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();

onBeforeMount(async () => {
    await getItems();
});

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
        const res = await companyStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const loginToPortal = (company) => {
    //    TODO: Call impersonation endpoint
};
</script>

<template>
    <TitleHeader>
        <template #title>
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold">Companies</h1>
            </div>
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
                <template #empty> No companies found. </template>
                <Column
                    columnKey="name"
                    :sortable="true"
                    field="name"
                    header="Name"
                >
                    <template #body="{ data }">
                        {{ data.name || '-' }}
                    </template>
                </Column>

                <Column columnKey="phone" field="phone" header="Phone">
                    <template #body="{ data }">
                        {{ data.phone || '-' }}
                    </template>
                </Column>

                <Column columnKey="city" field="city" header="City">
                    <template #body="{ data }">
                        {{ data.city || '-' }}
                    </template>
                </Column>

                <Column columnKey="state" field="state" header="State">
                    <template #body="{ data }">
                        {{ data.state || '-' }}
                    </template>
                </Column>

                <Column columnKey="country" field="country" header="Country">
                    <template #body="{ data }">
                        {{ data.country || '-' }}
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
                            label="Login to Portal"
                            icon="pi pi-sign-in"
                            size="small"
                            @click="loginToPortal(data)"
                        />
                    </template>
                </Column>
            </BaseTable>
        </template>
    </Card>
</template>

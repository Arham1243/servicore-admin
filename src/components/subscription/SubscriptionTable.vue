<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useSubscriptionStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useHelpers } from '@/composables/useHelpers';

const helpers = useHelpers();
const subscriptionStore = useSubscriptionStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const searchText = ref('');
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();

// Payment history dialog
const paymentDialog = ref(false);
const paymentLoading = ref(false);
const paymentItems = ref([]);
const paymentTotalRecords = ref(0);
const selectedSubscription = ref(null);
const paymentPagination = new PaginationOptions();
const paymentSortFilters = new SortFilterOptions();

// Action menu
const menu = ref();
const selectedItem = ref(null);

onBeforeMount(async () => {
    await getItems();
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: 'View Payment History',
            icon: 'pi pi-history',
            permission: 'subscription_payments.view',
            command: () => openPaymentHistory(selectedItem.value)
        }
    ].filter(Boolean);

    return helpers.filterByPermission(allMenuItems);
});

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
        sortFilters.updateSearch(searchText.value);
        const payload = { ...sortFilters.getSortFilters() };
        if (!payload.sort || payload.sort.length === 0) {
            payload.sort = [{ field: 'created_at', direction: 'desc' }];
        }
        payload.includes = [{ relation: 'company' }, { relation: 'plan' }];
        const res = await subscriptionStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

// Payment history
const openPaymentHistory = (subscription) => {
    selectedSubscription.value = subscription;
    paymentPagination.resetPageParams();
    paymentSortFilters.resetSortFilters();
    paymentDialog.value = true;
    getPayments();
};

const getPayments = async () => {
    try {
        paymentLoading.value = true;
        const params = { ...paymentPagination.getPageParams() };
        const payload = { ...paymentSortFilters.getSortFilters() };
        if (!payload.sort || payload.sort.length === 0) {
            payload.sort = [{ field: 'created_at', direction: 'desc' }];
        }
        payload.filters = [
            { field: 'subscription_id', operator: '=', value: selectedSubscription.value.id }
        ];
        const res = await subscriptionStore.searchPayments(payload, params);
        paymentItems.value = res.data;
        paymentTotalRecords.value = res.meta.total;
    } finally {
        paymentLoading.value = false;
    }
};

const onPaymentPageChange = (event) => {
    paymentPagination.updatePageParams(event);
    getPayments();
};

const onPaymentSortChange = (event) => {
    paymentPagination.resetPageParams();
    paymentSortFilters.updateSortFilters(event);
    getPayments();
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
                <h1 class="text-2xl sm:text-3xl font-bold">Subscriptions</h1>
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
                <template #empty> No subscriptions found. </template>

                <Column
                    columnKey="company"
                    :sortable="true"
                    field="company.name"
                    header="Company"
                >
                    <template #body="{ data }">
                        {{ data.company?.name || '-' }}
                    </template>
                </Column>

                <Column
                    columnKey="plan"
                    :sortable="true"
                    field="plan.name"
                    header="Plan"
                >
                    <template #body="{ data }">
                        {{ data.plan?.name || '-' }}
                    </template>
                </Column>

                <Column
                    columnKey="billing_cycle"
                    :sortable="true"
                    field="billing_cycle"
                    header="Billing Cycle"
                >
                    <template #body="{ data }">
                        {{ data.billing_cycle || '-' }}
                    </template>
                </Column>

                <Column
                    columnKey="status"
                    :sortable="true"
                    field="status"
                    header="Status"
                >
                    <template #body="{ data }">
                        <StatusTag :status="data.status" />
                    </template>
                </Column>

                <Column
                    columnKey="started_at"
                    :sortable="true"
                    field="started_at"
                    header="Started At"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.started_at) }}
                    </template>
                </Column>

                <Column
                    columnKey="trial_ends_at"
                    field="trial_ends_at"
                    header="Trial Ends At"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.trial_ends_at) }}
                    </template>
                </Column>

                <Column
                    columnKey="current_period_start"
                    :sortable="true"
                    field="current_period_start"
                    header="Period Start"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.current_period_start) }}
                    </template>
                </Column>

                <Column
                    columnKey="current_period_end"
                    :sortable="true"
                    field="current_period_end"
                    header="Period End"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.current_period_end) }}
                    </template>
                </Column>

                <Column
                    columnKey="canceled_at"
                    field="canceled_at"
                    header="Canceled At"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.canceled_at) }}
                    </template>
                </Column>

                <Column
                    columnKey="created_at"
                    :sortable="true"
                    field="created_at"
                    header="Created At"
                >
                    <template #body="{ data }">
                        {{ helpers.formatDate(data.created_at) }}
                    </template>
                </Column>

                <Column
                    v-if="$ability.can('subscription_payments.view')"
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

    <!-- Payment History Dialog -->
    <Dialog
        v-model:visible="paymentDialog"
        header="Payment History"
        :modal="true"
        class="w-full sm:w-11/12 md:w-3/4 lg:w-2/3"
        :closable="true"
    >
        <div v-if="selectedSubscription" class="mb-4 text-sm text-gray-600">
            <span class="font-semibold">Company:</span> {{ selectedSubscription.company?.name || '-' }}
            &nbsp;|&nbsp;
            <span class="font-semibold">Plan:</span> {{ selectedSubscription.plan?.name || '-' }}
            &nbsp;|&nbsp;
            <span class="font-semibold">Status:</span>
            <StatusTag :status="selectedSubscription.status" class="ml-1" />
        </div>

        <BaseTable
            :value="paymentItems"
            :page="paymentPagination.page"
            :rows="paymentPagination.limit"
            :total-records="paymentTotalRecords"
            :loading="paymentLoading"
            @sort="onPaymentSortChange"
            @page="onPaymentPageChange"
        >
            <template #empty> No payments found. </template>

            <Column
                columnKey="amount"
                :sortable="true"
                field="amount"
                header="Amount"
            >
                <template #body="{ data }">
                    {{ formatCurrency(data.amount) }}
                </template>
            </Column>

            <Column
                columnKey="billing_cycle"
                :sortable="true"
                field="billing_cycle"
                header="Billing Cycle"
            >
                <template #body="{ data }">
                    {{ data.billing_cycle || '-' }}
                </template>
            </Column>

            <Column
                columnKey="payment_method"
                :sortable="true"
                field="payment_method"
                header="Payment Method"
            >
                <template #body="{ data }">
                    {{ data.payment_method || '-' }}
                </template>
            </Column>

            <Column
                columnKey="stripe_intent_id"
                field="stripe_intent_id"
                header="Stripe Intent ID"
            >
                <template #body="{ data }">
                    {{ data.stripe_intent_id || '-' }}
                </template>
            </Column>

            <Column
                columnKey="status"
                :sortable="true"
                field="status"
                header="Status"
            >
                <template #body="{ data }">
                    <StatusTag :status="data.status" />
                </template>
            </Column>

            <Column
                columnKey="paid_at"
                :sortable="true"
                field="paid_at"
                header="Paid At"
            >
                <template #body="{ data }">
                    {{ helpers.formatDate(data.paid_at) }}
                </template>
            </Column>

            <Column
                columnKey="period_start"
                :sortable="true"
                field="period_start"
                header="Period Start"
            >
                <template #body="{ data }">
                    {{ helpers.formatDate(data.period_start) }}
                </template>
            </Column>

            <Column
                columnKey="period_end"
                :sortable="true"
                field="period_end"
                header="Period End"
            >
                <template #body="{ data }">
                    {{ helpers.formatDate(data.period_end) }}
                </template>
            </Column>

            <Column
                columnKey="created_at"
                :sortable="true"
                field="created_at"
                header="Created At"
            >
                <template #body="{ data }">
                    {{ helpers.formatDate(data.created_at) }}
                </template>
            </Column>
        </BaseTable>
    </Dialog>
</template>

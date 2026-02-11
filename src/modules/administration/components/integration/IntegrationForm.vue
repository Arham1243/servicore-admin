<script setup>
import { onMounted, ref, computed } from 'vue';
import { ability } from '@/plugins/ability';
import { quickbooksEnvironments } from '@/config/enums';
import { usePaymentMethodStore } from '@/modules/administration/stores';
import { useGlobalStore, useSessionStore } from '@/stores';
import {
    useCompanyStore,
    useIntegrationStore,
    useRevenueCategoryStore
} from '@/modules/administration/stores';
import { useRoute, useRouter } from 'vue-router';
import { useFormDirty } from '@/composables/useFormDirty';

const route = useRoute();
const router = useRouter();
const paymentMethodStore = usePaymentMethodStore();
const globalStore = useGlobalStore();
const integrationStore = useIntegrationStore();
const myCompanyStore = useCompanyStore();
const revenueCategoryStore = useRevenueCategoryStore();
const sessionStore = useSessionStore();
const busy = ref(false);
const loading = ref(false);
const loadingDefaults = ref(false);
const companyId = ref(sessionStore.myCompany?.id);
const defaultsFormData = ref({
    deposit_bank_system_link: null,
    default_expense_bank_system_link: null,
    default_credit_card_system_link: null,
    revenue_categories: [],
    payment_methods: []
});
const quickbooksStatus = ref(false);
const quickbooksEnabled = ref(false);
const quickbooksInfo = ref(null);
const message = ref(null);
const disconnectDialog = ref(false);
const togglingEnabled = ref(false);
const activeTab = ref('0');
const revenueCategoriesQuickBooksList = ref([]);
const paymentMethodsQuickBooksList = ref([]);
const quickBooksDepositBanks = ref([]);
const quickBooksExpenseBankAccounts = ref([]);
const quickBooksCreditCardAccounts = ref([]);

const { isDirty, resetDirty } = useFormDirty(defaultsFormData);

onMounted(async () => {
    const { success, error } = route.query;

    if (success === 'true') {
        message.value = {
            severity: 'success',
            content: 'QuickBooks connected successfully.'
        };
    } else if (success === 'false' && error) {
        message.value = {
            severity: 'error',
            content:
                error === 'session_missing'
                    ? 'Session expired or missing. Please try again.'
                    : 'Something went wrong while connecting QuickBooks.'
        };
    }

    router.replace({ query: {} });
    await getDetails();
    await getQuickBooksinfo();
    await loadDefaultsData();

    setTimeout(() => {
        message.value = null;
    }, 1500);
});

function resetForm() {
    globalStore.clearErrors();
}

const formattedPaymentNames = {
    'Direct Bank Transfer': 'Payment Methods'
};

function getFormattedPaymentMethod(name) {
    return formattedPaymentNames[name] || name;
}

const getQuickBooksinfo = async () => {
    try {
        if (!quickbooksStatus.value) return;
        loading.value = true;
        const res = await integrationStore.getQuickBooksinfo(companyId.value);
        quickbooksInfo.value = res.data;
    } finally {
        loading.value = false;
    }
};

const getDetails = async () => {
    try {
        loading.value = true;
        const res = await myCompanyStore.getQuickBooksDetails(companyId.value);
        quickbooksStatus.value = res.qbo_connected;
        quickbooksEnabled.value = res.qbo_enabled ?? false;
        defaultsFormData.value = {
            deposit_bank_system_link: res?.deposit_bank_system_link || null,
            default_expense_bank_system_link:
                res?.default_expense_bank_system_link || null,
            default_credit_card_system_link:
                res?.default_credit_card_system_link || null,
            revenue_categories: [],
            payment_methods: []
        };
    } finally {
        loading.value = false;
        resetForm();
    }
};
const connect = async () => {
    try {
        busy.value = true;
        const res = await integrationStore.setupQuickBooks();
        window.location.href = res.data?.connect_url;
    } finally {
        busy.value = false;
    }
};

const disconnect = async () => {
    try {
        busy.value = true;
        await integrationStore.disconnectQuickBooks();
        quickbooksStatus.value = false;
        quickbooksInfo.value = null;
        window.location.reload();
    } finally {
        busy.value = false;
    }
};

const toggleEnabled = async () => {
    try {
        await integrationStore.toggleQuickBooks({
            enabled: !quickbooksEnabled.value
        });
        message.value = {
            severity: 'success',
            content: `QuickBooks integration ${quickbooksEnabled.value ? 'enabled' : 'disabled'} successfully.`
        };

        setTimeout(() => {
            message.value = null;
        }, 3000);
    } catch (error) {
        quickbooksEnabled.value = !quickbooksEnabled.value;
        message.value = {
            severity: 'error',
            content: 'Failed to update integration status.'
        };
    }
};

const loadDefaultsData = async () => {
    if (!quickbooksStatus.value) return;

    try {
        loadingDefaults.value = true;

        // Load all defaults data in parallel
        const [
            revenueCategoriesQuickBooksListRes,
            depositBanksRes,
            expenseBankAccountsRes,
            creditCardAccountsRes,
            revenueCategoriesRes,
            paymentMethodsRes,
            paymentMethodsQuickBooksListRes
        ] = await Promise.all([
            revenueCategoryStore
                .getQuickBooksList()
                .catch(() => ({ data: [] })),
            integrationStore
                .getQuickBooksDepositBanks()
                .catch(() => ({ data: [] })),
            integrationStore
                .getQuickBooksExpenseBankAccounts()
                .catch(() => ({ data: [] })),
            integrationStore
                .getQuickBooksCreditCardAccounts()
                .catch(() => ({ data: [] })),
            revenueCategoryStore
                .search(
                    {
                        filters: [
                            {
                                field: 'is_system',
                                operator: '=',
                                value: true
                            }
                        ]
                    },
                    { limit: 300 }
                )
                .catch(() => ({ data: [] })),
            paymentMethodStore
                .search(
                    {
                        filters: [
                            {
                                field: 'is_system',
                                operator: '=',
                                value: true
                            }
                        ]
                    },
                    { limit: 300 }
                )
                .catch(() => ({ data: [] })),
            paymentMethodStore.getQuickBooksList().catch(() => ({ data: [] }))
        ]);

        // Set QuickBooks lists
        revenueCategoriesQuickBooksList.value =
            revenueCategoriesQuickBooksListRes.data || [];
        paymentMethodsQuickBooksList.value =
            paymentMethodsQuickBooksListRes.data || [];
        quickBooksDepositBanks.value = depositBanksRes.data || [];
        quickBooksExpenseBankAccounts.value = expenseBankAccountsRes.data || [];
        quickBooksCreditCardAccounts.value = creditCardAccountsRes.data || [];
        const revenueCategoriesDesiredOrder = [
            'Retainer',
            'Monthly Fee',
            'Additional Item'
        ];

        const mappedCategories = (revenueCategoriesRes.data || [])
            .sort((a, b) => {
                const indexA = revenueCategoriesDesiredOrder.indexOf(a.name);
                const indexB = revenueCategoriesDesiredOrder.indexOf(b.name);

                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                } else if (indexA !== -1) {
                    return -1;
                } else if (indexB !== -1) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .map((cat) => ({
                id: cat.id,
                name: cat.name,
                system_link: cat.system_link
            }));

        const mappedPaymentMethods = (paymentMethodsRes.data || []).map(
            (pm) => ({
                id: pm.id,
                name: pm.name,
                system_link: pm.system_link
            })
        );

        defaultsFormData.value.revenue_categories = mappedCategories;
        defaultsFormData.value.payment_methods = mappedPaymentMethods;

        // Reset dirty state after loading
        resetDirty(defaultsFormData.value);
    } catch (error) {
        console.error('Error loading defaults data:', error);
    } finally {
        loadingDefaults.value = false;
    }
};

const saveDefaults = async () => {
    try {
        busy.value = true;
        const payload = {
            revenue_categories: defaultsFormData.value.revenue_categories,
            deposit_bank_system_link:
                defaultsFormData.value.deposit_bank_system_link,
            default_expense_bank_system_link:
                defaultsFormData.value.default_expense_bank_system_link,
            default_credit_card_system_link:
                defaultsFormData.value.default_credit_card_system_link,
            payment_methods: defaultsFormData.value.payment_methods
        };
        await integrationStore.saveIntegrationDefaults(payload);

        // Reset dirty state after successful save
        resetDirty(defaultsFormData.value);

        message.value = {
            severity: 'success',
            content: 'Defaults saved successfully.'
        };
        setTimeout(() => {
            message.value = null;
        }, 3000);
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <template v-else>
        <TitleHeader>
            <template #title>
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold flex gap-4">
                        QuickBooks Integration
                    </h1>
                    <p class="mt-2 text-sm sm:text-base mx-auto sm:mx-0 mb-0">
                        Enable QuickBooks integration to connect and sync your
                        data.
                    </p>
                </div>
            </template>
            <template
                #actions
                v-if="
                    ability.can('administration.create') ||
                    ability.can('administration.edit')
                "
            >
                <Button
                    v-if="activeTab === '1'"
                    label="Save"
                    icon="pi pi-check"
                    iconPos="left"
                    @click="saveDefaults"
                    :loading="busy"
                    :disabled="!isDirty || busy"
                    class="w-full sm:w-auto"
                />
            </template>
        </TitleHeader>

        <Card class="tabs-card">
            <template #content>
                <Tabs v-model:value="activeTab">
                    <TabList>
                        <Tab value="0">Integration</Tab>
                        <Tab value="1">Defaults</Tab>
                    </TabList>
                    <div class="py-4">
                        <TabPanels>
                            <TabPanel value="0">
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-12 gap-4 gap-y-5"
                                >
                                    <div class="col-span-6">
                                        <div v-if="message">
                                            <Message
                                                :severity="message.severity"
                                                closable
                                                class="mb-5"
                                            >
                                                {{ message.content }}
                                            </Message>
                                        </div>
                                        <div
                                            class="grid grid-cols-12 gap-4 gap-y-5"
                                        >
                                            <div class="col-span-12">
                                                <div
                                                    class="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                                                >
                                                    <div>
                                                        <label
                                                            class="block font-semibold mb-1"
                                                            >Enable QuickBooks
                                                            Integration</label
                                                        >
                                                        <p
                                                            class="text-sm text-gray-600"
                                                        >
                                                            Turn on to configure
                                                            and connect
                                                            QuickBooks
                                                        </p>
                                                    </div>
                                                    <ToggleSwitch
                                                        binary
                                                        v-model="
                                                            quickbooksEnabled
                                                        "
                                                        :disabled="
                                                            togglingEnabled ||
                                                            quickbooksStatus
                                                        "
                                                        @click="toggleEnabled"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-if="quickbooksEnabled"
                                            class="grid grid-cols-12 gap-4 gap-y-5 mt-5"
                                        >
                                            <div class="col-span-12">
                                                <Button
                                                    v-if="!quickbooksStatus"
                                                    :disabled="busy"
                                                    icon="pi pi-external-link"
                                                    iconPos="left"
                                                    severity="success"
                                                    label="Connect to QuickBooks"
                                                    @click="connect"
                                                    :loading="busy"
                                                    class="w-full"
                                                />
                                                <Button
                                                    v-else
                                                    label="Disconnect"
                                                    icon="pi pi-power-off"
                                                    iconPos="left"
                                                    severity="danger"
                                                    :loading="busy"
                                                    class="!w-full"
                                                    @click="
                                                        disconnectDialog = true
                                                    "
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-span-6">
                                        <div class="pl-4">
                                            <h5
                                                class="mb-4 font-semibold text-lg"
                                            >
                                                QuickBooks Details
                                            </h5>
                                            <div class="space-y-2 text-sm">
                                                <div
                                                    class="flex justify-between"
                                                >
                                                    <span class="text-gray-600"
                                                        >Status</span
                                                    >
                                                    <span
                                                        class="font-semibold text-gray-900"
                                                    >
                                                        <StatusTag
                                                            class="self-center"
                                                            :status="
                                                                quickbooksStatus
                                                                    ? 'connected'
                                                                    : 'not_Connected'
                                                            "
                                                        />
                                                    </span>
                                                </div>
                                                <div
                                                    class="flex justify-between"
                                                    v-if="quickbooksInfo"
                                                >
                                                    <span class="text-gray-600"
                                                        >Company Name</span
                                                    >
                                                    <span
                                                        class="font-semibold text-gray-900"
                                                    >
                                                        {{
                                                            quickbooksInfo?.CompanyName
                                                        }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value="1">
                                <Loader v-if="loadingDefaults" />
                                <div
                                    v-else
                                    class="grid grid-cols-1 sm:grid-cols-3 gap-4 gap-y-5"
                                >
                                    <!-- Revenue Categories -->
                                    <template
                                        v-for="category in defaultsFormData.revenue_categories"
                                        :key="category.id"
                                    >
                                        <div
                                            class="py-6 px-5 border rounded-lg shadow-sm bg-white"
                                        >
                                            <h3
                                                class="text-gray-800 font-semibold mb-4"
                                            >
                                                {{ category.name }} (Products &
                                                Services)
                                            </h3>

                                            <label
                                                class="block mb-2 font-medium text-gray-700"
                                                >System Link</label
                                            >
                                            <InputField
                                                v-if="quickbooksStatus"
                                                :id="
                                                    'revenue_category_system_link.' +
                                                    category.id
                                                "
                                                showClear
                                                filter
                                                v-model="category.system_link"
                                                variant="dropdown"
                                                :options="
                                                    revenueCategoriesQuickBooksList
                                                "
                                                optionLabel="Name"
                                                optionValue="Id"
                                                placeholder="Select"
                                                class="w-full"
                                                :disabled="busy"
                                            />
                                            <InputField
                                                v-else
                                                variant="text"
                                                :id="
                                                    'revenue_category_system_link.' +
                                                    category.id
                                                "
                                                :value="'NC'"
                                                class="w-full"
                                                :disabled="true"
                                            />
                                        </div>
                                    </template>

                                    <template
                                        v-for="paymentMethod in defaultsFormData.payment_methods"
                                        :key="paymentMethod.id"
                                    >
                                        <div
                                            class="py-6 px-5 border rounded-lg shadow-sm bg-white"
                                        >
                                            <h3
                                                class="text-gray-800 font-semibold mb-4"
                                            >
                                                {{
                                                    getFormattedPaymentMethod(
                                                        paymentMethod.name
                                                    )
                                                }}
                                            </h3>

                                            <label
                                                class="block mb-2 font-medium text-gray-700"
                                                >System Link</label
                                            >
                                            <InputField
                                                v-if="quickbooksStatus"
                                                :id="
                                                    'payment_method_system_link.' +
                                                    paymentMethod.id
                                                "
                                                showClear
                                                filter
                                                v-model="
                                                    paymentMethod.system_link
                                                "
                                                variant="dropdown"
                                                :options="
                                                    paymentMethodsQuickBooksList
                                                "
                                                optionLabel="Name"
                                                optionValue="Id"
                                                placeholder="Select"
                                                class="w-full"
                                                :disabled="busy"
                                            />
                                            <InputField
                                                v-else
                                                variant="text"
                                                :id="
                                                    'payment_method_system_link.' +
                                                    paymentMethod.id
                                                "
                                                :value="'NC'"
                                                class="w-full"
                                                :disabled="true"
                                            />
                                        </div>
                                    </template>

                                    <!-- Deposit Bank -->
                                    <div
                                        class="py-6 px-5 border rounded-lg shadow-sm bg-white"
                                    >
                                        <h3
                                            class="text-gray-800 font-semibold mb-4"
                                        >
                                            Deposit To
                                        </h3>

                                        <label
                                            class="block mb-2 font-medium text-gray-700"
                                            >System Link</label
                                        >
                                        <InputField
                                            v-if="quickbooksStatus"
                                            id="deposit_bank_system_link"
                                            showClear
                                            filter
                                            v-model="
                                                defaultsFormData.deposit_bank_system_link
                                            "
                                            variant="dropdown"
                                            :options="quickBooksDepositBanks"
                                            optionLabel="Name"
                                            optionValue="Id"
                                            placeholder="Select"
                                            class="w-full"
                                            :disabled="busy"
                                        />
                                        <InputField
                                            v-else
                                            variant="text"
                                            id="deposit_bank_system_link"
                                            :value="'NC'"
                                            class="w-full"
                                            :disabled="true"
                                        />
                                    </div>

                                    <div
                                        class="py-6 px-5 border rounded-lg shadow-sm bg-white"
                                    >
                                        <h3
                                            class="text-gray-800 font-semibold mb-4"
                                        >
                                            Default Expense Bank Account
                                            (Bank/Other Current Assets)
                                        </h3>

                                        <label
                                            class="block mb-2 font-medium text-gray-700"
                                            >System Link</label
                                        >
                                        <InputField
                                            v-if="quickbooksStatus"
                                            id="default_expense_bank_system_link"
                                            showClear
                                            filter
                                            v-model="
                                                defaultsFormData.default_expense_bank_system_link
                                            "
                                            variant="dropdown"
                                            :options="
                                                quickBooksExpenseBankAccounts
                                            "
                                            optionLabel="Name"
                                            optionValue="Id"
                                            placeholder="Select"
                                            class="w-full"
                                            :disabled="busy"
                                        />
                                        <InputField
                                            v-else
                                            variant="text"
                                            id="default_expense_bank_system_link"
                                            :value="'NC'"
                                            class="w-full"
                                            :disabled="true"
                                        />
                                    </div>

                                    <div
                                        class="py-6 px-5 border rounded-lg shadow-sm bg-white"
                                    >
                                        <h3
                                            class="text-gray-800 font-semibold mb-4"
                                        >
                                            Credit Card Liability Account
                                        </h3>

                                        <label
                                            class="block mb-2 font-medium text-gray-700"
                                            >System Link</label
                                        >
                                        <InputField
                                            v-if="quickbooksStatus"
                                            id="default_credit_card_system_link"
                                            showClear
                                            filter
                                            v-model="
                                                defaultsFormData.default_credit_card_system_link
                                            "
                                            variant="dropdown"
                                            :options="
                                                quickBooksCreditCardAccounts
                                            "
                                            optionLabel="Name"
                                            optionValue="Id"
                                            placeholder="Select"
                                            class="w-full"
                                            :disabled="busy"
                                        />
                                        <InputField
                                            v-else
                                            variant="text"
                                            id="default_credit_card_system_link"
                                            :value="'NC'"
                                            class="w-full"
                                            :disabled="true"
                                        />
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </div>
                </Tabs>
            </template>
        </Card>
    </template>

    <Confirmation
        v-if="$ability.can('administration.edit')"
        v-model="disconnectDialog"
        variant="danger"
        header="Disconnect QuickBooks"
        content="Are you sure you want to disconnect QuickBooks?"
        @confirm="disconnect"
    />
</template>

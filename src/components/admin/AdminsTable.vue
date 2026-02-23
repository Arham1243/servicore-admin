<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useAdminStore } from '@/stores/Admin';
import { useAdminRoleStore } from '@/stores/AdminRole';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useHelpers } from '@/composables/useHelpers';

const helpers = useHelpers();
const adminStore = useAdminStore();
const roleStore = useAdminRoleStore();

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
const createDialog = ref(false);
const editDialog = ref(false);
const roles = ref([]);

const form = ref({
    name: '',
    email: '',
    password: '',
    role_id: null,
    status: 'active'
});

const resetForm = () => {
    form.value = {
        name: '',
        email: '',
        password: '',
        role_id: null,
        status: 'active'
    };
};

onBeforeMount(async () => {
    await Promise.all([getItems(), getRoles()]);
});

const getRoles = async () => {
    try {
        const res = await roleStore.search(
            { sort: [{ field: 'name', direction: 'asc' }] },
            { limit: 100 }
        );
        roles.value = res.data;
    } catch {
        roles.value = [];
    }
};

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            permission: 'admins.edit',
            command: () => showEditDialog()
        },
        {
            label: isItemActive.value ? 'Make Inactive' : 'Make Active',
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            permission: 'admins.edit',
            command: () => showChangeStatusDialog()
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            permission: 'admins.delete',
            command: () => showDeleteDialog()
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const showCreateDialog = () => {
    resetForm();
    createDialog.value = true;
};

const showEditDialog = () => {
    form.value = {
        name: selectedItem.value?.name || '',
        email: selectedItem.value?.email || '',
        password: '',
        role_id: selectedItem.value?.role_id || null,
        status: selectedItem.value?.status || 'active'
    };
    editDialog.value = true;
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
        const res = await adminStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const createAdmin = async () => {
    try {
        loading.value = true;
        await adminStore.create(form.value);
        createDialog.value = false;
        resetForm();
        await getItems();
    } finally {
        loading.value = false;
    }
};

const updateAdmin = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            const payload = { ...form.value };
            if (!payload.password) {
                delete payload.password;
            }
            await adminStore.update(selectedItem.value.id, payload);
        }
        editDialog.value = false;
        resetForm();
        await getItems();
        selectedItem.value = {};
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await adminStore.deleteItem(selectedItem.value.id);
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
            await adminStore.changeStatus(selectedItem.value.id);
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
                <h1 class="text-2xl sm:text-3xl font-bold">Admins</h1>
            </div>
        </template>
        <template #actions>
            <Button
                v-if="$ability.can('admins.create')"
                label="Add Admin"
                icon="pi pi-plus"
                @click="showCreateDialog"
            />
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
                <template #empty> No admins found. </template>
                <Column
                    columnKey="name"
                    :sortable="true"
                    field="name"
                    header="Name"
                >
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                </Column>

                <Column
                    columnKey="email"
                    :sortable="true"
                    field="email"
                    header="Email"
                >
                    <template #body="{ data }">
                        {{ data.email }}
                    </template>
                </Column>

                <Column columnKey="role" header="Role">
                    <template #body="{ data }">
                        {{ data.role?.name || '-' }}
                    </template>
                </Column>

                <Column
                    columnKey="status"
                    header="Status"
                    :sortable="true"
                    field="status"
                >
                    <template #body="{ data }">
                        <StatusTag :status="data.status" />
                    </template>
                </Column>

                <Column
                    v-if="
                        $ability.can('admins.edit') ||
                        $ability.can('admins.delete')
                    "
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

    <!-- Create Dialog -->
    <Dialog
        v-model:visible="createDialog"
        header="Create Admin"
        :modal="true"
        class="w-full max-w-lg"
    >
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label for="name">Name</label>
                <InputText
                    id="name"
                    v-model="form.name"
                    placeholder="Enter name"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="email">Email</label>
                <InputText
                    id="email"
                    v-model="form.email"
                    placeholder="Enter email"
                    type="email"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password</label>
                <Password
                    id="password"
                    v-model="form.password"
                    placeholder="Enter password"
                    toggleMask
                    :feedback="false"
                    class="w-full"
                    inputClass="w-full"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="role">Role</label>
                <Select
                    id="role"
                    v-model="form.role_id"
                    :options="roles"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select a role"
                    class="w-full"
                />
            </div>
        </div>
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                @click="createDialog = false"
            />
            <Button
                label="Create"
                :loading="loading"
                :disabled="
                    !form.name || !form.email || !form.password || !form.role_id
                "
                @click="createAdmin"
            />
        </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
        v-model:visible="editDialog"
        header="Edit Admin"
        :modal="true"
        class="w-full max-w-lg"
    >
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label for="editName">Name</label>
                <InputText
                    id="editName"
                    v-model="form.name"
                    placeholder="Enter name"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="editEmail">Email</label>
                <InputText
                    id="editEmail"
                    v-model="form.email"
                    placeholder="Enter email"
                    type="email"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="editPassword"
                    >Password (leave blank to keep current)</label
                >
                <Password
                    id="editPassword"
                    v-model="form.password"
                    placeholder="Enter new password"
                    toggleMask
                    :feedback="false"
                    class="w-full"
                    inputClass="w-full"
                />
            </div>
            <div class="flex flex-col gap-2">
                <label for="editRole">Role</label>
                <Select
                    id="editRole"
                    v-model="form.role_id"
                    :options="roles"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select a role"
                    class="w-full"
                />
            </div>
        </div>
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                @click="editDialog = false"
            />
            <Button
                label="Update"
                :loading="loading"
                :disabled="!form.name || !form.email || !form.role_id"
                @click="updateAdmin"
            />
        </template>
    </Dialog>

    <Confirmation
        v-model="changeStatusDialog"
        variant="danger"
        :header="isItemActive ? 'Make Inactive' : 'Make Active'"
        :content="`Are you sure you want to make this admin ${isItemActive ? 'inactive' : 'active'}?`"
        :confirmButtonText="isItemActive ? 'Make Inactive' : 'Make Active'"
        @confirm="changeStatus"
    />

    <Confirmation
        v-model="deleteDialog"
        variant="danger"
        header="Delete Admin"
        content="Are you sure you want to delete this admin?"
        @confirm="deleteItem"
    />
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useAdminRoleStore } from '@/stores/AdminRole';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables/useHelpers';

const helpers = useHelpers();
const roleStore = useAdminRoleStore();
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
const createDialog = ref(false);
const editDialog = ref(false);
const roleName = ref('');

onBeforeMount(async () => {
    await getItems();
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const isSystem = selectedItem.value?.system;

    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            permission: 'roles.edit',
            command: () => showEditDialog()
        },
        {
            label: 'Permissions',
            icon: 'pi pi-lock',
            permission: 'roles.edit',
            command: () => goToPermissions()
        },
        !isSystem && {
            label: isItemActive.value ? 'Make Inactive' : 'Make Active',
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            permission: 'roles.edit',
            command: () => showChangeStatusDialog()
        },
        !isSystem && {
            label: 'Delete',
            icon: 'pi pi-trash',
            permission: 'roles.delete',
            command: () => showDeleteDialog()
        }
    ].filter(Boolean);

    return helpers.filterByPermission(allMenuItems);
});

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status;
});

const goToPermissions = () => {
    if (!selectedItem.value?.id) return;
    router.push({
        name: 'RolePermissions',
        params: { id: selectedItem.value.id }
    });
};

const showCreateDialog = () => {
    roleName.value = '';
    createDialog.value = true;
};

const showEditDialog = () => {
    roleName.value = selectedItem.value?.name || '';
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
        const res = await roleStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const createRole = async () => {
    try {
        loading.value = true;
        await roleStore.create({ name: roleName.value, status: true });
        createDialog.value = false;
        roleName.value = '';
        await getItems();
    } finally {
        loading.value = false;
    }
};

const updateRole = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await roleStore.update(selectedItem.value.id, {
                name: roleName.value
            });
        }
        editDialog.value = false;
        roleName.value = '';
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
            await roleStore.deleteItem(selectedItem.value.id);
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
            await roleStore.changeStatus(selectedItem.value.id);
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
                <h1 class="text-2xl sm:text-3xl font-bold">Roles</h1>
            </div>
        </template>
        <template #actions>
            <Button
                v-if="$ability.can('roles.create')"
                label="Add Role"
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
                <template #empty> No roles found. </template>
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

                <Column columnKey="system" field="system" class="text-right">
                    <template #body="{ data }">
                        <i
                            v-if="data.system"
                            class="pi pi-lock text-red-500 !text-xl opacity-90"
                        ></i>
                    </template>
                </Column>

                <Column
                    v-if="
                        $ability.can('roles.edit') ||
                        $ability.can('roles.delete')
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
        header="Create Role"
        :modal="true"
        class="w-full max-w-lg"
    >
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label for="roleName">Role Name</label>
                <InputText
                    id="roleName"
                    v-model="roleName"
                    placeholder="Enter role name"
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
                :disabled="!roleName"
                @click="createRole"
            />
        </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
        v-model:visible="editDialog"
        header="Edit Role"
        :modal="true"
        class="w-full max-w-lg"
    >
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label for="editRoleName">Role Name</label>
                <InputText
                    id="editRoleName"
                    v-model="roleName"
                    placeholder="Enter role name"
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
                :disabled="!roleName"
                @click="updateRole"
            />
        </template>
    </Dialog>

    <Confirmation
        v-model="changeStatusDialog"
        variant="danger"
        :header="isItemActive ? 'Make Inactive' : 'Make Active'"
        :content="`Are you sure you want to make this role ${isItemActive ? 'inactive' : 'active'}?`"
        :confirmButtonText="isItemActive ? 'Make Inactive' : 'Make Active'"
        @confirm="changeStatus"
    />

    <Confirmation
        v-model="deleteDialog"
        variant="danger"
        header="Delete Role"
        content="Are you sure you want to delete this role?"
        @confirm="deleteItem"
    />
</template>

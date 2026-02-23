<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminRoleStore } from '@/stores/AdminRole';

const route = useRoute();
const router = useRouter();
const roleStore = useAdminRoleStore();

const roleId = computed(() => route.params.id);
const roleName = ref('');
const loadingPermissions = ref(false);
const busy = ref(false);
const rolePermissions = ref({});
const selectedPermissions = ref({});
const tableData = ref([]);
const actions = ['view', 'create', 'edit', 'delete'];
const hasChanges = ref(false);
const allChecked = ref(false);

onBeforeMount(async () => {
    await getRoleDetails();
    await getRolePermissions();
});

const getRoleDetails = async () => {
    try {
        loadingPermissions.value = true;
        const res = await roleStore.getItem(roleId.value);
        roleName.value = res.data.name;
    } catch {
        router.push({ name: 'Roles' });
    } finally {
        loadingPermissions.value = false;
    }
};

const getRolePermissions = async () => {
    try {
        loadingPermissions.value = true;
        const res = await roleStore.getRolePermissions(roleId.value);
        rolePermissions.value = JSON.parse(JSON.stringify(res));
        selectedPermissions.value = JSON.parse(JSON.stringify(res));
        buildTableData();
        updateAllChecked();
    } finally {
        loadingPermissions.value = false;
    }
};

const buildTableData = () => {
    const data = [];
    for (const [entity, perms] of Object.entries(selectedPermissions.value)) {
        data.push({
            entity,
            label: formatLabel(entity),
            ...perms
        });
    }
    tableData.value = data;
};

const formatLabel = (entity) => {
    return entity
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' > ');
};

const togglePermission = (entity, action) => {
    selectedPermissions.value[entity][action] =
        !selectedPermissions.value[entity][action];
    buildTableData();
    checkChanges();
    updateAllChecked();
};

const toggleAllPermissions = () => {
    const newVal = allChecked.value;
    for (const entity of Object.keys(selectedPermissions.value)) {
        actions.forEach((a) => {
            selectedPermissions.value[entity][a] = newVal;
        });
    }
    buildTableData();
    checkChanges();
};

const updateAllChecked = () => {
    allChecked.value = Object.values(selectedPermissions.value).every((perms) =>
        actions.every((a) => perms[a])
    );
};

const checkChanges = () => {
    hasChanges.value =
        JSON.stringify(rolePermissions.value) !==
        JSON.stringify(selectedPermissions.value);
};

const buildPermissionsForBackend = (perms) => {
    const result = [];
    for (const [entity, actions] of Object.entries(perms)) {
        for (const [action, enabled] of Object.entries(actions)) {
            if (enabled) {
                result.push(`${entity}.${action}`);
            }
        }
    }
    return result;
};

const syncRolePermissions = async () => {
    try {
        busy.value = true;
        await roleStore.syncRolePermissions(roleId.value, {
            permissions: buildPermissionsForBackend(selectedPermissions.value)
        });
        resetMatrix();
        await getRolePermissions();
    } finally {
        busy.value = false;
    }
};

const resetMatrix = () => {
    hasChanges.value = false;
};

const cancelChanges = () => {
    selectedPermissions.value = JSON.parse(
        JSON.stringify(rolePermissions.value)
    );
    buildTableData();
    hasChanges.value = false;
    updateAllChecked();
};
</script>

<template>
    <Loader v-if="loadingPermissions" />
    <template v-else>
        <TitleHeader>
            <template #title>
                <div class="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outlined"
                        icon="pi pi-chevron-left"
                        size="large"
                        @click="router.push({ name: 'Roles' })"
                        iconClass="!text-sm"
                    />
                    <h1 class="text-2xl sm:text-3xl font-bold">
                        {{ roleName }}
                    </h1>
                </div>
            </template>
            <template #actions>
                <Button
                    label="Cancel"
                    variant="outlined"
                    class="w-full sm:w-auto"
                    :disabled="!hasChanges"
                    @click="cancelChanges"
                />
                <Button
                    label="Save"
                    icon="pi pi-check"
                    iconPos="left"
                    class="w-full sm:w-auto"
                    :loading="busy"
                    :disabled="!hasChanges"
                    @click="syncRolePermissions"
                />
            </template>
        </TitleHeader>

        <Card class="py-3 px-2">
            <template #content>
                <div v-if="loadingPermissions" class="flex justify-center py-8">
                    <ProgressSpinner
                        style="width: 50px; height: 50px"
                        strokeWidth="4"
                    />
                </div>
                <div v-else>
                    <div
                        class="pb-5 col-span-12 sm:col-span-6 flex items-center justify-end space-x-2 pr-7 mb-2"
                    >
                        <ToggleSwitch
                            inputId="allChecked"
                            v-model="allChecked"
                            :disabled="busy"
                            @change="toggleAllPermissions"
                        />
                        <label
                            for="allChecked"
                            class="cursor-pointer font-medium mb-0"
                            >Check All</label
                        >
                    </div>
                    <DataTable :value="tableData" stripedRows>
                        <Column header="Module" field="label">
                            <template #body="{ data }">
                                <span class="font-semibold">{{
            data.label
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase())
        }}</span>
                            </template>
                        </Column>
                        <Column
                            v-for="action in actions"
                            :key="action"
                            :header="
                                action.charAt(0).toUpperCase() + action.slice(1)
                            "
                        >
                            <template #body="{ data }">
                                <Checkbox
                                    :modelValue="data[action]"
                                    :binary="true"
                                    @change="
                                        togglePermission(data.entity, action)
                                    "
                                />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </Card>
    </template>
</template>

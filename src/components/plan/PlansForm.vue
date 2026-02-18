<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlanStore, useGlobalStore, useSessionStore } from '@/stores';
import { useMenuStore } from '@/stores';
import { useFormDirty } from '@/composables/useFormDirty';
import { watch } from 'vue';
const props = defineProps({
    mode: { type: String, required: true }
});

const router = useRouter();
const route = useRoute();
const planStore = usePlanStore();
const menuStore = useMenuStore();
const globalStore = useGlobalStore();
const sessionStore = useSessionStore();
const busy = ref(false);
const loading = ref(false);
const planId = ref(route.params.id);
const isEditMode = ref(props.mode === 'edit');
const showUnsavedDialog = ref(false);
let nextRoute = null;

const allMenus = ref([]);
const menuSelections = ref({});
const employeeRanges = [
    { label: '1-5', value: '1-5' },
    { label: '6-10', value: '6-10' },
    { label: '11-15', value: '11-15' },
    { label: '16-20', value: '16-20' }
];

const availableRanges = (currentIndex) => {
  const selectedValues = formData.value.tiers
    .map((tier, i) => i !== currentIndex ? tier.no_of_employees : null)
    .filter(Boolean);
  
  return employeeRanges.filter((range) => !selectedValues.includes(range.value));
};

const formData = ref({
    name: '',
    description: '',
    // no_of_employees: null,
    // price: null,
    // discount: null,
    trial_days: null,
    status: true,
    menu_limits: [],
    apply_to_all: false,
  tiers: [
    { no_of_employees: null, price: null, discount: null }
  ]
});

const addTier = () => {
  formData.value.tiers.push({ no_of_employees: null, price: null, discount: null });
};

const removeTier = (index) => {
  formData.value.tiers.splice(index, 1);
}

watch(() => formData.value.apply_to_all, (val) => {
  if (val) {
    formData.value.tiers.splice(1); // keep only first row
  }
});

const { isDirty, resetDirty } = useFormDirty(formData);

onBeforeMount(async () => {
    loadMenus();
    if (isEditMode.value) {
        await getItem();
    }
});

// onBeforeRouteLeave((to, from, next) => {
//     if (isDirty.value) {
//         showUnsavedDialog.value = true;
//         nextRoute = next;
//     } else {
//         next();
//     }
// });

const loadMenus = async () => {
    try {
        const payload = { sort: [{ field: 'name', direction: 'asc' }] };
        const params = { limit: 200 };
        const res = await menuStore.search(payload, params);
        allMenus.value = res.data || [];
        initMenuSelections();
    } catch (error) {
        console.error('Failed to load menus:', error);
    }
};

const initMenuSelections = () => {
    const selections = {};
    allMenus.value.forEach((menu) => {
        selections[menu.id] = {
            selected: false,
            limit: null,
            unlimited: false
        };
    });
    menuSelections.value = selections;
};

const groupedMenus = computed(() => {
    const menus = allMenus.value;
    if (!menus.length) return [];

    const parentMenus = menus.filter((m) => !m.parent_id);
    const childMenus = menus.filter((m) => m.parent_id);

    const coreParents = parentMenus.filter(
        (m) => !m.is_administration && m.name !== 'Reports'
    );
    const reportsParent = parentMenus.find((m) => m.name === 'Reports');
    const adminParents = parentMenus.filter((m) => m.is_administration);

    const buildSection = (parents) => {
        return parents.map((parent) => ({
            ...parent,
            children: childMenus.filter((c) => c.parent_id === parent.id)
        }));
    };

    const sections = [];

    if (coreParents.length) {
        sections.push({
            label: 'Core Features',
            icon: 'pi pi-th-large',
            menus: buildSection(coreParents)
        });
    }

    if (reportsParent) {
        sections.push({
            label: 'Reports',
            icon: 'pi pi-chart-bar',
            menus: buildSection([reportsParent])
        });
    }

    if (adminParents.length) {
        sections.push({
            label: 'Administration',
            icon: 'pi pi-cog',
            menus: buildSection(adminParents)
        });
    }

    return sections;
});

const isMenuSelected = (menuId) => {
    return menuSelections.value[menuId]?.selected || false;
};

const isMenuUnlimited = (menuId) => {
    return menuSelections.value[menuId]?.unlimited || false;
};

const isParentSelected = (parentId) => {
    return menuSelections.value[parentId]?.selected || false;
};

const toggleMenu = (menu) => {
    const sel = menuSelections.value[menu.id];
    sel.selected = !sel.selected;

    if (!sel.selected) {
        sel.limit = null;
        sel.unlimited = false;
        uncheckChildren(menu.id);
    }

    syncFormMenuLimits();
};

const uncheckChildren = (parentId) => {
    allMenus.value
        .filter((m) => m.parent_id === parentId)
        .forEach((child) => {
            const sel = menuSelections.value[child.id];
            sel.selected = false;
            sel.limit = null;
            sel.unlimited = false;
        });
};

const toggleChild = (child) => {
    const sel = menuSelections.value[child.id];
    sel.selected = !sel.selected;

    if (!sel.selected) {
        sel.limit = null;
        sel.unlimited = false;
    }

    syncFormMenuLimits();
};

const toggleUnlimited = (menuId) => {
    const sel = menuSelections.value[menuId];
    sel.unlimited = !sel.unlimited;

    if (sel.unlimited) {
        sel.limit = null;
    }

    syncFormMenuLimits();
};

const onLimitChange = (menuId, value) => {
    menuSelections.value[menuId].limit = value;
    syncFormMenuLimits();
};

const syncFormMenuLimits = () => {
    const limits = [];
    Object.keys(menuSelections.value).forEach((menuId) => {
        const sel = menuSelections.value[menuId];
        if (sel.selected) {
            const menu = allMenus.value.find((m) => m.id === Number(menuId));
            if (menu) {
                limits.push({
                    menu_id: Number(menuId),
                    limit_count:
                        menu.type === 'limit_count'
                            ? sel.unlimited
                                ? -1
                                : sel.limit
                            : null
                });
            }
        }
    });
    formData.value.menu_limits = limits;
};

const selectedMenuCount = computed(() => {
    return Object.values(menuSelections.value).filter((s) => s.selected).length;
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
        getItem();
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
            // price: null,
            // discount: null,
            // no_of_employees: null,
            trial_days: null,
            status: true,
            menu_limits: [],
            apply_to_all: false,
            tiers: [
                { no_of_employees: null, price: null, discount: null }
            ]
        });
        initMenuSelections();
    }
    globalStore.clearErrors();
}

const save = async () => {
  try {
    busy.value = true;

    const planPayload = {
      name: formData.value.name,
      description: formData.value.description,
      trial_days: formData.value.trial_days,
      status: formData.value.status,
      menu_limits: formData.value.menu_limits,
      apply_to_all: formData.value.apply_to_all,
    };

    let pricings;

    if (formData.value.apply_to_all) {
      // Expand the single tier to all employee ranges with same price/discount
      const { price, discount } = formData.value.tiers[0];
      pricings = employeeRanges.map((range) => ({
        no_of_employees: range.value,
        price,
        discount
      }));
    } else {
      // Send tiers as-is
      pricings = formData.value.tiers.map((tier) => ({
        no_of_employees: tier.no_of_employees,
        price: tier.price,
        discount: tier.discount
      }));
    }

    if (isEditMode.value) {
      await planStore.update(planId.value, { ...planPayload, pricings });
      await getItem();
    } else {
      const res = await planStore.create({ ...planPayload, pricings });
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
        const plan = res.data;

        // Map API tiers (if backend returns array) or fall back to single flat fields
        const tiers = plan.planPricings?.length
        ? plan.planPricings.map((p) => ({
            no_of_employees: p.no_of_employees ?? null,
            price: p.price ?? null,
            discount: p.discount ?? null
            }))
        : [{ no_of_employees: null, price: null, discount: null }];

        formData.value = {
            name: plan.name || '',
            description: plan.description || '',
            // no_of_employees: plan.no_of_employees,
            // price: plan.price,
            // discount: plan.discount,
            trial_days: plan.trial_days,
            status: plan.status,
            menu_limits: [],
            apply_to_all: plan.apply_to_all || false,
            tiers
        };

        initMenuSelections();

        if (plan.planMenuLimits && plan.planMenuLimits.length) {
            plan.planMenuLimits.forEach((pml) => {
                const sel = menuSelections.value[pml.menu_id];
                if (sel) {
                    sel.selected = true;
                    if (pml.limit_count === -1 || pml.limit_count === null) {
                        sel.unlimited = true;
                        sel.limit = null;
                    } else {
                        sel.unlimited = false;
                        sel.limit = pml.limit_count;
                    }
                }
            });
        }

        syncFormMenuLimits();
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

        <!-- Plan Details Card -->
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

                    <!-- Pricing Tiers -->
                    <div class="col-span-12">
                    <!-- Plus button top-right -->
                    <div class="flex justify-end mb-3">
                        <Button
                        icon="pi pi-plus-circle"
                        rounded
                        :disabled="busy || formData.apply_to_all || formData.tiers.length >= employeeRanges.length"
                        @click="addTier"
                        v-tooltip.top="'Add tier'"
                        />
                    </div>

                    <!-- Tier rows -->
                    <div
                        v-for="(tier, index) in formData.tiers"
                        :key="index"
                        class="grid grid-cols-12 gap-4 mb-4 items-end"
                    >
                        <div class="col-span-12 sm:col-span-4">
                        <label class="block mb-3 required">No Of Employees</label>
                        <InputField
                        :id="`no_of_employees_${index}`"
                        v-model="tier.no_of_employees"
                        variant="dropdown"
                        :options="availableRanges(index)"   
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select"
                        class="w-full"
                        :disabled="busy"
                        />
                        </div>

                        <div class="col-span-12 sm:col-span-4">
                        <label class="block mb-2 required">Price</label>
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            :id="`price_${index}`"
                            v-model="tier.price"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="2"
                            @keyup.enter="save"
                            prefix="$"
                            :min="0.01"
                        />
                        </div>

                        <div class="col-span-12 sm:col-span-3">
                        <label class="block mb-2">Discount (%)</label>
                        <InputField
                            :disabled="busy"
                            class="w-full"
                            :id="`discount_${index}`"
                            v-model="tier.discount"
                            variant="number"
                            :maxFractionDigits="2"
                            :minFractionDigits="0"
                            @keyup.enter="save"
                            suffix="%"
                            :step="0.5"
                            :min="0"
                            :max="100"
                        />
                        </div>

                        <!-- Delete button — only show for rows beyond the first -->
                        <div class="col-span-12 sm:col-span-1 flex items-end pb-1">
                        <Button
                            v-if="index > 0"
                            icon="pi pi-times"
                            severity="danger"
                            rounded
                            :disabled="busy"
                            @click="removeTier(index)"
                            v-tooltip.top="'Remove tier'"
                        />
                        </div>
                    </div>

                    <!-- Apply to all checkbox -->
                    <div class="flex items-center gap-3 mt-2">
                        <InputField
                        id="apply_to_all"
                        binary
                        inputId="apply_to_all"
                        variant="checkbox"
                        v-model="formData.apply_to_all"
                        :disabled="busy"
                        />
                        <label class="cursor-pointer" for="apply_to_all">
                        Apply To All Tiers
                        </label>
                    </div>
                    </div>

                    <div
                        class="col-span-12 sm:col-span-6"
                        v-if="
                            formData.trial_days > 0 ||
                            !sessionStore.freeTrialPlanAvailable
                        "
                    >
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

        <!-- Menu Selection Card -->
        <Card class="py-3 px-2 mt-4">
            <template #content>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800">
                            Menu Access & Limits
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">
                            Select which features are included in this plan and
                            define usage limits.
                        </p>
                    </div>
                    <Tag
                        :value="`${selectedMenuCount} selected`"
                        severity="info"
                    />
                </div>

                <div
                    v-for="section in groupedMenus"
                    :key="section.label"
                    class="mb-8 last:mb-0"
                >
                    <div
                        class="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200"
                    >
                        <i
                            :class="section.icon"
                            class="text-lg text-primary"
                        ></i>
                        <h3 class="text-lg font-semibold text-gray-700">
                            {{ section.label }}
                        </h3>
                    </div>

                    <div class="space-y-2">
                        <template
                            v-for="parentMenu in section.menus"
                            :key="parentMenu.id"
                        >
                            <!-- Parent Menu Row -->
                            <div
                                class="rounded-lg border transition-all duration-200"
                                :class="
                                    isMenuSelected(parentMenu.id)
                                        ? 'border-primary/30 bg-primary/5'
                                        : 'border-gray-200 bg-white'
                                "
                            >
                                <div
                                    class="flex items-center gap-4 p-4"
                                    :class="{
                                        'opacity-50 pointer-events-none': busy
                                    }"
                                >
                                    <Checkbox
                                        :modelValue="
                                            isMenuSelected(parentMenu.id)
                                        "
                                        :binary="true"
                                        @update:modelValue="
                                            toggleMenu(parentMenu)
                                        "
                                        :inputId="`menu_${parentMenu.id}`"
                                    />
                                    <label
                                        :for="`menu_${parentMenu.id}`"
                                        class="font-medium text-gray-800 cursor-pointer flex-1"
                                    >
                                        {{ parentMenu.name }}
                                    </label>

                                    <div
                                        v-if="
                                            parentMenu.type === 'limit_count' &&
                                            isMenuSelected(parentMenu.id)
                                        "
                                        class="flex items-center gap-3"
                                    >
                                        <div
                                            class="flex items-center gap-2"
                                            v-tooltip.top="
                                                'Enable for no usage cap on this feature'
                                            "
                                        >
                                            <Checkbox
                                                :modelValue="
                                                    isMenuUnlimited(
                                                        parentMenu.id
                                                    )
                                                "
                                                :binary="true"
                                                @update:modelValue="
                                                    toggleUnlimited(
                                                        parentMenu.id
                                                    )
                                                "
                                                :inputId="`unlimited_${parentMenu.id}`"
                                            />
                                            <label
                                                :for="`unlimited_${parentMenu.id}`"
                                                class="text-sm text-gray-600 cursor-pointer whitespace-nowrap"
                                            >
                                                Unlimited
                                            </label>
                                        </div>
                                        <InputNumber
                                            v-if="
                                                !isMenuUnlimited(parentMenu.id)
                                            "
                                            :modelValue="
                                                menuSelections[parentMenu.id]
                                                    ?.limit
                                            "
                                            @update:modelValue="
                                                onLimitChange(
                                                    parentMenu.id,
                                                    $event
                                                )
                                            "
                                            :min="1"
                                            placeholder="Limit"
                                            inputClass="w-full"
                                            v-tooltip.top="
                                                'Maximum number of items allowed'
                                            "
                                        />
                                        <Tag
                                            v-else
                                            value="∞ Unlimited"
                                            severity="success"
                                            class="whitespace-nowrap"
                                        />
                                    </div>

                                    <Tag
                                        v-if="
                                            parentMenu.type ===
                                                'enable_disable' &&
                                            isMenuSelected(parentMenu.id)
                                        "
                                        value="Enabled"
                                        severity="success"
                                    />
                                </div>

                                <!-- Child Menus -->
                                <div
                                    v-if="
                                        parentMenu.children &&
                                        parentMenu.children.length
                                    "
                                    class="border-t border-gray-100"
                                >
                                    <div
                                        v-for="child in parentMenu.children"
                                        :key="child.id"
                                        class="flex items-center gap-4 py-3 px-4 pl-12 transition-all duration-200"
                                        :class="{
                                            'opacity-40 pointer-events-none':
                                                !isParentSelected(
                                                    parentMenu.id
                                                ) || busy,
                                            'bg-primary/3':
                                                isMenuSelected(child.id) &&
                                                isParentSelected(parentMenu.id)
                                        }"
                                    >
                                        <Checkbox
                                            :modelValue="
                                                isMenuSelected(child.id)
                                            "
                                            :binary="true"
                                            @update:modelValue="
                                                toggleChild(child)
                                            "
                                            :disabled="
                                                !isParentSelected(parentMenu.id)
                                            "
                                            :inputId="`menu_${child.id}`"
                                        />
                                        <label
                                            :for="`menu_${child.id}`"
                                            class="text-gray-700 cursor-pointer flex-1"
                                        >
                                            {{ child.name }}
                                        </label>

                                        <div
                                            v-if="
                                                child.type === 'limit_count' &&
                                                isMenuSelected(child.id) &&
                                                isParentSelected(parentMenu.id)
                                            "
                                            class="flex items-center gap-3"
                                        >
                                            <div
                                                class="flex items-center gap-2"
                                                v-tooltip.top="
                                                    'Enable for no usage cap on this feature'
                                                "
                                            >
                                                <Checkbox
                                                    :modelValue="
                                                        isMenuUnlimited(
                                                            child.id
                                                        )
                                                    "
                                                    :binary="true"
                                                    @update:modelValue="
                                                        toggleUnlimited(
                                                            child.id
                                                        )
                                                    "
                                                    :inputId="`unlimited_${child.id}`"
                                                />
                                                <label
                                                    :for="`unlimited_${child.id}`"
                                                    class="text-sm text-gray-600 cursor-pointer whitespace-nowrap"
                                                >
                                                    Unlimited
                                                </label>
                                            </div>
                                            <InputNumber
                                                v-if="
                                                    !isMenuUnlimited(child.id)
                                                "
                                                :modelValue="
                                                    menuSelections[child.id]
                                                        ?.limit
                                                "
                                                @update:modelValue="
                                                    onLimitChange(
                                                        child.id,
                                                        $event
                                                    )
                                                "
                                                :min="1"
                                                placeholder="Limit"
                                                inputClass="w-full"
                                                v-tooltip.top="
                                                    'Maximum number of items allowed'
                                                "
                                            />
                                            <Tag
                                                v-else
                                                value="∞ Unlimited"
                                                severity="success"
                                                class="whitespace-nowrap"
                                            />
                                        </div>

                                        <Tag
                                            v-if="
                                                child.type ===
                                                    'enable_disable' &&
                                                isMenuSelected(child.id) &&
                                                isParentSelected(parentMenu.id)
                                            "
                                            value="Enabled"
                                            severity="success"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div
                    v-if="!groupedMenus.length"
                    class="text-center py-10 text-gray-400"
                >
                    <i class="pi pi-spin pi-spinner text-2xl mb-3"></i>
                    <p>Loading menus...</p>
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

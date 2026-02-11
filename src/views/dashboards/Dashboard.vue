<script setup>
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <!-- Quick Actions -->
        <div class="col-span-12">
            <div class="card">
                <h3
                    class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4"
                >
                    Quick Actions
                </h3>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <!-- Add Timesheet -->
                    <div class="no-underline">
                        <div
                            class="p-6 border-2 border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-800 transition-all cursor-pointer text-center"
                        >
                            <i
                                class="pi pi-plus-circle !text-4xl text-primary mb-3 block"
                            ></i>
                            <div
                                class="font-semibold text-surface-900 dark:text-surface-0 mb-1"
                            >
                                Manage Plans
                            </div>
                            <div
                                class="text-sm text-surface-600 dark:text-surface-400"
                            >
                                Manage your plans
                            </div>
                        </div>
                    </div>

                    <div class="no-underline">
                        <div
                            class="p-6 border-2 border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-800 transition-all cursor-pointer text-center"
                        >
                            <i
                                class="pi pi-plus-circle !text-4xl text-primary mb-3 block"
                            ></i>
                            <div
                                class="font-semibold text-surface-900 dark:text-surface-0 mb-1"
                            >
                                Manage Users
                            </div>
                            <div
                                class="text-sm text-surface-600 dark:text-surface-400"
                            >
                                Manage all users
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-underline {
    text-decoration: none;
}
</style>

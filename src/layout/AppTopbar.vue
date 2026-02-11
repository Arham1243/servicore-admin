<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppBreadcrumb from './AppBreadcrumb.vue';
import { ref } from 'vue';
import { useSessionStore, useGlobalStore } from '@/stores';
const globalStore = useGlobalStore();
const sessionStore = useSessionStore();
const currentUser = sessionStore.user;

const { toggleMenu, layoutConfig, layoutState } = useLayout();
const attachmentFilename = ref('');
const formData = ref({
    subject: '',
    message: '',
    attachment: null
});

function showProfileSidebar() {
    layoutState.profileSidebarVisible = !layoutState.profileSidebarVisible;
}

const resetForm = () => {
    formData.value.subject = '';
    formData.value.message = '';
    formData.value.attachment = null;
    attachmentFilename.value = '';
    globalStore.clearErrors();
};

function toggleDarkMode(event) {
    if (!document.startViewTransition) {
        executeDarkModeToggle();
        return;
    }

    document.startViewTransition(() => executeDarkModeToggle());
}

function executeDarkModeToggle() {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    document.documentElement.classList.toggle('app-dark');
}
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button
                type="button"
                class="topbar-menubutton p-trigger"
                @click="toggleMenu"
            >
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li>
                    <Button
                        :icon="
                            layoutConfig.darkTheme ? 'pi pi-sun' : 'pi pi-moon'
                        "
                        rounded
                        @click="toggleDarkMode"
                        :class="
                            layoutConfig.darkTheme
                                ? 'bg-gray-700 text-white'
                                : ''
                        "
                    />
                </li>
                <li class="topbar-profile">
                    <Button
                        type="button"
                        class="topbar-sidebarbutton"
                        @click="showProfileSidebar"
                    >
                        <template v-if="currentUser.profile_image">
                            <img
                                :src="
                                    currentUser.profile_image ||
                                    '/demo/images/avatar/avatar.png'
                                "
                                alt="Profile"
                            />
                        </template>
                        <template v-else>
                            <span class="topbar-avatar-text">{{
                                currentUser.name[0]
                            }}</span>
                        </template>
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
span.topbar-avatar-text {
    font-size: 1.35rem;
    color: #000;
}
</style>

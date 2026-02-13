import AppLayout from '@/layout/AppLayout.vue';
import AuthLayout from '@/layout/AuthLayout.vue';

const modules = import.meta.glob('@/modules/*/index.js', { eager: true });
const items = [];
Object.keys(modules).forEach((path) => {
    let module = modules[path];
    module = module.default;
    module.routes.map((routes) => {
        items.push(routes);
    });
});

export default [
    {
        path: '/',
        name: 'Home',
        component: AppLayout,
        redirect: '/dashboard',
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                meta: { breadcrumb: [{ label: 'Dashboard' }] },
                component: () => import('@/views/dashboards/Dashboard.vue')
            },
            {
                path: 'menu',
                name: 'Menu',
                component: () => import('@/views/menu/index.vue'),
                meta: {
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Menu' }]
                }
            },
            {
                path: 'plans',
                name: 'Plans',
                component: () => import('@/views/plan/index.vue'),
                meta: {
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Plans' }]
                }
            },
            {
                path: 'plans/add',
                name: 'AddPlan',
                component: () => import('@/views/plan/add.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Plans', to: '/plans' },
                        { label: 'Add Plan' }
                    ]
                }
            },
            {
                path: 'plans/:id/edit',
                name: 'EditPlan',
                component: () => import('@/views/plan/edit.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Plans', to: '/plans' },
                        { label: 'Edit Plan' }
                    ]
                }
            }
        ]
    },
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/views/auth/Login.vue')
            },
            {
                path: 'verify/email',
                name: 'CodeVerification',
                component: () => import('@/views/auth/VerifyEmailCode.vue')
            },
            {
                path: 'password/forget',
                name: 'Password Reset Request',
                component: () => import('@/views/auth/PasswordResetRequest.vue')
            },
            {
                path: 'password/reset',
                name: 'New Password Setup',
                component: () => import('@/views/auth/PasswordResetForm.vue')
            },
            {
                path: 'password/set',
                name: 'Password Setup',
                component: () => import('@/views/auth/PasswordSetup.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/errors/NotFound.vue')
    },
    ...items
];

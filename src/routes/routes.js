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
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Menu' }],
                    permission: 'menu.view'
                }
            },
            {
                path: 'plans',
                name: 'Plans',
                component: () => import('@/views/plan/index.vue'),
                meta: {
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Plans' }],
                    permission: 'plans.view'
                }
            },
            {
                path: 'plans/add',
                name: 'AddPlan',
                component: () => import('@/views/plan/add.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Plans', route: '/plans' },
                        { label: 'Add Plan' }
                    ],
                    permission: 'plans.create'
                }
            },
            {
                path: 'plans/:id/edit',
                name: 'EditPlan',
                component: () => import('@/views/plan/edit.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Plans', route: '/plans' },
                        { label: 'Edit Plan' }
                    ],
                    permission: 'plans.edit'
                }
            },
            {
                path: 'roles',
                name: 'Roles',
                component: () => import('@/views/role/index.vue'),
                meta: {
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Roles' }],
                    permission: 'roles.view'
                }
            },
            {
                path: 'roles/:id/permissions',
                name: 'RolePermissions',
                component: () => import('@/views/role/permissions.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Roles', route: '/roles' },
                        { label: 'Permissions' }
                    ],
                    permission: 'roles.edit'
                }
            },
            {
                path: 'admins',
                name: 'Admins',
                component: () => import('@/views/admin/index.vue'),
                meta: {
                    breadcrumb: [{ label: 'Dashboard' }, { label: 'Admins' }],
                    permission: 'admins.view'
                }
            },
            {
                path: 'companies',
                name: 'Companies',
                component: () => import('@/views/company/index.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Companies' }
                    ],
                    permission: 'companies.view'
                }
            },
            {
                path: 'subscriptions',
                name: 'Subscriptions',
                component: () => import('@/views/subscription/index.vue'),
                meta: {
                    breadcrumb: [
                        { label: 'Dashboard' },
                        { label: 'Subscriptions' }
                    ],
                    permission: 'subscriptions.view'
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

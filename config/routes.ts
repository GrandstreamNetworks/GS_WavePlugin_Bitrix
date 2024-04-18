export default [
    {
        path: '/login',
        name: 'login',
        component: './Login',
    },
    {
        path: '/',
        component: '@/layouts',
        routes: [
            {
                path: '/home',
                name: 'home',
                component: './Home',
            },
            {
                name: 'syncConfig',
                path: '/syncConfig',
                component: '@/components/SyncConfig',
            },
            {
                name: 'notificationConfig',
                path: '/notificationConfig',
                component: '@/components/NotificationConfig'
            },
            {
                name: 'creationConfig',
                path: '/creationConfig',
                component: '@/components/CreationConfig'
            }
        ]
    },
];

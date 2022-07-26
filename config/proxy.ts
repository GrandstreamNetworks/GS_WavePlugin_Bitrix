export default {
    dev: {
        '/api': {
            target: 'https://b24-yhsi3e.bitrix24.com',
            changeOrigin: true,
            pathRewrite: {
                '^/api': '',
            },
        },
    },
};

module.exports = {
    apps: [
        {
            name: 'claw-addict-server',
            cwd: './server',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
        {
            name: 'claw-addict-client',
            cwd: './client',
            script: 'npm',
            args: 'start -- -p 3001',
            env: {
                NODE_ENV: 'production',
                NEXT_PUBLIC_API_URL: 'http://localhost:3000',
                NEXTAUTH_URL: 'http://localhost:3001',
            },
        },
    ],
};

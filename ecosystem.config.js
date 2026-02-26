module.exports = {
    apps: [
        {
            name: "nextjs",
            script: "node_modules/.bin/next",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production",
            },
        },
        {
            name: "worker",
            script: "dist/workers/openAIWorker.js", // path to your BullMQ worker entry point
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
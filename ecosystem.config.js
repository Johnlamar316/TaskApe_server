module.exports = {
  apps: [
    {
      name: "TaskApe",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};

const express = require('express');
const expressApp = require('./express-app');
const { PORT , TUNNEL_DOMAIN } = require('./config');
const { startTunnel } = require('./utils/runTunnel'); // Import your tunnel script

const StartServer = async () => {
    const app = express();

    await expressApp(app);

    const server = app.listen(PORT, () => {
        console.log(`Course Service is running on port ${PORT}`);

        // Start the tunnel after the server is running
        startTunnel(PORT, TUNNEL_DOMAIN);
    });

    server.on('error', (err) => {
        console.log(err);
        process.exit();
    });
};

StartServer();

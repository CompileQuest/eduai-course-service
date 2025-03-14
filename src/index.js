import express from 'express';
import expressApp from './express-app.js';
import { PORT, TUNNEL_DOMAIN } from './config/index.js';
import { killPort, startTunnel } from './utils/systemUtils.js';

const StartServer = async () => {
    //await killPort(PORT); 
    const app = express();

    await expressApp(app);



    const server = app.listen(PORT, () => {
        console.log(`Course Service is running on port ${PORT}`);

        // Start the tunnel after the server is running
        // startTunnel(PORT, TUNNEL_DOMAIN);
    });

    server.on('error', (err) => {
        console.log(err);
        process.exit();
    });
};

StartServer();

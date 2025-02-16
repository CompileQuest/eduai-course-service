const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes
const colors = {
    green: '\x1b[32m',
    reset: '\x1b[0m'
};

function startTunnel(port, subdomain) {
    const tunnelScriptPath = path.join(__dirname, '..', '..', 'scripts', 'exposeLocalhost.sh');

    console.log(`Starting LocalTunnel...`);
    console.log(`Running: bash ${tunnelScriptPath} ${port} ${subdomain}`);

    const process = spawn('bash', [tunnelScriptPath, port, subdomain]);

    process.stdout.on('data', (data) => {
        const output = data.toString().trim();

        // If the output contains a URL, highlight it in green
        if (output.includes('https://')) {
            console.log(`${colors.green}Tunnel Link: ${output}${colors.reset}`);
        } else {
            console.log(`Tunnel Output: ${output}`);
        }
    });

    process.stderr.on('data', (data) => {
        console.error(`Tunnel Error: ${data}`);
    });

    process.on('exit', (code) => {
        console.log(`Tunnel process exited with code: ${code}`);
    });
}

module.exports = { startTunnel };

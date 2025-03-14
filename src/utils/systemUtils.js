import path from 'path';
import { spawn, execSync } from 'child_process';
import fs from 'fs';

// ANSI color codes for terminal output
const colors = {
    green: '\x1b[32m',
    reset: '\x1b[0m'
};

/**
 * Ensure a shell script has execution permission
 * @param {string} scriptPath - Path to the shell script
 */
function ensureScriptExecutable(scriptPath) {
    try {
        fs.accessSync(scriptPath, fs.constants.X_OK);
        console.log(`${colors.green}✔ Script already has execute permissions: ${scriptPath}${colors.reset}`);
    } catch (err) {
        console.log(`Granting execute permissions to: ${scriptPath}`);
        execSync(`chmod +x "${scriptPath}"`);
    }
}

/**
 * Kill a process running on a specific port
 * @param {number} port - The port number to kill
 */
/**
 * Kill a process running on a specific port (Async version)
 * @param {number} port - The port number to kill
 * @returns {Promise<void>} - Resolves when the process is fully terminated
 */
function killPort(port) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'kill-port.sh');

        ensureScriptExecutable(scriptPath);

        console.log(`🔴 Killing process on port ${port}...`);
        const process = spawn('bash', [scriptPath, port]);

        process.stdout.on('data', (data) => {
            console.log(`${colors.green}${data.toString().trim()}${colors.reset}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`❌ Killing Port Error: ${data}`);
        });

        process.on('exit', (code) => {
            console.log(`✅ Killing port process exited with code: ${code}`);
            if (code === 0) {
                resolve(); // Successfully killed the port
            } else {
                reject(new Error(`Failed to kill port ${port}, exit code: ${code}`));
            }
        });
    });
}


/**
 * Start a LocalTunnel process to expose localhost
 * @param {number} port - The port to expose
 * @param {string} subdomain - Desired subdomain for the tunnel
 */
function startTunnel(port, subdomain) {
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'exposeLocalhost.sh');

    ensureScriptExecutable(scriptPath);

    console.log(`🌐 Starting LocalTunnel on port ${port} with subdomain ${subdomain}...`);
    const process = spawn('bash', [scriptPath, port, subdomain]);

    process.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('https://')) {
            console.log(`${colors.green}🔗 Tunnel Link: ${output}${colors.reset}`);
        } else {
            console.log(`🔧 Tunnel Output: ${output}`);
        }
    });

    process.stderr.on('data', (data) => {
        console.error(`❌ Tunnel Error: ${data}`);
    });

    process.on('exit', (code) => {
        console.log(`✅ Tunnel process exited with code: ${code}`);
    });
}

/**
 * Run a shell command and return its output
 * @param {string} command - Shell command to execute
 * @returns {string|null} - Command output or null on failure
 */
function runShellCommand(command) {
    try {
        const output = execSync(command, { encoding: 'utf-8' });
        console.log(`✔ Command executed successfully: ${command}`);
        return output;
    } catch (error) {
        console.error(`❌ Error executing command: ${command}`);
        return null;
    }
}

// Export all utility functions
export { ensureScriptExecutable, killPort, startTunnel, runShellCommand };

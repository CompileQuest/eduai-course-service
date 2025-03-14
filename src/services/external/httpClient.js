// src/utils/httpClient.js
import axios from 'axios';
import { NotFoundError } from '../../utils/app-errors.js';
import services from './services.js'; // Import the services configuration


class HttpClient {
    /**
     * Resolve the URL for a given service and event.
     * @param {string} serviceName - The name of the service to call.
     * @param {string} eventName - The event or endpoint to call.
     * @returns {string} - The full URL for the request.
     */
    resolveUrl(serviceName, eventName) {
        const baseUrl = services[serviceName];
        if (!baseUrl) {
            throw new Error(`Service ${serviceName} not found in configuration.`);
        }
        return `${baseUrl}/${eventName}`;
    }

    /**
     * Call a service via HTTP.
     * @param {string} serviceName - The name of the service to call.
     * @param {string} eventName - The event or endpoint to call.
     * @param {object} payload - The payload to send in the request.
     * @returns {Promise<object>} - The response from the service.
     */
    async callService(serviceName, eventName, payload) {
        const url = this.resolveUrl(serviceName, eventName);

        try {
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                // The request was made, but the server responded with a non-2xx status
                throw new ServiceUnavailableError(
                    `Service ${serviceName} returned ${error.response.status}: ${error.response.data}`
                );
            } else if (error.request) {
                // The request was made but no response was received
                throw new ServiceUnavailableError(
                    `Service ${serviceName} is unreachable: ${error.message}`
                );
            } else {
                // Something happened in setting up the request
                throw new Error(`Error calling service ${serviceName}: ${error.message}`);
            }
        }
    }
}

export default new HttpClient();
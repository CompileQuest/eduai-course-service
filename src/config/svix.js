const axios = require('axios');
const { SVIX_API_URL, SVIX_AUTH_TOKEN } = require('./index');

console.log(SVIX_API_URL, SVIX_AUTH_TOKEN, ' this is the svix api url and auth token');
const createApplication = async (appName) => {
    try {
        const response = await axios.post(
            SVIX_API_URL,
            { name: appName },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SVIX_AUTH_TOKEN}`,
                },
            }
        );

        console.log('Application created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating application:', error.response?.data || error.message);
        throw error;
    }
};

// Create an application named "eduai"
//createApplication('eduai');

const createEndpoint = async (appId, endpointUrl, description) => {
    try {
        const response = await axios.post(
            `${SVIX_API_URL}${appId}/endpoint/`,
            {
                url: endpointUrl,
                description: description,
                https_only: false, // Disable HTTPS requirement
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SVIX_AUTH_TOKEN}`,
                },
            }
        );

        console.log('Endpoint created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating endpoint:', error.response?.data || error.message);
        throw error;
    }
};
// Replace with your application ID and backend URL
const appId = 'app_2sximsMrV5r8MoMJNsSc3FHriAC'; // Get this from the createApplication response
const endpointUrl = 'http://localhost:8000/webhook'; // Your backend URLconst description = 'Backend API for eduai'; // Description of the endpoint
const description = 'Backend API for eduai'; // Description of the endpoint
// Create an endpoint
createEndpoint(appId, endpointUrl, description)
    .then(() => console.log('Endpoint creation completed'))
    .catch((err) => console.error('Endpoint creation failed:', err));
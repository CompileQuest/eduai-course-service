const http = require('http');
const server = http.createServer((req, res) => {
    res.end('Hello, world!');
});
server.listen(8008, () => {
    console.log('Server is running on')
});
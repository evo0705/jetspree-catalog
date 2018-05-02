// config used by dashboard client side only
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const API_WEB_SOCKET_URL = process.env.API_WEB_SOCKET_URL || 'ws://localhost:3001';

module.exports = {
  // dashboard UI language
  language: 'en',
  apiBaseUrl: API_BASE_URL,
  apiWebSocketUrl: API_WEB_SOCKET_URL,
  developerMode: true
}

import ApiClient from 'ApiClient'
import clientSettings from './settings'

const api = new ApiClient({
  ajaxBaseUrl: clientSettings.ajaxBaseUrl || '/ajax'
});

export default api;

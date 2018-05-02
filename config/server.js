// config used by server side only

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || 'shop'
const dbUser = process.env.DB_USER || '';
const dbPass = process.env.DB_PASS || '';
const dbCred = dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : '';
const dbUrl = `mongodb://${dbCred}${dbHost}:${dbPort}/${dbName}`;

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const AJAX_BASE_URL = process.env.AJAX_BASE_URL || 'http://localhost:3001/ajax';
const STORE_BASE_URL = process.env.STORE_BASE_URL || 'http://localhost:3000';
const API_LISTEN_PORT = process.env.PORT || 3001;
const STORE_LISTEN_PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let isDeveloperMode = false;
if(NODE_ENV === 'development') {
  isDeveloperMode = true;
}

module.exports = {
  // used by Store (server side)
  apiBaseUrl: API_BASE_URL,

  // used by Store (server and client side)
  ajaxBaseUrl: AJAX_BASE_URL,

  // Access-Control-Allow-Origin
  storeBaseUrl: STORE_BASE_URL,

  // used by API
  adminLoginUrl: '/admin/login',

  apiListenPort: API_LISTEN_PORT,
  storeListenPort: STORE_LISTEN_PORT,

  // used by API
  mongodbServerUrl: dbUrl,

  smtpServer: {
    host: '',
    port: 0,
    secure: true,
    user: '',
    pass: '',
    fromName: '',
    fromAddress: ''
  },

  // key to sign tokens
  jwtSecretKey: '-',

  // key to sign store cookies
  cookieSecretKey: '-',

  // path to uploads
  categoriesUploadPath: 'public/content/images/categories',
  productsUploadPath: 'public/content/images/products',
  filesUploadPath: 'public/content',
  themeAssetsUploadPath: 'theme/assets/images',

  // url to uploads
  categoriesUploadUrl: '/images/categories',
  productsUploadUrl: '/images/products',
  filesUploadUrl: '',
  themeAssetsUploadUrl: '/assets/images',

  // store UI language
  language: 'en',

  // used by API
  orderStartNumber: 1000,

  developerMode: isDeveloperMode
}

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
const CORS_HOST = process.env.CORS_HOST || 'http://localhost:3000';
const API_LISTEN_PORT = process.env.PORT || 3001;
const STORE_LISTEN_PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_CLOUDINARY = process.env.ENABLE_CLOUDINARY || 'true';

const DEFAULT_BUCKETEER_AWS_ACCESS_KEY_ID = 'default_bucketeer_aws_access_key_id';
const DEFAULT_BUCKETEER_AWS_SECRET_ACCESS_KEY = 'default_bucketeer_aws_secret_access_key';
const DEFAULT_BUCKETEER_BUCKET_NAME = 'default_bucketeer_bucket_name';
const BUCKETEER_AWS_ACCESS_KEY_ID = process.env.BUCKETEER_AWS_ACCESS_KEY_ID || DEFAULT_BUCKETEER_AWS_ACCESS_KEY_ID;
const BUCKETEER_AWS_SECRET_ACCESS_KEY = process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY || DEFAULT_BUCKETEER_AWS_SECRET_ACCESS_KEY;
const BUCKETEER_BUCKET_NAME = process.env.BUCKETEER_BUCKET_NAME || DEFAULT_BUCKETEER_BUCKET_NAME;
const BUCKETEER_AWS_REGION = process.env.BUCKETEER_AWS_REGION || 'us-east-1';

let isDeveloperMode = false;
let isCloudinaryEnabled = false;

if(NODE_ENV === 'development') {
  isDeveloperMode = true;
}

if(ENABLE_CLOUDINARY === 'true') {
  isCloudinaryEnabled = true;
}

if(BUCKETEER_AWS_ACCESS_KEY_ID === DEFAULT_BUCKETEER_AWS_ACCESS_KEY_ID) {
  console.error("BUCKETEER_AWS_ACCESS_KEY_ID must be set");
  process.exit();
}

if(BUCKETEER_AWS_SECRET_ACCESS_KEY === DEFAULT_BUCKETEER_AWS_SECRET_ACCESS_KEY) {
  console.error("BUCKETEER_AWS_SECRET_ACCESS_KEY must be set");
  process.exit();
}

if(BUCKETEER_BUCKET_NAME === DEFAULT_BUCKETEER_BUCKET_NAME) {
  console.error("BUCKETEER_BUCKET_NAME must be set");
  process.exit();
}

module.exports = {
  // used by Store (server side)
  apiBaseUrl: API_BASE_URL,

  // used by Store (server and client side)
  ajaxBaseUrl: AJAX_BASE_URL,

  // Access-Control-Allow-Origin
  storeBaseUrl: CORS_HOST,

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

  developerMode: isDeveloperMode,

  // whether to use cloudinary for images
  enableCloudinary: isCloudinaryEnabled,

  // bucketeer credintials for batchupload product
  bucketeerAWSAccessKeyId: BUCKETEER_AWS_ACCESS_KEY_ID,
  bucketeerAWSSecretAccessKey: BUCKETEER_AWS_SECRET_ACCESS_KEY,
  bucketeerAWSRegion: BUCKETEER_AWS_REGION,
  bucketeerBucketName: BUCKETEER_BUCKET_NAME,
}

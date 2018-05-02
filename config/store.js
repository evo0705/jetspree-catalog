// config used by store client side only
const AJAX_BASE_URL = process.env.AJAX_BASE_URL || 'http://localhost:3001/ajax';

module.exports = {
  // store UI language
  language: 'en',
  ajaxBaseUrl: AJAX_BASE_URL
}

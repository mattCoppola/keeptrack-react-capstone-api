
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://demo:demo123@ds017258.mlab.com:17258/keeptrack';

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://demo:demo123@ds017258.mlab.com:17258/keeptrack-test'

exports.PORT = process.env.PORT || 8080;

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

exports.JWT_SECRET = process.env.JWT_SECRET || 'TEST_SECRET_KEY';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://lms-user:lms-dev@lms.nrevnud.mongodb.net/lms?retryWrites=true&w=majority',
  jwt: {
    secret: process.env.JWT_SECRET || 'local_dev_secret',
    expiration: process.env.JWT_EXPIRATION || '3600s',
  },
});

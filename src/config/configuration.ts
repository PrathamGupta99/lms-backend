export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  mongodbUri: process.env.MONGODB_URI || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiration: process.env.JWT_EXPIRATION || '3600s',
  },
});

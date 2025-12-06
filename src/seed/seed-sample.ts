/* eslint-disable no-console */
import mongoose, { Connection } from 'mongoose';
import { User, UserSchema, UserRole } from '../users/schemas/user.schema';
import { Test, TestSchema } from '../tests/schemas/test.schema';
import { hashPassword } from '../auth/utils/password.util';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function run() {
  let connection: Connection | null = null;
  try {
    await mongoose.connect(MONGODB_URI);
    connection = mongoose.connection;

    const UserModel = connection.model<User>('User', UserSchema);
    const TestModel = connection.model<Test>('Test', TestSchema);

    let admin = await UserModel.findOne({ email: 'admin@example.com' }).exec();
    if (!admin) {
      const passwordHash = await hashPassword('AdminPass123!');
      admin = await UserModel.create({
        email: 'admin@example.com',
        name: 'Default Admin',
        role: UserRole.Admin,
        passwordHash,
      });
      console.log('Created default admin: admin@example.com / AdminPass123!');
    } else {
      console.log('Default admin already exists');
    }

    const existingTest = await TestModel.findOne({ uniqueURL: 'sample-test' }).exec();
    if (!existingTest) {
      await TestModel.create({
        name: 'Sample Adaptive Test',
        description: 'Demo test seeded for preview',
        uniqueURL: 'sample-test',
        createdBy: admin._id,
      });
      console.log('Created sample test with uniqueURL "sample-test"');
    } else {
      console.log('Sample test already exists');
    }
  } catch (err) {
    console.error('Sample seed failed', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

void run();

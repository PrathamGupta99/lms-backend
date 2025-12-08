/* eslint-disable no-console */
import mongoose, { Connection } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lms-user:lms-dev@lms.nrevnud.mongodb.net/lms?retryWrites=true&w=majority';

async function run() {
  let connection: Connection | null = null;
  try {
    await mongoose.connect(MONGODB_URI);
    connection = mongoose.connection;
    const QuestionModel = connection.model<Question>('Question', QuestionSchema);

    const docs = Array.from({ length: 500 }).map(() => {
      const difficulty = faker.number.int({ min: 1, max: 10 });
      // const weight = faker.number.int({ min: 1, max: 5 });
      const weight = difficulty;
      const options = Array.from({ length: 4 }).map(() => faker.lorem.words({ min: 2, max: 5 }));
      const correctAnswerIndex = faker.number.int({ min: 0, max: 0 });
      return {
        questionText: faker.lorem.sentence(),
        options,
        correctAnswerIndex,
        difficulty,
        weight,
      };
    });

    await QuestionModel.deleteMany({});
    await QuestionModel.insertMany(docs);
    console.log('Seeded 500 questions successfully');
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

void run();

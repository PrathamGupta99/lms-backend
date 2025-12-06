import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
        serverSelectionTimeoutMS: 5000,
        appName: 'lms-backend',
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => Logger.log('MongoDB connected', 'Mongoose'));
          connection.on('error', (err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            Logger.error(`MongoDB connection error: ${message}`, 'Mongoose');
          });
          return connection;
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

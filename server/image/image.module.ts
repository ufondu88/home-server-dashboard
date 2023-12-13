import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ICONS_DIR } from 'server/constants';

@Module({
  imports: [
    MulterModule.register({
      dest: ICONS_DIR,
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}

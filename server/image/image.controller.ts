import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { ICONS_DIR } from 'server/constants';

@Controller('image')
export class ImageController {

  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: ICONS_DIR,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtName = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtName}`);
      },
    }),
  }))
  create(@UploadedFile() file: Express.Multer.File) {
    return { filename: file.filename };
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':filename')
  findOne(@Param('filename') filename: string, @Res() res: Response) {
    const iconPath = join(ICONS_DIR, filename);
    
    res.sendFile(iconPath);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imageService.update(+id, updateImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}

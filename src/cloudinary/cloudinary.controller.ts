import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // https://res.cloudinary.com/dir7wnely/image/upload/v1745998484/mlckh5qvjyrczdczvigr.jpg
    const result = await this.cloudinaryService.uploadFile(file);

    return {
      message: 'success',
      data: {
        public_id: result.public_id,
        version: result.version,
        display_name: result.display_name,
        format: result.format,
        resource_type: result.resource_type,
      },
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Express.Multer.File[]) {
    // https://res.cloudinary.com/dir7wnely/image/upload/v1745998484/mlckh5qvjyrczdczvigr.jpg
    const result = await this.cloudinaryService.uploadMultipleFiles(files);

    return {
      message: 'success',
      data: result.map((r) => {
        return {
          public_id: r.public_id,
          version: r.version,
          display_name: r.display_name,
          format: r.format,
          resource_type: r.resource_type,
        };
      }),
    };
  }
}

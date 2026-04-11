import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'auto', // 👈 explicit video type if video
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          resolve(result as CloudinaryResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}

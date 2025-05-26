import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MinioService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.MINIO_ENDPOINT,
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}-${file.originalname}`;

    await this.s3
      .putObject({
        Bucket: process.env.MINIO_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return `${process.env.MINIO_PUBLIC_URL}/${fileName}`;
  }
}

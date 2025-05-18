"use server"
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { requireAuth } from './authorization.action';
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string
  }
})

export async function listS3Urls() {
  try {
    await requireAuth();
    const command = new ListObjectsV2Command({ Bucket: 'unfinished-pages' });
    const response = await s3Client.send(command);

    const urls = response.Contents?.map((item) =>
      `https://unfinished-pages.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${item.Key}`
    ) || [];

    return urls;
  } catch (error) {
    console.error("Error listing S3 objects:", error);
  }
}
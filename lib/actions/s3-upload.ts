"use server"
import { prisma } from '@/db/prisma';
import {
    S3Client, PutObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { requireAuth } from './authorization.action';


const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string
    }
})

function getS3Key(imageUrl: string): string | false {
    if (imageUrl.includes('.amazonaws.com/')) {
        return imageUrl.split('.amazonaws.com/')[1];
    }
    return false;
}

async function deleteFileFromS3(key: string) {
    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    };
    const command = new DeleteObjectCommand(s3Params);
    await s3Client.send(command);
}

function getContentType(fileName: string): string {
    // Strip timestamp suffix (-digits at end) before reading extension
    const baseName = fileName.replace(/-\d+$/, '');
    const extension = baseName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream'; // Fallback for unknown types
    }
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export async function uploadFileToS3(file: Buffer, filename: string, category: string): Promise<string | void> {
    try {
        await requireAuth();
        const safeCategory = slugify(category) || 'general';
        const safeFilename = slugify(filename.split('.')[0]);
        const extension = filename.split('.').pop();

        const contentType = getContentType(filename);
        const timestampedKey = `${safeCategory}/${safeFilename}-${Date.now()}.${extension}`;

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: timestampedKey,
            Body: file,
            ContentType: contentType,
            ContentDisposition: `inline; filename="${timestampedKey}"`,
            CacheControl: 'public, max-age=31536000' // 1 year cache for images
        }

        const command = new PutObjectCommand(s3Params)
        await s3Client.send(command)
        const url = `https://images.jotterblog.com/${timestampedKey}`;
        return url;
    } catch (error) {
        console.error('error uploading photo', error)
    }
}

// Add user image to S3 and database
export async function addPhotoToLibrary(prevData: unknown, formData: FormData) {
    try {
        await requireAuth();
        const imageFile = formData.get('file');
        const tags = formData.get('tags') as string;
        const category = formData.get('category') as string;
        const tagArr = tags.split(' ')

        if (!imageFile) {
            return { success: false, message: 'Not a photo file' }
        }

        if (
            imageFile &&
            typeof imageFile === 'object' &&
            typeof imageFile.arrayBuffer === 'function'
        ) {
            const buffer = Buffer.from(await imageFile.arrayBuffer())

            const pictureURL = await uploadFileToS3(
                buffer,
                imageFile.name.replace(/\s+/g, ''),
                category
            )

            await prisma.image.create({
                data: {
                    url: pictureURL as string,
                    tags: tagArr,
                    category,
                },
            })

            return { success: true, message: 'Photo Uploaded Successfully!' }
        }

        return { success: false, message: 'Invalid file upload' }
    } catch (error) {
        console.error('Error uploading photo 123 ', error);
        return { success: false, message: 'Error uploading photo', error }
    }
}

// Upload a question attachment (image or PDF) to S3 and return its URL
export async function uploadQuestionAttachment(formData: FormData): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
        await requireAuth();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return { success: false, message: 'No file provided' };
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            return { success: false, message: 'Invalid file type. Please upload a JPEG, PNG, WebP image, or PDF.' };
        }

        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSizeBytes) {
            return { success: false, message: 'File size must be less than 10MB.' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const cleanName = file.name.replace(/\s+/g, '-');
        const url = await uploadFileToS3(
            buffer, `question-attachment-${cleanName}`,
            'question-attachments'
        );

        if (!url) {
            return { success: false, message: 'Failed to upload file.' };
        }

        return { success: true, url };
    } catch (error) {
        console.error('Error uploading question attachment:', error);
        return { success: false, message: 'Error uploading file.' };
    }
}

// Delete one or more S3 objects by their full URLs
export async function deleteAttachmentsFromS3(urls: string[]): Promise<void> {
    try {
        await requireAuth();
        await Promise.allSettled(
            urls.map(async (url) => {
                const key = getS3Key(url);
                if (key) {
                    await deleteFileFromS3(key);
                }
            })
        );
    } catch (error) {
        // Log but do not propagate — callers should continue even if S3 cleanup fails
        console.error('Error deleting attachments from S3:', error);
    }
}

// Add user image to S3 and database
export async function addPhotoToLibraryWithAI(formData: FormData) {
    try {
        console.log("Adding photo to library with AI integration...");
        await requireAuth();
        const imageFile = formData.getAll('file');
        const tags = formData.getAll('tags') as string[];
        const category = formData.get('category') as string;

        console.log("Received form data - files:", imageFile, "tags:", tags, "category:", category);

        if (imageFile.length === 0) {
            return { success: false, message: 'Not a photos on file' }
        }

        for (let i = 0; i < imageFile.length; i++) {
            const file = imageFile[i];
            if (
                file &&
                typeof file === 'object' &&
                'arrayBuffer' in file &&
                typeof file.arrayBuffer === 'function'
            ) {
                console.log(`Processing file ${i + 1}/${imageFile.length}:`, file);
                const buffer = Buffer.from(await file.arrayBuffer());
                console.log(`Buffer created for file ${i + 1}/${imageFile.length}, size: ${buffer.length} bytes`);
                const pictureURL = await uploadFileToS3(
                    buffer,
                    file.name.replace(/\s+/g, ''),
                    category
                )

                await prisma.image.create({
                    data: {
                        url: pictureURL as string,
                        tags: tags[i].split(" "),
                        category,
                    },
                })
            }
        }
        return { success: true, message: 'Photo Uploaded Successfully!' }
    } catch (error) {
        console.error('Error uploading photo with AI integration:', error);
        return { success: false, message: 'Error uploading photo', error }
    }
}
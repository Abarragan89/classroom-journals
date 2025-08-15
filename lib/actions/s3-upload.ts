"use server"
import { prisma } from '@/db/prisma';
import {
    S3Client, PutObjectCommand,
    // DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { requireAuth } from './authorization.action';


const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string
    }
})

// function getS3Key(imageUrl: string): string | boolean {
//     // Check if the URL is a full S3 URL
//     if (imageUrl.includes('.amazonaws.com/')) {
//         return imageUrl.split('.amazonaws.com/')[1];
//     }
//     // If it's already a key (without the full URL)
//     return false;
// }

function getContentType(fileName: string): string {
    const extension = fileName.split('.').pop();
    switch (extension) {
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        default:
            return 'application/octet-stream'; // Fallback for unknown types
    }
}

export async function uploadFileToS3(file: Buffer, filename: string) {
    try {
        await requireAuth();
        const contentType = getContentType(filename);
        const timestampedKey = `${filename}-${Date.now()}`;

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
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${timestampedKey}`;
        return url;
    } catch (error) {
        console.log('error uploading photo', error)
    }
}

// // Function to delete a file from S3
// async function deleteFileFromS3(key: string) {
//     const s3Params = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: key
//     };

//     const command = new DeleteObjectCommand(s3Params);
//     await s3Client.send(command);
// }

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

        if (imageFile instanceof File) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            // upload it to S3
            const pictureURL = await uploadFileToS3(buffer, imageFile.name.replace(/\s+/g, ''))

            // Save image to database and attach to User
            await prisma.image.create({
                data: {
                    url: pictureURL as string,
                    tags: tagArr,
                    category,
                }
            })

            // return the HTML string returned from s3 Bucket to assign
            return { success: true, message: 'Photo Uploaded Successfully!' }
            // Proceed with buffer processing
        } else {
            return { success: false, message: 'Error uploading photo' }
        }

    } catch (error) {
        console.error('Error uploading photo 123 ', error);
        return { success: false, message: 'Error uploading photo' }
    }
}


// export async function DELETE(request: NextRequest) {
//     try {
//         const { imageUrl } = await request.json();
//         if (!imageUrl) {
//             return NextResponse.json({ error: 'S3 object key is required' }, { status: 400 });
//         }

//         // get the key from the url
//         const key = getS3Key(imageUrl);
//         // Delete the file from S3 with key
//         if (key && typeof key === 'string') await deleteFileFromS3(key);


//         return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
//     } catch (error) {
//         console.error('Error deleting file from S3:', error);
//         return NextResponse.json({ error: error }, { status: 500 });
//     }
// }


// Get all photos from prisma for blogs
export async function getAllPhotos() {
    try {
        const allPhotos = await prisma.image.findMany({
            where: {
                category: {
                    not: 'avatar'
                }
            }
        })
        return allPhotos
    } catch (error) {
        console.error('Error uploading photo 123 ', error);
        return { success: false, message: 'Error uploading photo' }
    }
}

export async function getAllAvatarPhotos() {
    try {
        await requireAuth();
        const allPhotos = await prisma.image.findMany({
            where: {
                category: 'avatar'
            }
        })
        return allPhotos
    } catch (error) {
        console.error('Error uploading photo 123 ', error);
        return { success: false, message: 'Error uploading photo' }
    }
}
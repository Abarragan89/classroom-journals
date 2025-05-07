import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/db/prisma';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string
    }
})

function getS3Key(imageUrl: string): string | boolean {
    // Check if the URL is a full S3 URL
    if (imageUrl.includes('.amazonaws.com/')) {
        return imageUrl.split('.amazonaws.com/')[1];
    }
    // If it's already a key (without the full URL)
    return false;
}

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
    const contentType = getContentType(filename);
    const timestampedKey = `${filename}-${Date.now()}`;

    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: timestampedKey,
        Body: file,
        ContentType: contentType
    }

    const command = new PutObjectCommand(s3Params)
    await s3Client.send(command)
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${timestampedKey}`;
    return url;
}

// Function to delete a file from S3
async function deleteFileFromS3(key: string) {
    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    };

    const command = new DeleteObjectCommand(s3Params);
    await s3Client.send(command);
}

// Add user image to S3 and database
export async function addPhotoToLibrary(request: NextRequest) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('file');

        if (!imageFile) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }
        // Get User ID
        const userId = request.headers.get('x-user-id');

        if (!userId) return NextResponse.json({ error: 'User not logged in' })

        if (imageFile instanceof File) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            // upload it to S3
            const pictureURL = await uploadFileToS3(buffer, imageFile.name)

            // Save image to database and attach to User
            const imageData = await prisma.image.create({
                data: {
                    url: pictureURL,
                    tags: ['santa']
                }
            })

            // return the HTML string returned from s3 Bucket to assign
            return NextResponse.json({ pictureURL, imageData }, { status: 200 })
            // Proceed with buffer processing
        } else {
            throw new Error("Expected file to be a File object");
        }

    } catch (error) {
        console.error('Error uploading photo 123 ', error);
        return NextResponse.json({ error: 'failed to upload image' })
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();
        if (!imageUrl) {
            return NextResponse.json({ error: 'S3 object key is required' }, { status: 400 });
        }

        // get the key from the url
        const key = getS3Key(imageUrl);
        // Delete the file from S3 with key
        if (key && typeof key === 'string') await deleteFileFromS3(key);


        return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
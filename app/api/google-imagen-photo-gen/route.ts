// make a get route that generates a photo using google imagen and returns the url of the photo
import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { GeneratedImage } from '@/app/(teacher)/admin/photo-hub/ai-integration';
import { requireAuth } from '@/lib/actions/authorization.action';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_IMAGEN_API_KEY || "",
        });

        const { searchParams } = new URL(request.url);
        const prompt = searchParams.get('prompt')
        const photoCountParam = searchParams.get('photoCount');
        const photoCount = photoCountParam ? parseInt(photoCountParam) : 1;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Make the photos
        const { generatedImages } = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: photoCount,
                aspectRatio: '16:9',
            },
        });

        if (!generatedImages) {
            return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
        }

        // Generate the tags for the photos using AWS Rekognition
        const rekognition = new RekognitionClient({
            region: process.env.AWS_S3_REGION,
            credentials: {
                accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
            },
        });

        const imageBuffers = generatedImages.map((img: any) => Buffer.from(img.image.imageBytes, 'base64'));

        const labels = await Promise.all(imageBuffers.map(async (imageBuffer) => {
            const command = new DetectLabelsCommand({
                Image: { Bytes: imageBuffer },
                MaxLabels: 10,
                MinConfidence: 70,
            });
            const result = await rekognition.send(command);
            return result.Labels;
        }));

        const imagesWithLabels: GeneratedImage[] = generatedImages.map((img: any, index: number) => ({
            imageData: img.image.imageBytes,
            tags: labels[index] ? labels[index]!.map(label => label.Name).filter((name): name is string => !!name).join(" ") : "",
        }));


        return NextResponse.json(imagesWithLabels, { status: 200 });
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: 'An error occurred while generating the image' }, { status: 500 });
    }
}
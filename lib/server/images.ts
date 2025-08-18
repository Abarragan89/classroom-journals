import { requireAuth } from "../actions/authorization.action";
import { prisma } from "@/db/prisma";

// Get all photos from prisma for blogs
export async function getAllPhotos() {
    const allPhotos = await prisma.image.findMany({
        where: {
            category: {
                not: 'avatar'
            }
        }
    });

    return allPhotos;
}

export async function getAllAvatarPhotos() {
    await requireAuth();

    const allPhotos = await prisma.image.findMany({
        where: {
            category: 'avatar'
        }
    });

    return allPhotos;
}
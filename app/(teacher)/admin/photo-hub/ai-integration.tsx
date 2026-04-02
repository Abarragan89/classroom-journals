"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addPhotoToLibraryWithAI } from "@/lib/actions/s3-upload";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { photoCategoriesForAdmin } from "@/data/photo-categories";

export type GeneratedImage = {
    imageData: string;
    tags: string;
}

export default function AIIntegration() {

    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<GeneratedImage[]>([]);
    const [photoPrompt, setPhotoPrompt] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [photoCount, setPhotoCount] = useState<number>(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isLoading = isGenerating || isSaving;

    async function generateImages(photoPrompt: string) {
        setIsGenerating(true);
        try {
            const imagesWithLabels = await fetch(`/api/google-imagen-photo-gen?prompt=${encodeURIComponent(photoPrompt)}&photoCount=${photoCount}`)
                .then(res => res.json())
                .catch(err => {
                    console.error("Error generating images:", err);
                });
            setImages(imagesWithLabels);
        } finally {
            setIsGenerating(false);
        }
    }

    function handleImageSelection(img: GeneratedImage) {
        if (selectedImages.some(i => i.imageData === img.imageData)) {
            setSelectedImages(prev => prev.filter(i => i.imageData !== img.imageData));
            return;
        }
        setSelectedImages(prev => {
            return [...prev, img];
        });
    }

    async function saveSelectedImages() {
        setIsSaving(true);
        try {
            const formData = new FormData();
            selectedImages.forEach((img, index) => {
                const blob = new Blob([Uint8Array.from(atob(img.imageData), c => c.charCodeAt(0))], { type: 'image/png' });
                formData.append('file', blob, `image-${index}.png`);
                formData.append('tags', img.tags);
                formData.append('category', selectedCategory);
            });

            console.log("made the blobs and form data, now calling addPhotoToLibraryWithAI with formData:", formData);
            const result = await addPhotoToLibraryWithAI(formData);
            if (result.success) {
                toast.success('Selected images saved successfully!');
                setSelectedImages([]);
                setImages([]);
                setPhotoPrompt("");
            } else {
                toast.error(`Error saving images: ${result.message}`);
            }
        } catch (err) {
            console.error('saveSelectedImages threw:', err);
            toast.error('An unexpected error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <section className="relative max-w-3xl mx-auto mt-14 space-y-5 mb-20">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/70 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-medium text-muted-foreground">
                        {isGenerating ? 'Generating images…' : 'Saving images…'}
                    </p>
                </div>
            )}
            <h2 className="h2-bold">Add With AI</h2>
            <div>
                <Label htmlFor="prompt">Enter a prompt to generate photos:</Label>
                <Textarea
                    rows={2}
                    id="prompt"
                    value={photoPrompt}
                    onChange={(e) => setPhotoPrompt(e.target.value)}
                    placeholder="Enter a prompt"
                    className="mt-1"
                    disabled={isLoading}
                />
            </div>
            <div className="flex-between gap-x-5">
                <div className="flex-1">
                    <Label id="category-label" className="text-right" htmlFor="category">
                        Category
                    </Label>
                    <Select
                        name="category"
                        value={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value)}
                        aria-labelledby="category-label"
                        disabled={isLoading}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            <SelectGroup>
                                <SelectLabel>Category</SelectLabel>
                                {photoCategoriesForAdmin.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-40">
                    <Label id="category-label" className="text-right" htmlFor="category">
                        Photo Count
                    </Label>
                    <Select
                        name="photoCount"
                        value={photoCount.toString()}
                        onValueChange={(value) => setPhotoCount(parseInt(value))}
                        aria-labelledby="photo-count-label"
                        disabled={isLoading}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select photo count" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            <SelectGroup>
                                <SelectLabel>Photo Count</SelectLabel>
                                {[1, 2, 3, 4, 5].map((count) => (
                                    <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={() => generateImages(photoPrompt)} disabled={isLoading}>
                Generate Images
            </Button>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {images.map((img, index) => (
                    <div key={index} className={`${selectedImages.some(i => i.imageData === img.imageData) ? 'ring-4 ring-blue-500' : 'border-4'}`}>
                        <img
                            key={index}
                            src={`data:image/png;base64,${img.imageData}`}
                            alt={`Generated ${index}`}
                            onClick={() => handleImageSelection(img)}
                            className={`w-full max-w-2xl mx-auto h-auto cursor-pointer`}
                        />
                        <Textarea
                            rows={3}
                            value={img.tags}
                            className="rounded-none"
                            onChange={(e) => {
                                const newTags = e.target.value;
                                setImages(prev => {
                                    const newImages = [...prev];
                                    newImages[index] = { ...newImages[index], tags: newTags };
                                    return newImages;
                                });
                            }}
                            placeholder="Edit tags (comma separated)"
                        />
                    </div>

                ))}
            </div>
            {selectedImages.length > 0 && !selectedCategory && (
                <p className="text-destructive text-sm mt-2">Please select a category before saving.</p>
            )}
            {selectedImages.length > 0 && (
                <p className="text-sm mt-2">{selectedImages.length} image(s) selected.</p>
            )}
            {selectedImages.length > 0 && selectedCategory && (
                <div className="mt-5">
                    <Button onClick={saveSelectedImages} disabled={selectedImages.length === 0 || !selectedCategory || isLoading}>
                        Save Selected Images
                    </Button>
                </div>
            )}
        </section>
    )
}

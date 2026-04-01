"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addPhotoToLibraryWithAI } from "@/lib/actions/s3-upload";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type GeneratedImage = {
    imageData: string;
    tags: string;
}

export default function AIIntegration() {

    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<GeneratedImage[]>([]);
    const [photoPrompt, setPhotoPrompt] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isLoading = isGenerating || isSaving;

    const photoCategories = [
        { label: "Academics", value: "academics" },
        { label: "Family", value: "family" },
        { label: "Social Studies", value: "history" },
        { label: "Nature", value: "nature" },
        { label: "Science", value: "science" },
        { label: "Art", value: "art" },
        { label: "Emotions", value: "emotions" },
        { label: "Career", value: "career" },
        { label: "Health", value: "health" },
        { label: "Holidays/Seasons", value: "seasons" },
        { label: "Sports", value: "sports" },
        { label: "Designs", value: "designs" },
        { label: "Avatar", value: "avatar" },
    ]



    async function generateImages(photoPrompt: string) {
        setIsGenerating(true);
        try {
            const imagesWithLabels = await fetch(`/api/google-imagen-photo-gen?prompt=${encodeURIComponent(photoPrompt)}`)
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
        const formData = new FormData();
        selectedImages.forEach((img, index) => {
            const blob = new Blob([Uint8Array.from(atob(img.imageData), c => c.charCodeAt(0))], { type: 'image/png' });
            formData.append('file', blob, `image-${index}.png`);
            formData.append('tags', img.tags);
            formData.append('category', selectedCategory);
        });

        const result = await addPhotoToLibraryWithAI(formData);
        if (result.success) {
            toast.success('Selected images saved successfully!');
            setSelectedImages([]);
            setImages([]);
            setPhotoPrompt("");
            setSelectedCategory('');
        } else {
            toast.error(`Error saving images: ${result.message}`);
        }
        setIsSaving(false);
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
            <div>
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
                            {photoCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
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

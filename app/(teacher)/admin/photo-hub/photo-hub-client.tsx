
'use client';
import { addPhotoToLibrary } from '@/lib/actions/s3-upload';
import { useFormStatus } from 'react-dom';
import { useState, useActionState, useEffect } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function PhotoHubClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');

    const [state, action] = useActionState(addPhotoToLibrary, {
        success: false,
        message: ''
    });

    useEffect(() => {
        if (state.success) {
            setFile(null);
            setImagePreview(null);
            setMessage('');
        }
    }, [state]);

    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSizeMB = 3.75;

        if (!validTypes.includes(file.type)) {
            return 'Please upload a JPEG, PNG, or WebP image.';
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return 'File size must be less than 3.75MB.';
        }

        return null;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setMessage('');

        if (!file) return;

        const error = validateFile(file);
        if (error) {
            setMessage(error);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        setFile(file);
    };

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending}>
                {pending ? (
                    <PulseLoader size={7} className="text-primary" />
                ) : (
                    'Upload Image'
                )}
            </Button>
        );
    }

    const photoCategories = [
        { label: "Academics", value: "academics" },
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
        { label: "Family", value: "family" }
    ]
    return (
        <form action={action} className="mx-auto max-w-md">
            <>
                <Image
                    src={imagePreview || "https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png"}
                    alt="Preview"
                    className="my-4 rounded w-full max-w-2xl mx-auto h-auto"
                    width={1920}
                    height={1080}
                />
                <Label htmlFor="category" className="text-right">
                    Category
                </Label>
                <Select name="category">
                    <SelectTrigger className="w-full">
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
                <label htmlFor="tags" className="block mt-4">
                    Tags
                </label>
                <Input type="text" name="tags" id="tags" required />
                <div className="flex-center mt-2">
                    {file && (
                        <SubmitButton />
                    )}
                    <Button className={`${file ? 'hidden' : ''}`} asChild>
                        <label className="block mt-5 cursor-pointer" htmlFor="file">
                            {file ? 'Change Photo' : 'Add Photo'}
                            <input
                                id="file"
                                name="file"
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </Button>

                </div>
                {message && <p className="text-destructive text-sm mt-2">{message}</p>}
                {state.success && <p className="text-success text-sm mt-2">Upload successful!</p>}
                {state.message && !state.success && (
                    <p className="text-destructive text-sm mt-2">{state.message}</p>
                )}
            </>
        </form>
    );
}

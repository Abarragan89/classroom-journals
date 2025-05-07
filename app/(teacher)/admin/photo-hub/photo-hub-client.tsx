// "use client"
// import { addPhotoToLibrary } from "@/lib/actions/s3-upload";
// import { useState } from "react"
// import PulseLoader from "react-spinners/PulseLoader";

// export default function PhotoHubClient() {

//     const [file, setFile] = useState<File | null>(null)
//     const [isUpLoading, setIsUploading] = useState<boolean>(false);
//     const [fileIsAccepted, setFileIsAccepted] = useState<boolean>(false)
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const [message, setMessage] = useState<string>("");

//     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         setMessage("");
//         if (file) {
//             // 1.  Check file type
//             const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
//             if (!validTypes.includes(file.type)) {
//                 setMessage("Please upload a JPEG, PNG, or WebP image.");
//                 event.target.value = ""; // Reset the input
//                 return;
//             }

//             // 2. Check file size (max 3.75MB)
//             const maxSizeMB = 3.75;
//             if (file.size > maxSizeMB * 1024 * 1024) { // Convert MB to bytes
//                 setMessage("File size must be less than 3.75MB.");
//                 event.target.value = ""; // Reset the input
//                 return;
//             }

//             // 3. Check image dimensions
//             const img = new Image();
//             img.src = URL.createObjectURL(file);
//             img.onload = () => {
//                 setFileIsAccepted(true);
//                 setMessage("Add a description and Confirm Upload");

//                 // 3. Set preview using user's file path
//                 const reader = new FileReader();
//                 reader.onload = () => setImagePreview(reader.result as string); // Set the image preview source
//                 reader.readAsDataURL(file); // Read file as Data URL

//                 // 4. If all checks pass, set the state variable to send to post request
//                 setFile(file);
//             };
//             img.onerror = () => {
//                 setFileIsAccepted(false);
//                 setMessage("Invalid image file.");
//                 event.target.value = ""; // Reset the input
//             };
//         }
//     };

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
//         if (!file) return;
//         setIsUploading(true);
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('isCoverImage', 'true')

//         try {
//             // Post to the S3 Bucket
//             const data = addPhotoToLibrary(formData)

//             // Get the pictureURL
//             // const { pictureURL } = data;


//             setImagePreview(pictureURL);
//             setMessage('');
//         } catch (error) {
//             console.error('Error uploading blog cover image:', error);
//             setMessage('Failed to upload the image. Please try again.');
//         } finally {
//             setIsUploading(false);
//             setFile(null);
//         }
//     }

//     return (
//         <div>
//             {!file &&
//                 <label
//                     className={`block w-[90%] ${imagePreview ? 'w-fit px-4' : 'max-w-[260px]'} mt-5 mx-auto custom-small-btn bg-[var(--off-black)]`}
//                     htmlFor="cover-image-upload"
//                 >
//                     {isUpLoading ?
//                         <PulseLoader
//                             loading={isUpLoading}
//                             size={7}
//                             aria-label="Loading Spinner"
//                             data-testid="loader"
//                             className="text-[var(--off-white)]"
//                         />
//                         :
//                         imagePreview ?
//                             'Change Cover Photo'
//                             :
//                             'Add Cover Photo'
//                     }
//                     <input
//                         id="cover-image-upload"
//                         type="file"
//                         className="hidden"
//                         accept="image/jpeg, image/png, image/webp"
//                         onChange={(e) => handleFileChange(e)}
//                     />
//                 </label>
//             }
//         </div>
//     )
// }

import React from 'react'

export default function PhotoHubClient() {
    return (
        <div>PhotoHubClient</div>
    )
}


"use client"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button";
import { useState } from "react"
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';


export default function RubricModalTutorial() {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title="Rubric Tutorial Video"
                description="Rubric Tutorial Video"
            >
                <div className="m-5 shadow-lg border">
                    <LiteYouTubeEmbed
                        id="1VuEmkoZmm8"
                        title={`JotterBlog Tutorial - Jots`}
                    />
                </div>
            </ResponsiveDialog>
            <Button
                variant={"link"}
                onClick={() => setIsModalOpen(true)}
                className="absolute -top-10 right-0 p-0 m-0"
            >
                Need Help? Watch Tutorial
            </Button>
        </>
    )
}

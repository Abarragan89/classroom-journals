"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Video, Clock } from "lucide-react";

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

const tutorialVideos = [
  {
    id: "item-1",
    title: "The Basics: Jots",
    description: "Learn how to create and manage your assignments.",
    videoId: "gCxIeBKOiZs",
    duration: "74s",
    isImportant: true
  },
  {
    id: "item-2",
    title: "The Basics: Assignments",
    description: "Learn how to create and manage assignments.",
    videoId: "oQxuIbV1XkI",
    duration: "64s",
    isImportant: true
  },
  {
    id: "item-3",
    title: "Classes and Rosters",
    description: "Manage your classes and student rosters.",
    videoId: "TfwPZlOttjs",
    duration: "56s",
    isImportant: false
  },
  {
    id: "item-4",
    title: "Rubrics",
    description: "Create and use rubrics for grading.",
    videoId: "1VuEmkoZmm8",
    duration: "66s",
    isImportant: false
  },
  {
    id: "item-5",
    title: "Quips",
    description: "Quick writing prompts for student engagement.",
    videoId: "xa4sxeBoQ24",
    duration: "34s",
    isImportant: false
  },
  {
    id: "item-6",
    title: "Student Requests",
    description: "Handle student requests and communications.",
    videoId: "YPkOROXrt3Q",
    duration: "40s",
    isImportant: false
  }
];

export default function TeacherGuide() {
  return (
    <div>
      <div className="mt-7 mb-5">
        <h2 className="h2-bold">1-Minute Tutorial Videos</h2>
      </div>
      <Accordion className="rounded-md" type="single" collapsible>
        {tutorialVideos.map((video) => (
          <AccordionItem
            key={video.id}
            value={video.id}
            className="rounded-md mb-5 bg-card shadow-sm overflow-hidden border border-primary hover:border-primary data-[state=open]:border-b-0 transition-all"
          >
            <AccordionTrigger className="px-6 py-4 rounded-md hover:bg-accent/50 data-[state=open]:rounded-b-none [&>svg]:hidden cursor-pointer">
              <div className="flex items-center gap-6 flex-1 text-left">
                <div className="rounded-full shrink-0">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold">{video.title}</p>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {video.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-end shrink-0">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </Badge>
                  {video.isImportant && (
                    <Badge variant="destructive" className="text-xs">Important</Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-5 sm:p-10 pt-0 sm:pt-0">
              <h4 className="h3-bold text-center pt-3">Watch Video:</h4>
              <div className="rounded-lg border overflow-hidden shadow-sm">
                <div className="scale-x-105 origin-center">
                  <LiteYouTubeEmbed
                    id={video.videoId}
                    title={`JotterBlog Tutorial - ${video.title}`}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

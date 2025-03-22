import { ArrowBigLeft, ArrowBigLeftIcon } from "lucide-react";

export default async function DiscussionBoard({
  // params
}: {
  // params: Promise<{ studentId: string, sessionId: string }>
}) {

  // const { studentId, sessionId } = await params;

  return (
    <>
      <h2 className="text-center h1-bold">Use the side navigation menu to read and comment on other Blogs! </h2>
      <ArrowBigLeftIcon className="text-center"  size={60}/>
    </>
  )
}

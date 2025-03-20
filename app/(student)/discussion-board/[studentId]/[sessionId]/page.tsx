export default async function DiscussionBoard({
  params
}: {
  params: Promise<{ studentId: string, sessionId: string }>
}) {

  const { studentId, sessionId } = await params;
  console.log('student id ', studentId)
  console.log('session id ', sessionId)

  return (
    <>
      <p>hey this is the inner lading</p>
    </>
  )
}

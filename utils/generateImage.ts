export async function generateImage({
  subject,
  background,
}: {
  subject: string;
  background?: string;
}) {
  const response = await fetch("/api/img2img", {
    method: "post",
    body: JSON.stringify({ subject, background }),
  }).then((data) => data.json());

  return response;
}

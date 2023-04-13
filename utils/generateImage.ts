export async function generateImage(screenshot: string) {
  const response = await fetch("/api/img2img", {
    method: "post",
    body: JSON.stringify({ image: screenshot }),
  }).then((data) => data.json());

  return response;
}

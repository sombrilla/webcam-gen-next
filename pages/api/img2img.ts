import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: unknown;
};

const sharedRequestData = {
  method: "post",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

async function urlToBase64(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return base64;
}

async function removeBackgroundFromScreenshot(screenshot: string) {
  const imageWithoutBackground = await fetch(
    `${process.env.NEXT_BASE_API}/sdapi/v1/extra-single-image`,
    {
      ...sharedRequestData,
      body: JSON.stringify({
        image: screenshot,
        upscaling_resize: 1,
        restore_faces: false,
      }),
    }
  ).then((response) => response.json());

  return imageWithoutBackground.image;
}

async function createBackground() {
  const backgroundRequest = await fetch(
    `${process.env.NEXT_BASE_API}/sdapi/v1/txt2img`,
    {
      ...sharedRequestData,
      body: JSON.stringify({
        prompt: "lvngvncnt, a colorful landscape by van gogh, highly detailed",
        steps: 5,
      }),
    }
  ).then((response) => response.json());

  return backgroundRequest.images[0];
}

interface CompositionSettings {
  denoise: number;
  cfgScale: number;
  controlNetWeight: number;
  background: string;
  subject: string;
}

async function generateComposition(settings: CompositionSettings) {
  const { denoise, cfgScale, controlNetWeight, background, subject } = settings;

  const data = {
    init_images: [background],
    denoising_strength: denoise || 1,
    cfg_scale: cfgScale || 9,
    resize_mode: 1,
    prompt:
      "lvngvncnt, self-portrait, young, masterpiece, award winning cinematic photo, vast landscape backdrop, highly detailed",
    negative_prompt:
      "disfigured, deformed, old, sad, angry, blurry, realistic, hyperrealistic, 3d",
    steps: 25,
    width: 512,
    height: 512,
    restore_faces: true,
    controlnet_units: [
      {
        module: "hed",
        model: "control_hed-fp16 [13fee50b]",
        weight: controlNetWeight || 1,
        width: 512,
        height: 512,
        guessmode: false,
        input_image: subject,
      },
    ],
  };

  const composition = await fetch(
    `${process.env.NEXT_BASE_API}/controlnet/img2img`,
    {
      ...sharedRequestData,
      body: JSON.stringify(data),
    }
  ).then((response) => response.json());

  return composition.images[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { image, denoise, cfgScale, controlNetWeight } = JSON.parse(req.body);

  // const test = await urlToBase64(
  //   "https://img.buzzfeed.com/buzzfeed-static/static/2020-01/23/19/campaign_images/de71054fd8a6/you-can-only-be-a-woman-if-you-pass-this-test-2-2912-1579806237-1_dblbig.jpg"
  // );

  const subjectPromise = removeBackgroundFromScreenshot(image);
  const backgroundPromise = createBackground();

  const [subject, background] = await Promise.all([
    subjectPromise,
    backgroundPromise,
  ]);

  const composition = await generateComposition({
    background,
    subject,
    denoise,
    cfgScale,
    controlNetWeight,
  });

  res.status(200).json(composition);
}

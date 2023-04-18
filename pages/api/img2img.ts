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
        prompt:
          "lvngvncnt, vivid colors, scenery, oil, impasto, highly detailed",
        negative_prompt: "portrait, person, yellow",
        cfg_scale: 7.5,
        steps: 15,
        sampler_index: "Euler",
        restore_faces: false,
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
    cfg_scale: cfgScale || 7.5,
    resize_mode: 1,
    prompt:
      "lvngvncnt, beautiful scenery behind, vivid colors, portrait, masterpiece, oil, impasto, highly detailed",
    negative_prompt:
      "disfigured, deformed, black person, yellow, gradient, white hair, blurry, realistic, hyperrealistic, 3d",
    steps: 25,
    sampler_index: "Euler",
    width: 512,
    height: 512,
    restore_faces: true,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            module: "clip_vision",
            model: "t2iadapter_style_sd14v1 [202e85cc]",
            weight: controlNetWeight || 0.15,
            guessmode: false,
          },
          {
            module: "hed",
            model: "control_hed-fp16 [13fee50b]",
            weight: controlNetWeight || 0.3,
            guessmode: false,
          },
          {
            module: "hed",
            model: "control_hed-fp16 [13fee50b]",
            weight: controlNetWeight || 1,
            guessmode: false,
            input_image: subject,
          },
        ],
      },
    },
  };

  const composition = await fetch(
    `${process.env.NEXT_BASE_API}/sdapi/v1/img2img`,
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
  //   "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
  // );

  const [subject, background] = await Promise.all([
    removeBackgroundFromScreenshot(image),
    createBackground(),
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

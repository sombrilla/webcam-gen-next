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
        prompt: "lvngvncnt, a vast landscape by van gogh, highly detailed",
        steps: 15,
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
    denoising_strength: denoise || 2,
    cfg_scale: cfgScale || 10,
    resize_mode: 1,
    // initial_noise_multiplier: 1.08,
    prompt: "lvngvncnt, portrait of a person",
    negative_prompt:
      "disfigured, deformed, hat, old, sad, angry, blurry, realistic, hyperrealistic, 3d, cartoon",
    steps: 10,
    n_iter: 3,
    width: 512,
    height: 512,
    restore_faces: true,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            module: "clip_vision",
            model: "t2iadapter_style_sd14v1 [202e85cc]",
            weight: controlNetWeight || 0.65,
            // guidance_start: 0.2,
            guessmode: false,
            input_image: background,
          },
          {
            module: "hed",
            model: "control_hed-fp16 [13fee50b]",
            weight: controlNetWeight || 0.3,
            guessmode: false,
            input_image: background,
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

enum Background {
  StarryNight = "starry-night",
  SelfPortrait = "self-portrait",
  Bedroom = "bedroom",
}

const backgrounds = {
  [Background.StarryNight]:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
  [Background.SelfPortrait]:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/1920px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg",
  [Background.Bedroom]: "https://rrf51p-3000.csb.app/bedroom.jpeg",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { subject, background, denoise, cfgScale, controlNetWeight } =
    JSON.parse(req.body);

  const subjectPromise = removeBackgroundFromScreenshot(subject);
  const selectedBackground = backgrounds[background as Background];
  const backgroundPromise = selectedBackground
    ? urlToBase64(selectedBackground)
    : createBackground();

  const [subjectResponse, backgroundResponse] = await Promise.all([
    subjectPromise,
    backgroundPromise,
  ]);

  const composition = await generateComposition({
    background: backgroundResponse,
    subject: subjectResponse,
    subject2: subject,
    denoise,
    cfgScale,
    controlNetWeight,
  });

  res.status(200).json(composition);
}

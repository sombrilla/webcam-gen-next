import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = {
    init_images: [JSON.parse(req.body)],
    denoising_strength: 0.65,
    cfg_scale: 8,
    resize_mode: 1,
    prompt: "lvngvncnt, a young person, highly detailed",
    negative_prompt: "disfigured, deformed, realistic, 3d",
    steps: 20,
    sample_index: "DDIM",
    styles: ["van gogh"],
    width: 512,
    height: 512,
    restore_faces: true,
    controlnet_units: [
      {
        module: "hed",
        model: "control_hed-fp16 [13fee50b]",
        weight: 1,
        width: 512,
        height: 512,
        guessmode: false,
      },
    ],
  };

  const postResponse = await fetch(
    `${process.env.NEXT_BASE_API}/controlnet/img2img`,
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  ).then((response) => response.json());

  res.status(200).json({ data: postResponse });
}

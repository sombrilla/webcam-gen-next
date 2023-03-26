// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
    denoising_strength: 0.75,
    cfg_scale: 7.5,
    prompt: "lvngvncnt, a young person, intrinsic, surreal, 2d, impasto, thick brushstrokes, knife, prima, thick layers of paint, epic, impressionism, in the style of van gogh",
    negative_prompt: "3d, realism, hyperrealistic, eyes, ginger",
    steps: 8,
    sample_index: 'Euler',
    styles: ['van gogh'],
    width: 512,
    height: 512,
    restore_faces: true,
    controlnet_units: [
      {
        module: 'hed',
        model: 'control_hed-fp16 [13fee50b]',
        weight: 0.85,
        width: 512,
        height: 382,
        guessmode: false,
      },
    ]
  };

  const postResponse = await fetch("http://127.0.0.1:7860/controlnet/img2img", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());

  res.status(200).json({ data: postResponse });
}

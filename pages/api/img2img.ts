// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const postResponse = await fetch("http://127.0.0.1:7860/sdapi/v1/img2img", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: req.body,
  }).then((response) => response.json());

  res.status(200).json({ data: postResponse });
}

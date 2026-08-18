import express, { Request, Response } from "express";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  if (req.body.hasOwnProperty("text")) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${req.body.text}&tl=en&total=1&idx=0&textlen=9&client=tw-ob&prev=input&ttsspeed=1`;
    const audio = await fetch(url);
    res.write(await audio.bytes());
    res.end();
  } else {
    res.send(400);
  }
});

export default router;

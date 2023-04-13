import Head from "next/head";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { WebCam } from "@/components/WebCam/WebCam";
import { Spinner } from "@/components/Spinner/Spinner";

import styles from "@/styles/Home.module.scss";
import { Flash } from "@/components/Flash/Flash";

const denoise = 1;
const cfgScale = 9;
const controlNetWeight = 1;

export default function Home() {
  const [screenshot, setScreenshot] = useState<string>();
  const [generated, setGenerated] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const webCamHandleRef = useRef<{ takeScreenshot: Function }>(null);
  const flashHandleRef = useRef<{ triggerFlash: Function }>(null);

  async function getGeneratedImage() {
    if (isLoading) return;

    setIsLoading(true);

    const data = {
      image: screenshot,
      denoise,
      cfgScale,
      controlNetWeight,
    };

    try {
      const response = await fetch("/api/img2img", {
        method: "post",
        body: JSON.stringify(data),
      }).then((data) => data.json());

      setGenerated(response);
    } catch (error) {
      // TODO: Handle error
      console.log("There was an error please try again");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function takeScreenshot() {
    flashHandleRef.current?.triggerFlash();
    webCamHandleRef.current?.takeScreenshot();
  }

  function clearScreenshot() {
    if (isLoading) return;
    setScreenshot(undefined);
  }

  function clearAll() {
    if (isLoading) return;
    clearScreenshot();
    setGenerated(undefined);
  }

  return (
    <>
      <Head>
        <title>Webcam gen</title>
        <meta name="description" content="Webcam gen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.home}>
        {generated && screenshot && (
          <motion.img
            layoutId={screenshot}
            src={screenshot}
            alt="screenshot"
            className={styles.preview}
          />
        )}

        <div className={styles.buttonsContainer}>
          {!generated && !screenshot && (
            <button onClick={takeScreenshot}>Take screenshot</button>
          )}

          {!generated && screenshot && (
            <>
              <button onClick={clearScreenshot} disabled={isLoading}>
                Retake
              </button>

              <button onClick={getGeneratedImage} disabled={isLoading}>
                Generate
              </button>
            </>
          )}

          {generated && (
            <>
              <button onClick={clearAll} disabled={isLoading}>
                Take another screenshot
              </button>

              <button onClick={getGeneratedImage} disabled={isLoading}>
                Retry with same image
              </button>
            </>
          )}
        </div>

        <div className={styles.content}>
          {isLoading && <Spinner />}

          <Flash ref={flashHandleRef} />

          {!generated && !screenshot && (
            <WebCam ref={webCamHandleRef} onScreenshot={setScreenshot} />
          )}

          {!generated && screenshot && (
            <motion.img
              layoutId={screenshot}
              src={screenshot}
              alt="screenshot"
              className={styles.screenshot}
            />
          )}

          {generated && (
            <img
              className={styles.generated}
              src={`data:image/webp;base64,${generated}`}
              alt="generated"
            />
          )}
        </div>
      </main>
    </>
  );
}

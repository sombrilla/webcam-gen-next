import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

import { generateImage } from "@/utils/generateImage";
import { retryPromise } from "@/utils/retryPromise";

import { WebCam } from "@/components/WebCam/WebCam";
import { Spinner } from "@/components/Spinner/Spinner";
import { Flash } from "@/components/Flash/Flash";

import styles from "@/styles/Home.module.scss";

enum Status {
  WebCam = "webcam",
  ScreenshotPreview = "screenshot-preview",
  Generated = "generated",
}

export default function Home() {
  const [screenshot, setScreenshot] = useState<string>();
  const [generated, setGenerated] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [status, setStatus] = useState<Status>(Status.WebCam);

  const webCamHandleRef = useRef<{ takeScreenshot: Function }>(null);
  const flashHandleRef = useRef<{ triggerFlash: Function }>(null);

  async function getGeneratedImage() {
    if (isLoading || !screenshot) return;

    setIsLoading(true);

    retryPromise(generateImage, screenshot)
      .then(setGenerated)
      .catch((error) =>
        console.log("There was an error, please try again!", error)
      )
      .finally(() => setIsLoading(false));
  }

  async function takeScreenshot() {
    flashHandleRef.current?.triggerFlash();

    setTimeout(async () => {
      const webCamScreenshot = await webCamHandleRef.current?.takeScreenshot();

      setScreenshot(webCamScreenshot);
    }, 150);
  }

  function clearAll() {
    if (isLoading) return;
    setScreenshot(undefined);
    setGenerated(undefined);
  }

  function getUiButtons() {
    switch (status) {
      case Status.WebCam:
        return <button onClick={takeScreenshot}>Take screenshot</button>;
      case Status.ScreenshotPreview:
        return (
          <>
            <button onClick={clearAll} disabled={isLoading}>
              Retake
            </button>

            <button onClick={getGeneratedImage} disabled={isLoading}>
              Generate
            </button>
          </>
        );
      case Status.Generated:
        return (
          <>
            <button onClick={clearAll} disabled={isLoading}>
              Take another screenshot
            </button>

            <button onClick={getGeneratedImage} disabled={isLoading}>
              Retry with same image
            </button>
          </>
        );
    }
  }

  function getContent() {
    switch (status) {
      case Status.WebCam:
        return <WebCam ref={webCamHandleRef} />;
      case Status.ScreenshotPreview:
        return (
          <motion.img
            layoutId={screenshot}
            src={screenshot}
            alt="screenshot"
            className={styles.screenshot}
          />
        );
      case Status.Generated:
        return (
          <img
            className={styles.generated}
            src={`data:image/webp;base64,${generated}`}
            alt="generated"
          />
        );
    }
  }

  useEffect(() => {
    if (generated) setStatus(Status.Generated);
    else if (screenshot) setStatus(Status.ScreenshotPreview);
    else setStatus(Status.WebCam);
  }, [screenshot, generated]);

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

        <div className={styles.buttonsContainer}>{getUiButtons()}</div>

        <div className={styles.content}>
          {isLoading && <Spinner />}

          <Flash ref={flashHandleRef} />

          {getContent()}
        </div>
      </main>
    </>
  );
}

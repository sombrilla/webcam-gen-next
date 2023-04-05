import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { WebCam } from "@/components/WebCam";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/Spinner/Spinner";

const FLASH_DURATION = 300;

export default function Home() {
  const flashRef = useRef<HTMLDivElement>(null);

  const [screenshot, setScreenshot] = useState<string>();
  const [generated, setGenerated] = useState<string>();
  const [generating, setGenerating] = useState<boolean>(false);

  async function triggerFlash() {
    return new Promise((resolve) => {
      flashRef.current?.classList.add("flash");

      setTimeout(() => {
        flashRef.current?.classList.remove("flash");

        setTimeout(() => {
          resolve(null);
        }, FLASH_DURATION);
      }, FLASH_DURATION);
    });
  }

  useEffect(() => {
    if (screenshot) {
      triggerFlash();
    }
  }, [screenshot]);

  async function getGeneratedImage() {
    if (generating) return;

    setGenerating(true);

    const response = await fetch("/api/img2img", {
      method: "post",
      body: JSON.stringify(screenshot),
    }).then((data) => data.json());

    setGenerating(false);
    setGenerated(response.data.images[0]);
  }

  function clearScreenShot() {
    if (generating) return;
    setScreenshot(undefined);
  }

  function clearAll() {
    if (generating) return;
    clearScreenShot();
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

      <main>
        {generated && screenshot && (
          <div className="preview">
            <h2>Original</h2>

            <motion.img
              layoutId={screenshot}
              src={screenshot}
              alt="screenshot"
            />
          </div>
        )}

        <div className="content">
          {generating && (
            <>
              <div className="loadingOverlay" />
              <Spinner />
            </>
          )}

          <div ref={flashRef} className="flashWrapper" />

          {!screenshot && !generated && <WebCam onScreenshot={setScreenshot} />}

          {screenshot && !generated && (
            <>
              <motion.img
                layoutId={screenshot}
                src={screenshot}
                alt="screenshot"
              />

              <div className={styles.buttonsContainer}>
                <button onClick={clearScreenShot} disabled={generating}>
                  Retake
                </button>

                <button onClick={getGeneratedImage} disabled={generating}>
                  Generate
                </button>
              </div>
            </>
          )}

          {generated && (
            <>
              <img src={`data:image/png;base64,${generated}`} alt="generated" />

              <div className={styles.buttonsContainer}>
                <button onClick={clearAll} disabled={generating}>
                  Clear
                </button>

                <button onClick={getGeneratedImage} disabled={generating}>
                  Retry
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

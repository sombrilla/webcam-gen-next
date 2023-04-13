import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { WebCam } from "@/components/WebCam";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/Spinner/Spinner";
import { Controls } from "@/components/Controls/Controls";

const FLASH_DURATION = 300;
const defaultDenoise = 1;
const defaultCfgScale = 9;
const defaultControlNetWeight = 1;

export default function Home() {
  const flashRef = useRef<HTMLDivElement>(null);

  const [denoise, setDenoise] = useState<number>(defaultDenoise);
  const [cfgScale, setCfgScale] = useState<number>(defaultCfgScale);
  const [controlNetWeight, setControlNetWeight] = useState<number>(
    defaultControlNetWeight
  );

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
      console.log("oops, there was an error please try again");
      console.log(error);
    } finally {
      setGenerating(false);
    }
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
        <Controls
          current={{ denoise, cfgScale, controlNetWeight }}
          defaults={{
            denoise: defaultDenoise,
            cfgScale: defaultCfgScale,
            controlNetWeight: defaultControlNetWeight,
          }}
          onControlChange={{
            denoise: setDenoise,
            cfgScale: setCfgScale,
            controlNetWeight: setControlNetWeight,
          }}
        />

        {generated && screenshot && (
          <motion.img
            layoutId={screenshot}
            src={screenshot}
            alt="screenshot"
            className="preview"
          />
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
              <img
                src={`data:image/webp;base64,${generated}`}
                alt="generated"
              />

              <div className={styles.buttonsContainer}>
                <button onClick={clearAll} disabled={generating}>
                  Take another screenshot
                </button>

                <button onClick={getGeneratedImage} disabled={generating}>
                  Retry with same image
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

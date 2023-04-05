import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { WebCam } from "@/components/WebCam";
import { useState } from "react";

export default function Home() {
  const [screenshot, setScreenshot] = useState<string>();
  const [generated, setGenerated] = useState<string>();
  const [generating, setGenerating] = useState<boolean>(false);

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
        {!screenshot && !generated && <WebCam onScreenshot={setScreenshot} />}

        {screenshot && !generated && (
          <>
            <img src={screenshot} alt="screenshot" />
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
      </main>
    </>
  );
}

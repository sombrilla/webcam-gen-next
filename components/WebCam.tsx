import { useEffect, useRef } from "react";

interface WebCamProps {
  onScreenshot: (image: string) => void;
}

export function WebCam({ onScreenshot }: WebCamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function takeScreenshot() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataURI = canvas.toDataURL("image/png");

    onScreenshot(dataURI);
  }

  useEffect(() => {
    if (!videoRef.current) return;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          if (!videoRef.current) return;

          videoRef.current.srcObject = stream;
        })
        .catch(function () {
          console.log("Something went wrong!");
        });
    }
  }, []);

  return (
    <div className="webCam">
      <video
        autoPlay
        ref={videoRef}
        style={{ width: "100%", transform: "scaleX(-1)" }}
      />

      <button onClick={takeScreenshot}>Take screenshot</button>
    </div>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import styles from "./WebCam.module.scss";

export const WebCam = forwardRef<{ takeScreenshot: Function }, {}>(
  ({}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    async function takeScreenshot() {
      if (!videoRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);

      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataURI = canvas.toDataURL("image/png");

      return dataURI;
    }

    useImperativeHandle(ref, () => {
      return { takeScreenshot };
    });

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
      <video className={styles.video} autoPlay playsInline ref={videoRef} />
    );
  }
);

WebCam.displayName = "WebCam";

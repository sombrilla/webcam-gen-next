import { forwardRef, useImperativeHandle, useRef } from "react";

import styles from "./Flash.module.scss";

const FLASH_DURATION = 300;

export const Flash = forwardRef<{ triggerFlash: Function }, {}>(({}, ref) => {
  const flashRef = useRef<HTMLDivElement>(null);

  function triggerFlash() {
    new Promise((resolve) => {
      flashRef.current?.classList.add("flash");

      setTimeout(() => {
        flashRef.current?.classList.remove("flash");

        setTimeout(() => {
          resolve(null);
        }, FLASH_DURATION);
      }, FLASH_DURATION);
    });
  }

  useImperativeHandle(ref, () => ({ triggerFlash }));

  return <div ref={flashRef} className={styles.flashWrapper} />;
});

Flash.displayName = "Flash";

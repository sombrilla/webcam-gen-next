import { forwardRef, useImperativeHandle, useRef } from "react";

import styles from "./Flash.module.scss";

const FLASH_DURATION = 450;

export const Flash = forwardRef<{ triggerFlash: Function }, {}>(({}, ref) => {
  const flashRef = useRef<HTMLDivElement>(null);

  function triggerFlash() {
    if (!flashRef.current) return;

    flashRef.current.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
      {
        duration: FLASH_DURATION,
        iterations: 1,
        easing: "ease-out",
      }
    );
  }

  useImperativeHandle(ref, () => ({ triggerFlash }));

  return <div ref={flashRef} className={styles.flashWrapper} />;
});

Flash.displayName = "Flash";

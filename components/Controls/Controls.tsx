import styles from "./Controls.module.scss";

enum ControlName {
  Denoise = "denoise",
  CfgScale = "cfgScale",
  ControlNetWeight = "controlNetWeight",
}

interface ControlsProps {
  onControlChange: Record<ControlName, (value: number) => void>;
  defaults: Record<ControlName, number>;
  current: Record<ControlName, number>;
}

export function Controls({
  onControlChange,
  defaults,
  current,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <div>
        <h3>Denoise</h3>
        <p>(afecta toda la generacion)</p>
        <input
          onChange={(event) =>
            onControlChange[ControlName.Denoise](+event.target.value)
          }
          type="range"
          defaultValue={defaults[ControlName.Denoise]}
          min={0.5}
          max={1}
          step={0.05}
        />
        <span>{current[ControlName.Denoise]}</span>
      </div>

      <div>
        <h3>CFG Scale</h3>
        <p>(afecta mayormente colores)</p>
        <input
          onChange={(event) =>
            onControlChange[ControlName.CfgScale](+event.target.value)
          }
          type="range"
          defaultValue={defaults[ControlName.CfgScale]}
          min={4}
          max={11}
          step={0.5}
        />
        <span>{current[ControlName.CfgScale]}</span>
      </div>

      <div>
        <h3>ControlNet Weight</h3>
        <p>(afecta el "outline" de la imagen base)</p>
        <input
          onChange={(event) =>
            onControlChange[ControlName.ControlNetWeight](+event.target.value)
          }
          type="range"
          defaultValue={defaults[ControlName.ControlNetWeight]}
          min={0.1}
          max={1}
          step={0.1}
        />
        <span>{current[ControlName.ControlNetWeight]}</span>
      </div>
    </div>
  );
}

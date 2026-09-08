"use client";
import { useId } from "react";
import {
  dimensionLabel,
  type Dimensions,
  type ClockShape,
  type MeasuredType,
  type PricingSettings,
  type MeasurementModes,
  type PricingMode,
} from "@/lib/pricing";
import styles from "./measurement-controls.module.css";

function SizeField({
  label,
  value,
  onChange,
  presets,
  circle,
  settings,
  mode,
  onModeChange,
}: {
  label: string;
  value: Dimensions["panel"];
  onChange: (v: Dimensions["panel"]) => void;
  presets: Dimensions["panel"][];
  circle?: boolean;
  settings: PricingSettings;
  mode: PricingMode;
  onModeChange: (mode: PricingMode) => void;
}) {
  const id = useId();
  const index = presets.findIndex(
    (p) => p.width === value.width && p.height === value.height,
  );
  const isCustom = mode === "custom" || index < 0;
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      <select
        aria-label={`${label} seçimi`}
        value={isCustom ? "custom" : index}
        onChange={(e) => {
          const next = e.target.value;
          onModeChange(next === "custom" ? "custom" : "standard");
          if (next !== "custom") onChange({ ...presets[Number(next)] });
        }}
      >
        {presets.map((p, i) => (
          <option key={i} value={i}>
            {dimensionLabel(p, circle)}
          </option>
        ))}
        <option value="custom">Özel ölçü</option>
      </select>
      {isCustom && (
        <div className={styles.inputs}>
          {(circle ? (["width"] as const) : (["width", "height"] as const)).map(
            (axis) => (
              <label key={axis} htmlFor={`${id}-${axis}`}>
                {circle
                  ? "Çap (cm)"
                  : axis === "width"
                    ? "En (cm)"
                    : "Boy (cm)"}
                <input
                  id={`${id}-${axis}`}
                  type="number"
                  inputMode="decimal"
                  min={settings.minCm}
                  max={settings.maxCm}
                  step="0.1"
                  required
                  value={Number.isFinite(value[axis]) ? value[axis] : ""}
                  onChange={(e) =>
                    onChange(
                      circle
                        ? {
                            width: e.target.valueAsNumber,
                            height: e.target.valueAsNumber,
                          }
                        : { ...value, [axis]: e.target.valueAsNumber },
                    )
                  }
                />
              </label>
            ),
          )}
        </div>
      )}
    </fieldset>
  );
}
export function MeasurementControls({
  kind,
  shape,
  value,
  onChange,
  settings,
  modes,
  onModesChange,
}: {
  kind: MeasuredType;
  shape: ClockShape;
  value: Dimensions;
  onChange: (v: Dimensions) => void;
  settings: PricingSettings;
  modes: MeasurementModes;
  onModesChange: (modes: MeasurementModes) => void;
}) {
  return (
    <div className={styles.controls}>
      {kind !== "saat" && (
        <SizeField
          label={kind === "set" ? "İki tablonun ortak ölçüsü" : "Tablo ölçüsü"}
          value={value.panel}
          mode={modes.panel}
          onModeChange={(panel) => onModesChange({ ...modes, panel })}
          onChange={(panel) => onChange({ ...value, panel })}
          presets={settings.panelPresets}
          settings={settings}
        />
      )}
      {kind !== "tablo" && (
        <SizeField
          key={shape}
          label="Saat ölçüsü"
          circle={shape === "circle"}
          value={value.clock}
          mode={modes.clock}
          onModeChange={(clock) => onModesChange({ ...modes, clock })}
          onChange={(clock) => onChange({ ...value, clock })}
          presets={
            shape === "circle"
              ? settings.diameterPresets.map((d) => ({ width: d, height: d }))
              : settings.clockPresets
          }
          settings={settings}
        />
      )}
    </div>
  );
}

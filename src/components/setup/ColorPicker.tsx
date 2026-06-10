"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PlayerColor } from "@/lib/openings/types";

interface ColorPickerProps {
  value: PlayerColor;
  onChange: (color: PlayerColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
        Play as
      </h2>
      <div className="flex gap-4">
        {(["white", "black"] as PlayerColor[]).map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(color)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all cursor-pointer",
              value === color
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
            )}
          >
            {/* Chess king icon as SVG */}
            <div
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center text-4xl",
                color === "white" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-100 border border-zinc-600"
              )}
            >
              {color === "white" ? "♔" : "♚"}
            </div>
            <span className="font-semibold capitalize text-zinc-100">{color}</span>
            {value === color && (
              <motion.div
                layoutId="color-selection"
                className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

import React, { memo, useLayoutEffect } from "react";
import { AnimationEngine } from "./Three/AnimationEngine";

export interface ThreeAnimationProps {
  id: string;
  src: string;
  imageRatio?: number;
  className?: string;
  style?: React.CSSProperties;
}
export const ThreeAnimation = memo(
  ({ id, src, className, style, imageRatio = 1 }: ThreeAnimationProps) => {
    useLayoutEffect(() => {
      new AnimationEngine(id, src, imageRatio);
    }, [id, src]);

    return <canvas id={id} className={className} style={style}></canvas>;
  },
);

ThreeAnimation.displayName = "ThreeAnimation";

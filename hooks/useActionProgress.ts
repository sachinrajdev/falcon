"use client";

import { useEffect, useRef, useState } from "react";

export type RunningAction = "idle" | "upload" | "tailor" | "outreach";

export type ProgressState = {
  visible: boolean;
  action: RunningAction;
  step: number;
  total: number;
  message: string;
  elapsedSec: number;
};

export function useActionProgress() {
  const [runningAction, setRunningAction] = useState<RunningAction>("idle");
  const [progress, setProgress] = useState<ProgressState>({
    visible: false,
    action: "idle",
    step: 0,
    total: 0,
    message: "",
    elapsedSec: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionStartRef = useRef<number>(0);

  const beginProgress = (
    action: RunningAction,
    total: number,
    firstMessage: string,
  ) => {
    setRunningAction(action);
    actionStartRef.current = Date.now();

    setProgress({
      visible: true,
      action,
      step: 1,
      total,
      message: firstMessage,
      elapsedSec: 0,
    });

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => ({
        ...p,
        elapsedSec: Math.floor((Date.now() - actionStartRef.current) / 1000),
      }));
    }, 1000);
  };

  const updateProgress = (step: number, message: string) => {
    setProgress((p) => ({ ...p, step, message }));
  };

  const endProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress({
      visible: false,
      action: "idle",
      step: 0,
      total: 0,
      message: "",
      elapsedSec: 0,
    });

    setRunningAction("idle");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    runningAction,
    progress,
    beginProgress,
    updateProgress,
    endProgress,
  };
}

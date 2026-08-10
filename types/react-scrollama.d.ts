declare module "react-scrollama" {
  import type { ReactElement, ReactNode } from "react";

  export interface StepCallbackResponse<T> {
    element: HTMLElement;
    data: T;
    direction: "up" | "down";
    entry: IntersectionObserverEntry;
  }

  export interface ScrollamaProps<T> {
    children: ReactNode;
    offset?: number | string;
    threshold?: number;
    debug?: boolean;
    onStepEnter?: (response: StepCallbackResponse<T>) => void;
    onStepExit?: (response: StepCallbackResponse<T>) => void;
    onStepProgress?: (response: StepCallbackResponse<T> & { progress: number }) => void;
  }

  export function Scrollama<T = unknown>(props: ScrollamaProps<T>): ReactElement;

  export interface StepProps<T> {
    data?: T;
    children: ReactElement;
  }

  export function Step<T = unknown>(props: StepProps<T>): ReactElement;
}

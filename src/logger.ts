import { printHtml } from "kolmafia";

const defaultHandlers = {
  info: (message: string) => printHtml(`<b>[Libram]</b> ${message}`),
  warning: (message: string) =>
    printHtml(
      `<span style="background: orange; color: white;"><b>[Libram]</b> ${message}</span>`
    ),
  error: (error: string | Error) =>
    printHtml(
      `<span style="background: red; color: white;"><b>[Libram]</b> ${error.toString()}</span>`
    ),
  debug: (message: string) => 
    printHtml(
      `<span style="background: blue; color: white;"><b>[Libram DEBUG]</b> ${message}</span>`
    ),
};

export type LogLevel = keyof typeof defaultHandlers;

class Logger {
  debugMode = false
  handlers = defaultHandlers;

  setDebugMode(enabled = true) {
    this.debugMode = enabled;
  }

  setHandler(
    level: "error",
    callback: (message: string | Error) => unknown
  ): void;
  setHandler(
    level: "warning" | "info" | "debug",
    callback: (message: string) => unknown
  ): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setHandler(level: LogLevel, callback: (message: any) => unknown): void {
    this.handlers[level] = callback;
  }

  log(level: "error", message: string | Error): void;
  log(level: "warning" | "info" | "debug", message: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(level: LogLevel, message: any): void {
    if (level === "debug" && !this.debugMode) return;
    this.handlers[level](message);
  }

  info(message: string) {
    this.log("info", message);
  }

  warning(message: string) {
    this.log("warning", message);
  }

  error(message: string | Error) {
    this.log("error", message);
  }

  debug(message: string) {
    this.log("debug", message);
  }
}

export default new Logger();

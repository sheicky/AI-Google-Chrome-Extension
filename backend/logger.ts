/* eslint-disable */

const isServer = typeof window === "undefined";

export class Logger {
  private context: string;
  private isServerContext: boolean;
  private colors = {
    reset: "\\x1b[0m",
    red: "\\x1b[31m",
    yellow: "\\x1b[33m",
    blue: "\\x1b[34m",
    gray: "\\x1b[90m",
    bold: "\\x1b[1m",
    magenta: "\\x1b[35m",
  };

  constructor(context: string) {
    this.context = context;
    this.isServerContext = isServer;
  }

  private shouldLog(): boolean {
    // Always log server-side actions
    if (this.isServerContext) return true;
    // Only log client-side in development
    return process.env.NODE_ENV === "development";
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.log(
      `${this.colors.blue}[INFO]${this.colors.reset} [${this.context}]:`,
      message,
      data || ""
    );
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.log(
      `${this.colors.gray}[DEBUG]${this.colors.reset} [${this.context}]:`,
      message,
      data || ""
    );
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.warn(
      `${this.colors.yellow}[WARN]${this.colors.reset} [${this.context}]:`,
      message,
      data || ""
    );
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.error(
      `${this.colors.red}[ERROR]${this.colors.reset} [${this.context}]:`,
      message,
      data || ""
    );
  }
}

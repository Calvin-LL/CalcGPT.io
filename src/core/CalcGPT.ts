export const DEFAULT_TEMPERATURE = 1;
export const DEFAULT_TOP_P = 1;

export interface GPTOutputHandler {
  (newToken: string): void;
}

export interface GPTCalculateArgs {
  input: string;
  outputHandler: GPTOutputHandler;
  temperature?: number;
  topP?: number;
}

export interface CalcGPT {
  calculate: (args: GPTCalculateArgs) => Promise<void>;
}

export class CalcGPTGeneric implements CalcGPT {
  /**
   * @description Accept input like "1+1"
   */
  async calculate(args: GPTCalculateArgs): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

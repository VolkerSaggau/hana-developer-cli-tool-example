export function handler(argv: any): void;
export function dbStatus(prompts: any): Promise<void>;
export const command: "dataVolumes";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;

declare module "pdf-parse" {
  function pdfParse(dataBuffer: Buffer, options?: unknown): Promise<{ text: string; numpages: number; info: unknown; metadata: unknown }>;
  export default pdfParse;
}

declare module "sharp" {
  type SharpInput = Buffer | Uint8Array | string;

  type SharpResizeOptions = {
    width?: number;
    height?: number;
    fit?: "contain" | "cover" | "fill" | "inside" | "outside";
    background?:
      | string
      | {
          r: number;
          g: number;
          b: number;
          alpha?: number;
        };
    withoutEnlargement?: boolean;
  };

  type SharpPngOptions = {
    compressionLevel?: number;
    palette?: boolean;
    quality?: number;
    effort?: number;
    colors?: number;
  };

  interface SharpInstance {
    rotate(): SharpInstance;
    resize(options: SharpResizeOptions): SharpInstance;
    png(options?: SharpPngOptions): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }

  interface SharpFactory {
    (input?: SharpInput): SharpInstance;
  }

  const sharp: SharpFactory;
  export default sharp;
}

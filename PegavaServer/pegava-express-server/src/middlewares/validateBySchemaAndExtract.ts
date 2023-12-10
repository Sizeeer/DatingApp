import type { Schema } from "express-validator";
import { validateBySchema } from "./validateBySchema";
import { extractValidatedData } from "./extractValidatedData";
import { ExtractValidatedDataOptions } from "./extractValidatedData";

export const validateBySchemaAndExtract = (
  schema: Schema,
  options?: ExtractValidatedDataOptions
) => [...validateBySchema(schema), extractValidatedData(options)];

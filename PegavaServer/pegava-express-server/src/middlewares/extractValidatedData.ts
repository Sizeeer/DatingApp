import type { NextFunction, Request, Response } from "express";
import type { MatchedDataOptions } from "express-validator";
import { matchedData } from "express-validator";

export type ExtractValidatedDataOptions = Partial<MatchedDataOptions>;

export interface RequestWithValidatedData<T = unknown> extends Request {
  validatedData: T;
}

export const extractValidatedData =
  (options?: Partial<MatchedDataOptions>) =>
  (req: RequestWithValidatedData, res: Response, next: NextFunction) => {
    try {
      const data = options ? matchedData(req, options) : matchedData(req);
      req.validatedData = data;
      next();
    } catch (err) {
      next(err);
    }
  };

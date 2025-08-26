import { UserPayload } from "../../models/user";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}

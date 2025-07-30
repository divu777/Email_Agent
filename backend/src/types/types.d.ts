
import 'express-session';


declare module 'express-session'{
    interface SessionData{
        state?:string
    }
}
declare global {
  namespace Express {
    interface Request {
      email?: string;
    }
  }
}
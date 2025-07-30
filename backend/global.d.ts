// declare namespace Express {
//   export interface Request {
//     user: {
//       userId: string;
//     };
//   }
// }


// old one 




// new one 

import { Request } from 'express';

declare module 'express-serve-static-core'{
    export interface Request{
        user:{
            userId:string
        }
    }
}


declare module "express-session"{
    export interface SessionData{
        state:string
    }
}


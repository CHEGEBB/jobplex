// src/types/express.d.ts

import { User } from './user.types';

declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      user: User;
    }
  }
}

// Need to export something to make this a module
export {};
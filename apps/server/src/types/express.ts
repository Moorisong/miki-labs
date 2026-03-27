import { IUser } from '../models/user.model';
import type { ChicoStudentPayload } from '../middlewares/chicorun-student-auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      chicoStudent?: ChicoStudentPayload;
    }
  }
}

import { IUser } from '../models/user.model';
import type { ChicoStudentPayload } from '../middlewares/chicorun-student-auth';
import type { ChicoTeacherPayload } from '../middlewares/chicorun-teacher-auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      chicoStudent?: ChicoStudentPayload;
      chicoTeacher?: ChicoTeacherPayload;
    }
  }
}

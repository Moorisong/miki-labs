import { Router } from 'express';
import { chicorunStudentAuth } from '../middlewares/chicorun-student-auth';
import { chicorunTeacherAuth } from '../middlewares/chicorun-teacher-auth';
import { getQuestion, submitAnswer, resetProgress } from '../controllers/chicorun-solve.controller';
import { studentLogin, getStudentMe, updateCustomize } from '../controllers/chicorun-student.controller';
import {
    createClass,
    getMyClasses,
    getClassStudents,
    resetStudentPassword,
    updateStudentNickname,
    getClassRanking,
    loginTeacher,
} from '../controllers/chicorun-class.controller';

const router = Router();

// ─── 학생 인증 API ──────────────────────────────────────────────────────────────
router.post('/student/login', studentLogin);
router.post('/teacher/login', loginTeacher);

// ─── 학생 학습 API (studentAuth 필요) ───────────────────────────────────────────
router.get('/question', chicorunStudentAuth, getQuestion);
router.post('/answer', chicorunStudentAuth, submitAnswer);
router.post('/reset-progress', chicorunStudentAuth, resetProgress);

// ─── 학생 내 정보 API (studentAuth 필요) ─────────────────────────────────────────
router.get('/student/me', chicorunStudentAuth, getStudentMe);
router.patch('/student/customize', chicorunStudentAuth, updateCustomize);

// ─── 교사 클래스 관리 API (teacherAuth 필요) ─────────────────────────────────────
router.post('/class', chicorunTeacherAuth, createClass);
router.get('/class', chicorunTeacherAuth, getMyClasses);
router.get('/class/:classCode/students', chicorunTeacherAuth, getClassStudents);
router.post('/class/:classCode/reset-password', chicorunTeacherAuth, resetStudentPassword);
router.patch('/class/:classCode/students/:studentId/nickname', chicorunTeacherAuth, updateStudentNickname);

// ─── 공통 랭킹 (인증 불필요 - 공개 랭킹) ──────────────────────────────────────────
router.get('/class/:classCode/ranking', getClassRanking);

export default router;

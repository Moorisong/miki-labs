import { Router } from 'express';
import { chicorunStudentAuth } from '../middlewares/chicorun-student-auth';
import { chicorunTeacherAuth } from '../middlewares/chicorun-teacher-auth';
import { getQuestion, submitAnswer, resetProgress, selectLevel, resetAchievedLevel } from '../controllers/chicorun-solve.controller';
import { studentLogin, getStudentMe, updateCustomize, changeStudentPassword, deductPoints, removeOwnedItem } from '../controllers/chicorun-student.controller';
import {
    createClass,
    getMyClasses,
    getClassStudents,
    resetStudentPassword,
    updateStudentNickname,
    getClassRanking,
    loginTeacher,
    updateClassTitle,
    deleteStudent,
    deleteClass,
} from '../controllers/chicorun-class.controller';

const router = Router();

// ─── 학생 인증 API ──────────────────────────────────────────────────────────────
router.post('/student/login', studentLogin);
router.post('/teacher/login', loginTeacher);

// ─── 학생 학습 API (studentAuth 필요) ───────────────────────────────────────────
router.get('/question', chicorunStudentAuth, getQuestion);
router.post('/answer', chicorunStudentAuth, submitAnswer);
router.post('/level', chicorunStudentAuth, selectLevel);
router.post('/reset-progress', chicorunStudentAuth, resetProgress);
router.post('/reset-achieved-level', chicorunStudentAuth, resetAchievedLevel);

// ─── 학생 내 정보 API (studentAuth 필요) ─────────────────────────────────────────
router.get('/student/me', chicorunStudentAuth, getStudentMe);
router.patch('/student/customize', chicorunStudentAuth, updateCustomize);
router.patch('/student/password', chicorunStudentAuth, changeStudentPassword);
router.patch('/student/point', chicorunStudentAuth, deductPoints);
router.delete('/student/item/:itemId', chicorunStudentAuth, removeOwnedItem);

// ─── 교사 클래스 관리 API (teacherAuth 필요) ─────────────────────────────────────
router.post('/class', chicorunTeacherAuth, createClass);
router.get('/class', chicorunTeacherAuth, getMyClasses);
router.delete('/class/:classCode', chicorunTeacherAuth, deleteClass);
router.get('/class/:classCode/students', chicorunTeacherAuth, getClassStudents);
router.patch('/class/:classCode/title', chicorunTeacherAuth, updateClassTitle);
router.post('/class/:classCode/reset-password', chicorunTeacherAuth, resetStudentPassword);
router.patch('/class/:classCode/students/:studentId/nickname', chicorunTeacherAuth, updateStudentNickname);
router.delete('/class/:classCode/students/:studentId', chicorunTeacherAuth, deleteStudent);

// ─── 공통 랭킹 (인증 불필요 - 공개 랭킹) ──────────────────────────────────────────
router.get('/class/:classCode/ranking', getClassRanking);

export default router;

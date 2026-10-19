import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { CourseManagement } from './components/CourseManagement';
import { StudentManagement } from './components/StudentManagement';
import { InstructorManagement } from './components/InstructorManagement';
import { LoginLogsViewer } from './components/LoginLogsViewer';
import { UniversityReferenceManagement } from './components/UniversityReferenceManagement';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { Footer } from './components/Footer';
import { Course, Student, InstructorAssistant, LoginRecord, University } from './types';
import { StorageService } from './data/storage';

const SESSION_DURATION_SECONDS = 15 * 60; // 15 Minutes Timeout
const SESSION_STORAGE_KEY = 'kursushub_admin_session_auth_v1';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved).username || 'admin';
    } catch {
      // ignore
    }
    return 'admin';
  });

  // Active navigation tab: 'courses' | 'students' | 'instructors' | 'logins' | 'referensi-pt'
  const [currentTab, setCurrentTab] = useState<string>('courses');

  // Selected Course
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Domain data
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<InstructorAssistant[]>([]);
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);

  // Session Timeout Countdown (15 minutes = 900 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(SESSION_DURATION_SECONDS);
  const [timeoutModalType, setTimeoutModalType] = useState<'warning' | 'expired' | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and synchronize data
  const refreshAllData = useCallback(() => {
    const status = StorageService.checkDataStatus();
    if (!status.hasData && !status.isDefaultSeeded) {
      StorageService.seedDefaultData(false);
    }

    const currentCourses = StorageService.getCourses();
    const currentStudents = StorageService.getStudents();
    const currentInstructors = StorageService.getInstructors();
    const currentLogins = StorageService.getLogins();
    const currentUniversities = StorageService.getUniversities();

    setCourses(currentCourses);
    setStudents(currentStudents);
    setInstructors(currentInstructors);
    setLogins(currentLogins);
    setUniversities(currentUniversities);

    if (currentCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(currentCourses[0].id);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    StorageService.syncWithDatabase().then(() => {
      refreshAllData();
    });
    refreshAllData();
  }, [refreshAllData]);

  // Session Timer Lifecycle (15 Minutes)
  const resetSessionTimer = useCallback(() => {
    setRemainingSeconds(SESSION_DURATION_SECONDS);
    setTimeoutModalType(null);
    const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ username: adminUsername, expiresAt, loginAt: Date.now() })
      );
    } catch {
      // ignore
    }
  }, [adminUsername]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setTimeoutModalType(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isAuthenticated) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          handleLogout();
          setTimeoutModalType('expired');
          return 0;
        }

        if (prev === 120) {
          setTimeoutModalType('warning');
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, handleLogout]);

  // Handle successful login
  const handleLoginSuccess = (username: string) => {
    setAdminUsername(username);
    setIsAuthenticated(true);
    resetSessionTimer();
    refreshAllData();
  };

  // Course Handlers
  const handleAddCourse = (courseData: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse = StorageService.addCourse(courseData);
    refreshAllData();
    setSelectedCourseId(newCourse.id);
  };

  const handleUpdateCourse = (id: string, updates: Partial<Omit<Course, 'id' | 'createdAt'>>) => {
    StorageService.updateCourse(id, updates);
    refreshAllData();
  };

  const handleDeleteCourse = (id: string) => {
    StorageService.deleteCourse(id);
    refreshAllData();
  };

  // Student Handlers
  const handleAddStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    StorageService.addStudent(studentData);
    refreshAllData();
  };

  const handleAddBatchStudents = (newStudents: Student[]) => {
    StorageService.addBatchStudents(newStudents);
    refreshAllData();
  };

  const handleDeleteStudent = (id: string) => {
    StorageService.deleteStudent(id);
    refreshAllData();
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    StorageService.updateStudent(id, updates);
    refreshAllData();
  };

  // Instructor Handlers
  const handleAddInstructor = (instructorData: Omit<InstructorAssistant, 'id' | 'createdAt'>) => {
    StorageService.addInstructor(instructorData);
    refreshAllData();
  };

  const handleUpdateInstructor = (id: string, updates: Partial<InstructorAssistant>) => {
    StorageService.updateInstructor(id, updates);
    refreshAllData();
  };

  const handleDeleteInstructor = (id: string) => {
    StorageService.deleteInstructor(id);
    refreshAllData();
  };

  // University Reference Handlers
  const handleAddUniversity = (univData: Omit<University, 'id' | 'createdAt'>) => {
    StorageService.addUniversity(univData);
    refreshAllData();
  };

  const handleUpdateUniversity = (id: string, updates: Partial<Omit<University, 'id' | 'createdAt'>>) => {
    StorageService.updateUniversity(id, updates);
    refreshAllData();
  };

  const handleDeleteUniversity = (id: string) => {
    StorageService.deleteUniversity(id);
    refreshAllData();
  };

  const handleAddFaculty = (universityId: string, facultyName: string) => {
    StorageService.addFaculty(universityId, facultyName);
    refreshAllData();
  };

  const handleDeleteFaculty = (universityId: string, facultyId: string) => {
    StorageService.deleteFaculty(universityId, facultyId);
    refreshAllData();
  };

  const handleAddStudyProgram = (universityId: string, facultyId: string, programName: string) => {
    StorageService.addStudyProgram(universityId, facultyId, programName);
    refreshAllData();
  };

  const handleDeleteStudyProgram = (universityId: string, facultyId: string, programId: string) => {
    StorageService.deleteStudyProgram(universityId, facultyId, programId);
    refreshAllData();
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          defaultAdminUser={adminUsername}
        />
        <SessionTimeoutModal
          isOpen={timeoutModalType === 'expired'}
          type="expired"
          remainingSeconds={0}
          onExtend={resetSessionTimer}
          onConfirmLogout={() => setTimeoutModalType(null)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar with Menu Referensi */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        adminUsername={adminUsername}
        onLogout={handleLogout}
        sessionRemainingSeconds={remainingSeconds}
        onExtendSession={resetSessionTimer}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'courses' && (
          <CourseManagement
            courses={courses}
            students={students}
            instructors={instructors}
            universities={universities}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onSelectCourseForStudents={(courseId) => {
              setSelectedCourseId(courseId);
              setCurrentTab('students');
            }}
          />
        )}

        {currentTab === 'students' && (
          <StudentManagement
            courses={courses}
            students={students}
            universities={universities}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            onAddStudent={handleAddStudent}
            onAddBatchStudents={handleAddBatchStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {currentTab === 'instructors' && (
          <InstructorManagement
            courses={courses}
            instructors={instructors}
            universities={universities}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            onAddInstructor={handleAddInstructor}
            onUpdateInstructor={handleUpdateInstructor}
            onDeleteInstructor={handleDeleteInstructor}
          />
        )}

        {currentTab === 'logins' && (
          <LoginLogsViewer
            courses={courses}
            logins={logins}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            onRefresh={refreshAllData}
          />
        )}

        {currentTab === 'referensi-pt' && (
          <UniversityReferenceManagement
            universities={universities}
            onAddUniversity={handleAddUniversity}
            onUpdateUniversity={handleUpdateUniversity}
            onDeleteUniversity={handleDeleteUniversity}
            onAddFaculty={handleAddFaculty}
            onDeleteFaculty={handleDeleteFaculty}
            onAddStudyProgram={handleAddStudyProgram}
            onDeleteStudyProgram={handleDeleteStudyProgram}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Session Timeout Warning Modal */}
      <SessionTimeoutModal
        isOpen={timeoutModalType !== null}
        type={timeoutModalType || 'warning'}
        remainingSeconds={remainingSeconds}
        onExtend={resetSessionTimer}
        onConfirmLogout={handleLogout}
      />
    </div>
  );
}

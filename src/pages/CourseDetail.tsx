import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Play, 
  Check, 
  Lock,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LessonQuiz from "@/components/LessonQuiz";
import CourseCertificate from "@/components/CourseCertificate";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  duration_minutes: number;
  difficulty: string;
  lessons_count: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (courseError || !courseData) {
        navigate("/courses");
        return;
      }

      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (lessonsData) {
        setLessons(lessonsData);
        if (lessonsData.length > 0) {
          setCurrentLesson(lessonsData[0]);
        }
      }

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData } = await supabase
          .from("user_course_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .eq("course_id", id);

        if (progressData) {
          setProgress(progressData);
          
          // Find first incomplete lesson
          const completedIds = progressData.filter(p => p.completed).map(p => p.lesson_id);
          const firstIncomplete = lessonsData?.find(l => !completedIds.includes(l.id));
          if (firstIncomplete) {
            setCurrentLesson(firstIncomplete);
          }
        }
      }

      setLoading(false);
    };

    fetchCourseData();
  }, [id, user, navigate]);

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = progress.filter(p => p.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isCourseCompleted = lessons.length > 0 && completedCount === lessons.length;

  const markLessonComplete = async (lessonId: string) => {
    if (!user || !course) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
      return;
    }

    const existingProgress = progress.find(p => p.lesson_id === lessonId);
    
    if (existingProgress) {
      await supabase
        .from("user_course_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
    } else {
      await supabase
        .from("user_course_progress")
        .insert({
          user_id: user.id,
          course_id: course.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
    }

    setProgress(prev => {
      const filtered = prev.filter(p => p.lesson_id !== lessonId);
      return [...filtered, { lesson_id: lessonId, completed: true }];
    });

    toast({
      title: "Lesson completed!",
      description: "Great job! Keep up the momentum.",
    });

    // Move to next lesson
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const difficultyColors = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "destructive",
  } as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">SkillForge</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-card rounded-xl overflow-hidden border border-border/50">
              {currentLesson?.video_url ? (
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a lesson to start learning</p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Lesson Info */}
            {currentLesson && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="muted" className="mb-2">
                      Lesson {lessons.findIndex(l => l.id === currentLesson.id) + 1} of {lessons.length}
                    </Badge>
                    <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                    <p className="text-muted-foreground mt-2">{currentLesson.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                    {currentLesson.duration_minutes} min
                  </div>
                </div>

                {user && !isLessonCompleted(currentLesson.id) && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => markLessonComplete(currentLesson.id)}
                  >
                    <Check className="w-5 h-5" />
                    Mark as Complete
                  </Button>
                )}

                {isLessonCompleted(currentLesson.id) && (
                  <Badge variant="success" className="text-sm py-2 px-4">
                    <Check className="w-4 h-4 mr-2" />
                    Lesson Completed
                  </Badge>
                )}

                {/* Lesson Quiz */}
                <LessonQuiz 
                  lessonId={currentLesson.id}
                  userId={user?.id || null}
                  onQuizComplete={(passed) => {
                    if (passed && !isLessonCompleted(currentLesson.id)) {
                      markLessonComplete(currentLesson.id);
                    }
                  }}
                />

                {/* Certificate */}
                {user && isCourseCompleted && (
                  <CourseCertificate
                    courseId={course.id}
                    courseTitle={course.title}
                    isCompleted={isCourseCompleted}
                    userId={user.id}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Course Info & Lessons */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800"}
                    alt={course.title}
                    className="w-20 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <Badge variant={difficultyColors[course.difficulty as keyof typeof difficultyColors]} className="mb-1">
                      {course.difficulty}
                    </Badge>
                    <h3 className="font-bold leading-tight">{course.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(course.duration_minutes)}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {lessons.length} lessons
                  </div>
                </div>

                {/* Progress */}
                {user && (
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-semibold text-primary">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} />
                    <p className="text-xs text-muted-foreground mt-2">
                      {completedCount} of {lessons.length} lessons completed
                    </p>
                  </div>
                )}

                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      Sign in to track progress
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-bold mb-4">Course Content</h4>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isCurrent = currentLesson?.id === lesson.id;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isCurrent 
                            ? "bg-primary/10 border border-primary/30" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted 
                            ? "bg-success text-success-foreground" 
                            : isCurrent 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isCurrent ? "text-primary" : ""}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration_minutes} min
                          </p>
                        </div>
                        {isCurrent && (
                          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;

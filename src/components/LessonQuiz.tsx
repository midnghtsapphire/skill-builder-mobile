import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, RotateCcw, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  passing_score: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  order_index: number;
}

interface LessonQuizProps {
  lessonId: string;
  userId: string | null;
  onQuizComplete?: (passed: boolean) => void;
}

const LessonQuiz = ({ lessonId, userId, onQuizComplete }: LessonQuizProps) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousResult, setPreviousResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      // Fetch quiz for this lesson
      const { data: quizData } = await supabase
        .from("lesson_quizzes")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (!quizData) {
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("order_index", { ascending: true });

      if (questionsData) {
        // Parse options from JSONB
        const parsedQuestions = questionsData.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        setQuestions(parsedQuestions);
      }

      // Check if user has previous result
      if (userId) {
        const { data: resultData } = await supabase
          .from("quiz_results")
          .select("score, passed")
          .eq("user_id", userId)
          .eq("quiz_id", quizData.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (resultData) {
          setPreviousResult(resultData);
        }
      }

      setLoading(false);
    };

    fetchQuiz();
  }, [lessonId, userId]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_option) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const hasPassed = scorePercent >= quiz.passing_score;

    setScore(scorePercent);
    setPassed(hasPassed);
    setShowResults(true);

    // Save results to database
    if (userId) {
      await supabase.from("quiz_results").insert({
        user_id: userId,
        quiz_id: quiz.id,
        score: scorePercent,
        passed: hasPassed,
        answers: selectedAnswers
      });
    }

    onQuizComplete?.(hasPassed);

    toast({
      title: hasPassed ? "Congratulations!" : "Keep Learning!",
      description: hasPassed 
        ? `You passed with ${scorePercent}%!` 
        : `You scored ${scorePercent}%. You need ${quiz.passing_score}% to pass.`,
      variant: hasPassed ? "default" : "destructive",
    });
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setPassed(false);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setPreviousResult(null);
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground animate-pulse">
            Loading quiz...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz || questions.length === 0) {
    return null;
  }

  // Show previous result if exists and quiz not started
  if (previousResult && !quizStarted) {
    return (
      <Card className="mt-6 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Lesson Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
              previousResult.passed ? "bg-success/20" : "bg-destructive/20"
            )}>
              {previousResult.passed ? (
                <CheckCircle className="w-10 h-10 text-success" />
              ) : (
                <XCircle className="w-10 h-10 text-destructive" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {previousResult.passed ? "You passed this quiz!" : "Previous attempt"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Your best score: <span className="font-semibold">{previousResult.score}%</span>
            </p>
            <Button onClick={handleStartQuiz} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show start quiz screen
  if (!quizStarted && !previousResult) {
    return (
      <Card className="mt-6 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">
              Test your knowledge with {questions.length} questions
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You need {quiz.passing_score}% to pass
            </p>
            {userId ? (
              <Button onClick={handleStartQuiz} variant="hero">
                Start Quiz
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sign in to take the quiz and track your progress
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (showResults) {
    return (
      <Card className="mt-6 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
              passed ? "bg-success/20" : "bg-destructive/20"
            )}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {passed ? "Congratulations!" : "Keep Learning!"}
            </h3>
            <p className="text-4xl font-bold mb-2" style={{ color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              {score}%
            </p>
            <p className="text-muted-foreground mb-6">
              {passed 
                ? "You've passed this lesson quiz!" 
                : `You need ${quiz.passing_score}% to pass. Review the lesson and try again.`
              }
            </p>

            {/* Show correct/incorrect breakdown */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Correct Answers</p>
                  <p className="text-2xl font-bold text-success">
                    {questions.filter(q => selectedAnswers[q.id] === q.correct_option).length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
              </div>
            </div>

            <Button onClick={handleRetry} variant={passed ? "outline" : "hero"}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {passed ? "Retake Quiz" : "Try Again"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show current question
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <Card className="mt-6 border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {quiz.title}
          </CardTitle>
          <Badge variant="muted">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(currentQuestion.id, index)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                selectedAnswers[currentQuestion.id] === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                  selectedAnswers[currentQuestion.id] === index
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                )}>
                  {selectedAnswers[currentQuestion.id] === index && (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          {isLastQuestion ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!hasAnswered}
              variant="hero"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={!hasAnswered}
            >
              Next Question
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonQuiz;
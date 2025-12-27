-- Create lesson quizzes table
CREATE TABLE public.lesson_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz results table
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Quizzes viewable by everyone (tied to published courses via lessons)
CREATE POLICY "Quizzes are viewable for published course lessons"
ON public.lesson_quizzes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_lessons cl
    JOIN public.courses c ON c.id = cl.course_id
    WHERE cl.id = lesson_quizzes.lesson_id AND c.is_published = true
  )
);

-- Questions viewable for accessible quizzes
CREATE POLICY "Questions are viewable for accessible quizzes"
ON public.quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lesson_quizzes lq
    JOIN public.course_lessons cl ON cl.id = lq.lesson_id
    JOIN public.courses c ON c.id = cl.course_id
    WHERE lq.id = quiz_questions.quiz_id AND c.is_published = true
  )
);

-- Users can view their own quiz results
CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own quiz results
CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert sample quiz data for existing lessons
INSERT INTO public.lesson_quizzes (lesson_id, title, passing_score)
SELECT id, 'Lesson Quiz', 70
FROM public.course_lessons;

-- Insert sample questions for each quiz
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_option, order_index)
SELECT 
  lq.id,
  'What is the most important safety consideration discussed in this lesson?',
  '["Following manufacturer guidelines", "Working as fast as possible", "Skipping safety checks when experienced", "Using any available tools"]'::jsonb,
  0,
  0
FROM public.lesson_quizzes lq;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_option, order_index)
SELECT 
  lq.id,
  'Before starting any work, you should always:',
  '["Begin immediately to save time", "Check equipment and review procedures", "Assume everything is working", "Skip the preparation phase"]'::jsonb,
  1,
  1
FROM public.lesson_quizzes lq;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_option, order_index)
SELECT 
  lq.id,
  'What should you do if you encounter an unexpected issue?',
  '["Ignore it and continue", "Stop and assess the situation", "Work around it quickly", "Leave it for someone else"]'::jsonb,
  1,
  2
FROM public.lesson_quizzes lq;
-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  lessons_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Courses are publicly readable when published
CREATE POLICY "Published courses are viewable by everyone"
ON public.courses
FOR SELECT
USING (is_published = true);

-- Course lessons are viewable for published courses
CREATE POLICY "Lessons for published courses are viewable"
ON public.course_lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_lessons.course_id 
    AND courses.is_published = true
  )
);

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.user_course_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
ON public.user_course_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON public.user_course_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON public.course_lessons(course_id, order_index);
CREATE INDEX idx_user_progress_user_course ON public.user_course_progress(user_id, course_id);

-- Trigger for courses updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses
INSERT INTO public.courses (title, description, category, thumbnail_url, duration_minutes, difficulty, lessons_count, is_published) VALUES
('Copper Pipe Soldering Fundamentals', 'Learn the essential techniques for soldering copper pipes safely and effectively. Perfect for apprentices and DIY enthusiasts.', 'Plumbing', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 45, 'Beginner', 5, true),
('Reading Electrical Blueprints', 'Master the skill of reading and interpreting electrical blueprints and schematics. Essential for any electrician.', 'Electrical', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 90, 'Intermediate', 8, true),
('HVAC System Diagnostics', 'Learn to diagnose common HVAC problems using professional techniques and tools.', 'HVAC', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', 120, 'Advanced', 10, true),
('Drywall Installation Basics', 'Complete guide to measuring, cutting, and installing drywall like a professional.', 'Construction', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', 60, 'Beginner', 6, true),
('Welding Safety & Techniques', 'Comprehensive welding course covering safety protocols and fundamental welding techniques.', 'Manufacturing', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800', 150, 'Intermediate', 12, true),
('PEX Plumbing Installation', 'Modern plumbing with PEX tubing - installation, connections, and best practices.', 'Plumbing', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', 55, 'Beginner', 7, true);

-- Insert sample lessons for the first course (Copper Pipe Soldering)
INSERT INTO public.course_lessons (course_id, title, description, video_url, duration_minutes, order_index)
SELECT 
  c.id,
  lesson.title,
  lesson.description,
  lesson.video_url,
  lesson.duration,
  lesson.idx
FROM public.courses c
CROSS JOIN (VALUES
  (1, 'Introduction to Copper Soldering', 'Overview of tools, materials, and safety requirements', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 8),
  (2, 'Preparing the Copper Surface', 'How to properly clean and prepare copper for soldering', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10),
  (3, 'Applying Flux Correctly', 'Understanding flux types and application techniques', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 7),
  (4, 'Heating and Applying Solder', 'The technique for a perfect solder joint', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 12),
  (5, 'Testing and Troubleshooting', 'How to test joints and fix common problems', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 8)
) AS lesson(idx, title, description, video_url, duration)
WHERE c.title = 'Copper Pipe Soldering Fundamentals';

-- Insert sample lessons for Electrical Blueprints course
INSERT INTO public.course_lessons (course_id, title, description, video_url, duration_minutes, order_index)
SELECT 
  c.id,
  lesson.title,
  lesson.description,
  lesson.video_url,
  lesson.duration,
  lesson.idx
FROM public.courses c
CROSS JOIN (VALUES
  (1, 'Blueprint Basics', 'Understanding scale, symbols, and legend', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 12),
  (2, 'Electrical Symbols Guide', 'Complete guide to electrical symbols used in blueprints', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 15),
  (3, 'Circuit Layouts', 'Reading and understanding circuit layouts', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10),
  (4, 'Panel Schedules', 'How to read panel schedules and load calculations', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 12),
  (5, 'Wiring Diagrams', 'Interpreting wiring diagrams and connections', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 11),
  (6, 'Branch Circuits', 'Understanding branch circuit layouts', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10),
  (7, 'Conduit Routing', 'Reading conduit paths and sizing', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10),
  (8, 'Final Project', 'Complete blueprint reading exercise', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10)
) AS lesson(idx, title, description, video_url, duration)
WHERE c.title = 'Reading Electrical Blueprints';
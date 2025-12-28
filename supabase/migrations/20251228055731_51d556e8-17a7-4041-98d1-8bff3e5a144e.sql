-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'member');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  invited_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_assignments table
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  UNIQUE (team_id, course_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is team owner or manager
CREATE OR REPLACE FUNCTION public.is_team_manager(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams WHERE id = _team_id AND owner_id = _user_id
  ) OR public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'manager')
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for teams
CREATE POLICY "Team owners can view their teams"
ON public.teams FOR SELECT
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
ON public.teams FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
ON public.teams FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Team managers can view team members"
ON public.team_members FOR SELECT
USING (public.is_team_manager(auth.uid(), team_id) OR auth.uid() = user_id);

CREATE POLICY "Team managers can add team members"
ON public.team_members FOR INSERT
WITH CHECK (public.is_team_manager(auth.uid(), team_id));

CREATE POLICY "Team managers can update team members"
ON public.team_members FOR UPDATE
USING (public.is_team_manager(auth.uid(), team_id));

CREATE POLICY "Team managers can remove team members"
ON public.team_members FOR DELETE
USING (public.is_team_manager(auth.uid(), team_id));

-- RLS Policies for course_assignments
CREATE POLICY "Team managers can view assignments"
ON public.course_assignments FOR SELECT
USING (public.is_team_manager(auth.uid(), team_id));

CREATE POLICY "Team managers can create assignments"
ON public.course_assignments FOR INSERT
WITH CHECK (public.is_team_manager(auth.uid(), team_id));

CREATE POLICY "Team managers can update assignments"
ON public.course_assignments FOR UPDATE
USING (public.is_team_manager(auth.uid(), team_id));

CREATE POLICY "Team managers can delete assignments"
ON public.course_assignments FOR DELETE
USING (public.is_team_manager(auth.uid(), team_id));

-- Trigger for teams updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Grant manager role to existing users who create teams (auto-assign)
CREATE OR REPLACE FUNCTION public.auto_assign_manager_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.owner_id, 'manager')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created_assign_manager
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_manager_role();
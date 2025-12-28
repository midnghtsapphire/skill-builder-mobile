import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Clock, BarChart } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  owner_id: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_minutes: number;
  lessons_count: number;
}

interface Assignment {
  id: string;
  course_id: string;
  team_id: string;
  assigned_at: string;
}

interface CourseAssignmentsProps {
  team: Team;
}

const CourseAssignments = ({ team }: CourseAssignmentsProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [team.id]);

  const fetchData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        supabase.from("courses").select("*").eq("is_published", true),
        supabase.from("course_assignments").select("*").eq("team_id", team.id),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setCourses(coursesRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (courseId: string) => {
    return assignments.some((a) => a.course_id === courseId);
  };

  const handleToggleAssignment = async (courseId: string) => {
    if (!user) return;

    setSaving(courseId);
    try {
      if (isAssigned(courseId)) {
        // Remove assignment
        const { error } = await supabase
          .from("course_assignments")
          .delete()
          .eq("team_id", team.id)
          .eq("course_id", courseId);

        if (error) throw error;

        setAssignments(assignments.filter((a) => a.course_id !== courseId));
        toast.success("Course unassigned from team");
      } else {
        // Add assignment
        const { data, error } = await supabase
          .from("course_assignments")
          .insert({
            team_id: team.id,
            course_id: courseId,
            assigned_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        setAssignments([...assignments, data]);
        toast.success("Course assigned to team");
      }
    } catch (error: any) {
      console.error("Error toggling assignment:", error);
      toast.error(error.message || "Failed to update assignment");
    } finally {
      setSaving(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading courses...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Courses</CardTitle>
        <CardDescription>
          Select courses to assign to your team. Members will see these in their dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No courses available.</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  isAssigned(course.id)
                    ? "bg-primary/5 border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={isAssigned(course.id)}
                  onCheckedChange={() => handleToggleAssignment(course.id)}
                  disabled={saving === course.id}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{course.title}</h3>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      {course.lessons_count} lessons
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {assignments.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>{assignments.length}</strong> course{assignments.length !== 1 ? "s" : ""} assigned to this team
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseAssignments;

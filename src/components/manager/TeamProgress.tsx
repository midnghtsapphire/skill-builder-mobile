import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, CheckCircle2, Clock, Award } from "lucide-react";

interface Team {
  id: string;
  name: string;
  owner_id: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  invited_email: string | null;
  status: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

interface CourseProgress {
  course_id: string;
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
  has_certificate: boolean;
}

interface MemberProgress {
  member: TeamMember;
  courses: CourseProgress[];
  totalCompleted: number;
  totalAssigned: number;
}

interface TeamProgressProps {
  team: Team;
}

const TeamProgress = ({ team }: TeamProgressProps) => {
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    avgCompletion: 0,
    totalCertificates: 0,
  });

  useEffect(() => {
    fetchProgress();
  }, [team.id]);

  const fetchProgress = async () => {
    try {
      // Fetch team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Fetch assigned courses
      const { data: assignments, error: assignmentsError } = await supabase
        .from("course_assignments")
        .select("course_id, courses(id, title, lessons_count)")
        .eq("team_id", team.id);

      if (assignmentsError) throw assignmentsError;

      // Process each member
      const progressData: MemberProgress[] = await Promise.all(
        (members || []).map(async (member) => {
          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", member.user_id)
            .single();

          // Get progress for each assigned course
          const courses: CourseProgress[] = await Promise.all(
            (assignments || []).map(async (assignment: any) => {
              const course = assignment.courses;
              
              // Get completed lessons count
              const { count: completedCount } = await supabase
                .from("user_course_progress")
                .select("*", { count: "exact", head: true })
                .eq("user_id", member.user_id)
                .eq("course_id", course.id)
                .eq("completed", true);

              // Check for certificate
              const { data: cert } = await supabase
                .from("certificates")
                .select("id")
                .eq("user_id", member.user_id)
                .eq("course_id", course.id)
                .single();

              return {
                course_id: course.id,
                course_title: course.title,
                total_lessons: course.lessons_count,
                completed_lessons: completedCount || 0,
                has_certificate: !!cert,
              };
            })
          );

          const totalCompleted = courses.filter(
            (c) => c.completed_lessons === c.total_lessons && c.total_lessons > 0
          ).length;

          return {
            member: { ...member, profile },
            courses,
            totalCompleted,
            totalAssigned: courses.length,
          };
        })
      );

      setMemberProgress(progressData);

      // Calculate stats
      const totalCerts = progressData.reduce(
        (acc, mp) => acc + mp.courses.filter((c) => c.has_certificate).length,
        0
      );
      const avgCompletion =
        progressData.length > 0
          ? progressData.reduce((acc, mp) => {
              const memberAvg =
                mp.courses.length > 0
                  ? mp.courses.reduce(
                      (sum, c) =>
                        sum + (c.total_lessons > 0 ? (c.completed_lessons / c.total_lessons) * 100 : 0),
                      0
                    ) / mp.courses.length
                  : 0;
              return acc + memberAvg;
            }, 0) / progressData.length
          : 0;

      setStats({
        totalMembers: progressData.length,
        avgCompletion: Math.round(avgCompletion),
        totalCertificates: totalCerts,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading progress data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-sm text-muted-foreground">Certificates Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Progress Report</CardTitle>
          <CardDescription>
            Track each team member's progress through assigned courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberProgress.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active members with assigned courses.</p>
              <p className="text-sm text-muted-foreground">
                Add team members and assign courses to see progress.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Courses Progress</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Certificates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberProgress.map((mp) => (
                  <TableRow key={mp.member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {mp.member.profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {mp.member.profile?.email || mp.member.invited_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 max-w-md">
                        {mp.courses.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No courses assigned</span>
                        ) : (
                          mp.courses.slice(0, 3).map((course) => (
                            <div key={course.course_id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="truncate max-w-[200px]">{course.course_title}</span>
                                <span className="text-muted-foreground">
                                  {course.completed_lessons}/{course.total_lessons}
                                </span>
                              </div>
                              <Progress
                                value={
                                  course.total_lessons > 0
                                    ? (course.completed_lessons / course.total_lessons) * 100
                                    : 0
                                }
                                className="h-1.5"
                              />
                            </div>
                          ))
                        )}
                        {mp.courses.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{mp.courses.length - 3} more courses
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={mp.totalCompleted > 0 ? "default" : "secondary"}>
                        {mp.totalCompleted}/{mp.totalAssigned}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {mp.courses.filter((c) => c.has_certificate).length > 0 ? (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Award className="h-3 w-3 mr-1" />
                          {mp.courses.filter((c) => c.has_certificate).length}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamProgress;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  LogOut, 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  Play,
  ChevronRight,
  User,
  Users
} from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  trade_specialty: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    if (user) {
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Learner";

  // Mock data for demonstration
  const stats = {
    coursesInProgress: 3,
    coursesCompleted: 12,
    totalHours: 45,
    certificates: 8,
  };

  const inProgressCourses = [
    {
      id: 1,
      title: "Copper Pipe Soldering Fundamentals",
      category: "Plumbing",
      progress: 65,
      nextLesson: "Flux Application Techniques",
    },
    {
      id: 2,
      title: "HVAC System Diagnostics",
      category: "HVAC",
      progress: 30,
      nextLesson: "Reading Pressure Gauges",
    },
    {
      id: 3,
      title: "Electrical Code Updates 2024",
      category: "Electrical",
      progress: 15,
      nextLesson: "Ground Fault Protection",
    },
  ];

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

            <div className="flex items-center gap-4">
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground">
            Pick up where you left off or explore new courses.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.coursesInProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.certificates}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <Link to="/#courses">
              <Button variant="ghost" size="sm">
                Browse All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {inProgressCourses.map((course) => (
              <Card key={course.id} className="group cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <Badge variant="muted" className="w-fit mb-2">
                    {course.category}
                  </Badge>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-primary">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Next:</p>
                      <p className="font-medium">{course.nextLesson}</p>
                    </div>
                    <Button size="icon" variant="default" className="rounded-full">
                      <Play className="w-4 h-4 ml-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/courses" className="w-full">
              <Button variant="secondary" className="h-auto py-6 flex-col gap-2 w-full">
                <BookOpen className="w-6 h-6" />
                Browse Courses
              </Button>
            </Link>
            <Button variant="secondary" className="h-auto py-6 flex-col gap-2">
              <Award className="w-6 h-6" />
              View Certificates
            </Button>
            <Button variant="secondary" className="h-auto py-6 flex-col gap-2">
              <Clock className="w-6 h-6" />
              My Checklists
            </Button>
            <Link to="/manager" className="w-full">
              <Button variant="secondary" className="h-auto py-6 flex-col gap-2 w-full">
                <Users className="w-6 h-6" />
                Manager Dashboard
              </Button>
            </Link>
            <Link to="/profile" className="w-full">
              <Button variant="secondary" className="h-auto py-6 flex-col gap-2 w-full">
                <User className="w-6 h-6" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart3, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import TeamManagement from "@/components/manager/TeamManagement";
import CourseAssignments from "@/components/manager/CourseAssignments";
import TeamProgress from "@/components/manager/TeamProgress";
import CreateTeamDialog from "@/components/manager/CreateTeamDialog";

interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

const ManagerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeams(data || []);
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams([newTeam, ...teams]);
    setSelectedTeam(newTeam);
    toast.success("Team created successfully!");
  };

  if (loading || loadingTeams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
              <p className="text-muted-foreground">Manage your teams and track progress</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Teams Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first team to start managing your workforce training.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Team Selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Your Teams</CardTitle>
                <CardDescription>Select a team to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {teams.map((team) => (
                  <Button
                    key={team.id}
                    variant={selectedTeam?.id === team.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {team.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedTeam && (
                <Tabs defaultValue="members" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="members" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Assign Courses
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Progress Reports
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="members">
                    <TeamManagement team={selectedTeam} />
                  </TabsContent>

                  <TabsContent value="courses">
                    <CourseAssignments team={selectedTeam} />
                  </TabsContent>

                  <TabsContent value="progress">
                    <TeamProgress team={selectedTeam} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default ManagerDashboard;

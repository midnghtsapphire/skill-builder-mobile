import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

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
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

interface TeamManagementProps {
  team: Team;
}

const TeamManagement = ({ team }: TeamManagementProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [team.id]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for active members
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          if (member.user_id && member.status === "active") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", member.user_id)
              .single();
            return { ...member, profile };
          }
          return member;
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) return;

    setIsAdding(true);
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email.trim())
        .single();

      const { error } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: existingUser?.id || "00000000-0000-0000-0000-000000000000",
        invited_email: email.trim(),
        status: existingUser ? "active" : "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This member is already in the team");
          return;
        }
        throw error;
      }

      toast.success(
        existingUser
          ? "Member added to team!"
          : "Invitation sent! They'll join when they sign up."
      );
      setEmail("");
      fetchMembers();
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast.error(error.message || "Failed to invite member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("Member removed from team");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Add team members by email. They'll be able to access assigned courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Member Form */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <Button onClick={handleInvite} disabled={!email.trim() || isAdding}>
            <UserPlus className="h-4 w-4 mr-2" />
            {isAdding ? "Adding..." : "Add Member"}
          </Button>
        </div>

        {/* Members List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No team members yet.</p>
            <p className="text-sm text-muted-foreground">Add members by email to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.profile?.full_name || "—"}
                  </TableCell>
                  <TableCell>{member.profile?.email || member.invited_email}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamManagement;

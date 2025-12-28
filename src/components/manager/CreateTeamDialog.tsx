import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (team: { id: string; name: string; owner_id: string; created_at: string }) => void;
}

const CreateTeamDialog = ({ open, onOpenChange, onTeamCreated }: CreateTeamDialogProps) => {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!teamName.trim() || !user) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: teamName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      onTeamCreated(data);
      setTeamName("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a team to manage your employees' training and track their progress.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="e.g., Construction Crew A"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!teamName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;

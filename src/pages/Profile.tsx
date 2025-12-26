import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, ArrowLeft, Save, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  trade_specialty: string | null;
  avatar_url: string | null;
}

const TRADE_OPTIONS = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Construction",
  "Manufacturing",
  "Welding",
  "Carpentry",
  "Masonry",
  "Roofing",
  "Other",
];

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [tradeSpecialty, setTradeSpecialty] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setCompany(data.company || "");
          setTradeSpecialty(data.trade_specialty || "");
        }
        setLoadingProfile(false);
      }
    };

    if (user) {
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        company: company.trim(),
        trade_specialty: tradeSpecialty,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    }

    setSaving(false);
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {fullName ? fullName[0].toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <div>
                <CardTitle className="text-2xl">Your Profile</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade">Trade Specialty</Label>
                <Select value={tradeSpecialty} onValueChange={setTradeSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_OPTIONS.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Profile;

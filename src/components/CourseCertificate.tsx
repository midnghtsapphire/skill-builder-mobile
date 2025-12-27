import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseCertificateProps {
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
  userId: string;
}

const CourseCertificate = ({ courseId, courseTitle, isCompleted, userId }: CourseCertificateProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to download your certificate.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("generate-certificate", {
        body: { courseId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate certificate");
      }

      // The response data is the PDF blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SkillForge-Certificate-${courseTitle.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Certificate downloaded!",
        description: "Your certificate has been saved.",
      });
    } catch (error) {
      console.error("Certificate download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not generate certificate.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <Card className="border-2 border-success/30 bg-success/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Course Completed!</h3>
            <p className="text-sm text-muted-foreground">
              Congratulations! Download your certificate of completion.
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            variant="hero"
            className="shrink-0"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {downloading ? "Generating..." : "Download Certificate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCertificate;
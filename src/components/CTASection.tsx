import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 md:py-28 bg-gradient-dark relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
            Ready to Build a <span className="text-gradient">Better Workforce?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Start your free 14-day trial today. No credit card required. See the difference skilled training makes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button variant="outline" size="xl">
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Join 10,000+ professionals already training with SkillForge
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

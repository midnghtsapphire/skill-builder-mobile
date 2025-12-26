import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-worker.jpg";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Construction worker using tablet for training on job site"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            {/* Badge */}
            <Badge variant="outline" className="mb-6 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
              Now Training 10,000+ Trade Professionals
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up animation-delay-100">
              Master Your Trade,{" "}
              <span className="text-gradient">One Skill at a Time</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed animate-slide-up animation-delay-200">
              Bite-sized video training built for the job site. Learn plumbing, electrical, HVAC, and more—right from your phone.
            </p>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up animation-delay-300">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>5-10 min lessons</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Offline access</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Earn certificates</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="hero" size="lg">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="lg">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 pt-8 border-t border-border/30 animate-slide-up animation-delay-500">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-gradient">500+</div>
                  <div className="text-sm text-muted-foreground">Video Modules</div>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div>
                  <div className="text-3xl font-bold text-gradient">98%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div>
                  <div className="text-3xl font-bold text-gradient">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - empty for the background image to show */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

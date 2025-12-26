import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Video, 
  CheckSquare, 
  Award, 
  Users, 
  BarChart3,
  Wifi,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Bite-Sized Videos",
    description: "5-10 minute modules that fit between tasks. Learn without disrupting your workflow.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Built for job sites. Large buttons, clear visuals, works with gloves on.",
  },
  {
    icon: Wifi,
    title: "Offline Access",
    description: "Download lessons before heading to the site. No internet? No problem.",
  },
  {
    icon: CheckSquare,
    title: "Interactive Checklists",
    description: "Digital task checklists you can use right on the job. Never miss a step.",
  },
  {
    icon: Award,
    title: "Earn Certificates",
    description: "Get verified credentials for completed modules. Show your skills to employers.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "See your learning journey. Pick up exactly where you left off.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Assign courses to your crew. Monitor progress with the manager dashboard.",
  },
  {
    icon: Shield,
    title: "Safety Compliant",
    description: "Modules aligned with OSHA guidelines and industry safety standards.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Training That Works <span className="text-gradient">Where You Work</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Designed by tradespeople, for tradespeople. Every feature built with the job site in mind.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group text-center hover:border-primary/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

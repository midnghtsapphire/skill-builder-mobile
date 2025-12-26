import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Building2, Users, Briefcase } from "lucide-react";

const plans = [
  {
    name: "Solo",
    description: "For individual tradespeople",
    price: 19,
    icon: Briefcase,
    features: [
      "Unlimited course access",
      "Offline downloads",
      "Progress tracking",
      "Certificates of completion",
      "Mobile app access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Team",
    description: "For small crews (up to 25)",
    price: 25,
    priceNote: "per user",
    icon: Users,
    features: [
      "Everything in Solo",
      "Manager dashboard",
      "Assign courses to team",
      "Team progress reports",
      "Priority support",
      "Custom onboarding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: null,
    icon: Building2,
    features: [
      "Everything in Team",
      "Unlimited users",
      "Custom content creation",
      "API integrations",
      "Dedicated account manager",
      "SSO & advanced security",
      "On-site training support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Invest in Your <span className="text-gradient">Crew's Skills</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Better trained workers make fewer mistakes and work faster. The ROI speaks for itself.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative animate-slide-up ${
                plan.popular ? "border-primary shadow-glow scale-105 z-10" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-0">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-secondary flex items-center justify-center">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="text-center pt-6">
                {plan.price ? (
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.priceNote && (
                      <p className="text-sm text-muted-foreground mt-1">{plan.priceNote}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="text-3xl font-bold">Custom</span>
                    <p className="text-sm text-muted-foreground mt-1">Tailored to your needs</p>
                  </div>
                )}

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            🛡️ 14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

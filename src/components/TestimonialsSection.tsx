import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "My apprentices are learning faster than ever. The short videos fit perfectly between tasks on the job site.",
    author: "Mike Rodriguez",
    role: "Master Plumber, 25 years experience",
    company: "Rodriguez Plumbing Co.",
    rating: 5,
  },
  {
    quote: "Finally, training that doesn't require sitting in a classroom for 8 hours. My crew actually uses this.",
    author: "Sarah Chen",
    role: "Operations Manager",
    company: "Chen Electric",
    rating: 5,
  },
  {
    quote: "The offline mode is a game-changer. We work in areas with no cell service and the training still works.",
    author: "James Okonkwo",
    role: "HVAC Technician",
    company: "CoolAir Systems",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Trusted by <span className="text-gradient">Trade Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what industry leaders are saying about SkillForge.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.author}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

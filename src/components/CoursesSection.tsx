import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const courses = [
  {
    title: "Copper Pipe Soldering Fundamentals",
    category: "Plumbing",
    duration: "45 min",
    lessons: 8,
    progress: 65,
    thumbnail: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=60",
    isNew: false,
    difficulty: "Beginner" as const,
  },
  {
    title: "Reading Electrical Blueprints",
    category: "Electrical",
    duration: "1.5 hrs",
    lessons: 12,
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60",
    isNew: true,
    difficulty: "Intermediate" as const,
  },
  {
    title: "HVAC System Diagnostics",
    category: "HVAC",
    duration: "2 hrs",
    lessons: 15,
    progress: 30,
    thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=60",
    isNew: false,
    difficulty: "Advanced" as const,
  },
  {
    title: "Drywall Installation Basics",
    category: "Construction",
    duration: "1 hr",
    lessons: 10,
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60",
    isNew: true,
    difficulty: "Beginner" as const,
  },
  {
    title: "Welding Safety & Techniques",
    category: "Manufacturing",
    duration: "2.5 hrs",
    lessons: 18,
    thumbnail: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60",
    isNew: false,
    difficulty: "Intermediate" as const,
  },
  {
    title: "PEX Plumbing Installation",
    category: "Plumbing",
    duration: "55 min",
    lessons: 9,
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
    isNew: false,
    difficulty: "Beginner" as const,
  },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="py-20 md:py-28 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Learn Skills That <span className="text-gradient">Pay the Bills</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Practical, hands-on training modules created by master tradespeople. Pick up where you left off, anytime.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["All Courses", "Plumbing", "Electrical", "HVAC", "Construction", "Manufacturing"].map((tab, i) => (
            <Button
              key={tab}
              variant={i === 0 ? "default" : "secondary"}
              size="sm"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Browse All 500+ Courses
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

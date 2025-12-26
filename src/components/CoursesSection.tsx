import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  duration_minutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons_count: number;
}

const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Courses");

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setCourses(data as Course[]);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const categories = ["All Courses", ...new Set(courses.map((c) => c.category))];
  
  const filteredCourses = selectedCategory === "All Courses" 
    ? courses 
    : courses.filter((c) => c.category === selectedCategory);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
          {categories.map((tab) => (
            <Button
              key={tab}
              variant={selectedCategory === tab ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-xl" />
                <div className="p-5 bg-card rounded-b-xl space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredCourses.map((course, index) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="animate-slide-up block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CourseCard
                  title={course.title}
                  category={course.category}
                  duration={formatDuration(course.duration_minutes)}
                  lessons={course.lessons_count}
                  thumbnail={course.thumbnail_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800"}
                  difficulty={course.difficulty}
                />
              </Link>
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link to="/courses">
            <Button variant="outline" size="lg">
              Browse All Courses
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

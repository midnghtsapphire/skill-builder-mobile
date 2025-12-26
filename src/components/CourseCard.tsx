import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Play, BookOpen, Award } from "lucide-react";

interface CourseCardProps {
  title: string;
  category: string;
  duration: string;
  lessons: number;
  progress?: number;
  thumbnail: string;
  isNew?: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const CourseCard = ({
  title,
  category,
  duration,
  lessons,
  progress,
  thumbnail,
  isNew,
  difficulty,
}: CourseCardProps) => {
  const difficultyColors = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "destructive",
  } as const;

  return (
    <Card className="group overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={`${title} course thumbnail`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && <Badge variant="default">New</Badge>}
          <Badge variant={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <Badge variant="muted" className="w-fit mb-2">
          {category}
        </Badge>
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {lessons} lessons
          </div>
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="secondary" className="w-full">
          {progress !== undefined ? "Continue Learning" : "Start Course"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

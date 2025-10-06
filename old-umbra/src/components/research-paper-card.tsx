import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, User, Calendar, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  date: string;
  summary: string;
  tags: string[];
  isSaved: boolean;
}

interface ResearchPaperCardProps {
  paper: ResearchPaper;
  onSave: (id: string) => void;
}

export function ResearchPaperCard({ paper, onSave }: ResearchPaperCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold leading-tight flex-1">{paper.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onSave(paper.id)}
            title={paper.isSaved ? "Unsave paper" : "Save paper"}
          >
            <Bookmark className={`${paper.isSaved ? 'fill-blue-500 text-blue-500' : 'text-gray-400'} h-5 w-5 transition-colors`} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {paper.tags.map((tag, index) => (
            <span 
              key={index} 
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{paper.summary}</p>
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1 shrink-0" />
            <span className="truncate">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1 shrink-0" />
            <span>{paper.date}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center pt-3 border-t">
        <Button variant="outline" size="sm" className="gap-1">
          <BookOpen className="h-4 w-4" />
          Read Paper
        </Button>
      </CardFooter>
    </Card>
  );
}
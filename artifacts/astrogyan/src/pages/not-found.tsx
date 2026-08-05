import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-serif text-primary">404</h1>
        <h2 className="text-2xl font-serif text-foreground/80">Page Not Found</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          The stars indicate this path doesn't exist. Let's guide you back to familiar grounds.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-8 border-primary/50 text-primary">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

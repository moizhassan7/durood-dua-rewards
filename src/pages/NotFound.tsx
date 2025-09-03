import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";
import islamicHeroBg from "@/assets/islamic-hero-bg.jpg";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${islamicHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="card-islamic max-w-md w-full text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="w-full h-full text-destructive" />
            </div>
            <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
            <p className="text-xl text-muted-foreground arabic">
              صفحہ موجود نہیں
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground arabic">
              آپ جو صفحہ تلاش کر رہے ہیں وہ دستیاب نہیں ہے
            </p>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="btn-islamic w-full"
            >
              <Home className="w-5 h-5 ml-2" />
              <span className="arabic">واپس ہوم</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;

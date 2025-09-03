import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import islamicHeroBg from '@/assets/islamic-hero-bg.jpg';
import prayerBeads from '@/assets/prayer-beads.jpg';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to home page
      window.location.href = '/';
    }, 1500);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${islamicHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/50 to-primary/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="card-islamic backdrop-blur-md bg-card/95 border-2 border-primary/20 shadow-islamic">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-islamic p-3 shadow-glow">
                <img src={prayerBeads} alt="Prayer beads" className="w-full h-full object-cover rounded-full" />
              </div>
              <CardTitle className="text-2xl font-bold arabic text-primary">
                {isSignup ? 'نیا اکاؤنٹ بنائیں' : 'واپس آئیں'}
              </CardTitle>
              <p className="text-muted-foreground arabic">
                {isSignup 
                  ? 'درود پڑھنے کا سفر شروع کریں' 
                  : 'اپنے اکاؤنٹ میں لاگ اِن کریں'
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name - Only for signup */}
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="arabic text-right block">
                      مکمل نام
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="آپ کا نام درج کریں"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pr-10 text-right arabic"
                        required={isSignup}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="arabic text-right block">
                    ای میل ایڈریس
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pr-10 ltr text-left"
                      dir="ltr"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="arabic text-right block">
                    پاس ورڈ
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10 pl-10 ltr text-left"
                      dir="ltr"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for signup */}
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="arabic text-right block">
                      پاس ورڈ کی تصدیق
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pr-10 ltr text-left"
                        dir="ltr"
                        required={isSignup}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-islamic text-lg h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span className="arabic">براہ کرم انتظار کریں...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                      <span className="arabic">
                        {isSignup ? 'اکاؤنٹ بنائیں' : 'لاگ اِن کریں'}
                      </span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Separator */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-sm text-muted-foreground arabic">
                    یا
                  </span>
                </div>
              </div>

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground arabic mb-2">
                  {isSignup 
                    ? 'پہلے سے اکاؤنٹ موجود ہے؟' 
                    : 'نیا صارف ہیں؟'
                  }
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleMode}
                  className="text-primary hover:text-primary-glow arabic font-semibold"
                >
                  {isSignup ? 'لاگ اِن کریں' : 'نیا اکاؤنٹ بنائیں'}
                </Button>
              </div>

              {/* Demo Notice */}
              <div className="text-center p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground ltr">
                  Demo Mode: Use any email/password to continue
                </p>
              </div>

              {/* Terms */}
              {isSignup && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground arabic leading-relaxed">
                    اکاؤنٹ بنانے سے آپ ہماری شرائط و ضوابط سے اتفاق کرتے ہیں
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
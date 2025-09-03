import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Gift, Clock, Users, Star } from 'lucide-react';
import islamicHeroBg from '@/assets/islamic-hero-bg.jpg';
import prayerBeads from '@/assets/prayer-beads.jpg';
import rewardPattern from '@/assets/reward-pattern.jpg';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Mock user for demo
  const user = isLoggedIn ? { name: 'احمد علی', email: 'ahmed@example.com' } : null;

  const handlePress = () => {
    if (isCooldown || !isLoggedIn) return;
    
    setIsPressed(true);
    setIsCooldown(true);
    setTodayCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    setSessionCount(prev => prev + 1);
    
    // Reset visual feedback
    setTimeout(() => setIsPressed(false), 200);
    
    // 1 second cooldown
    setTimeout(() => setIsCooldown(false), 1000);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Simulate existing counts for demo
    setTodayCount(47);
    setTotalCount(1234);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTodayCount(0);
    setTotalCount(0);
    setSessionCount(0);
  };

  // Mock leaderboard data
  const monthlyLeaders = [
    { rank: 1, name: 'محمد حسن', points: 2847, prize: '۵۰۰۰ روپے نقد' },
    { rank: 2, name: 'فاطمہ خان', points: 2156, prize: 'قرآن پاک' },
    { rank: 3, name: 'علی احمد', points: 1923, prize: 'تسبیح + کاؤنٹر' }
  ];

  const todayLeaders = [
    { rank: 1, name: 'عائشہ صدیقی', count: 156 },
    { rank: 2, name: 'عمر فاروق', count: 134 },
    { rank: 3, name: 'خدیجہ علی', count: 121 }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${islamicHeroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="card-islamic backdrop-blur-md bg-card/95 border-2 border-gold/30">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-gold p-4 shadow-gold">
                  <img src={prayerBeads} alt="Prayer beads" className="w-full h-full object-cover rounded-full" />
                </div>
                <CardTitle className="text-3xl font-bold arabic text-primary">
                  درود پڑھیں، نیکیاں کمائیں
                </CardTitle>
                <p className="text-muted-foreground arabic text-lg">
                  شروع کرنے کے لیے لاگ اِن کریں
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-center">
                  <div className="card-gold">
                    <p className="text-gold-foreground font-semibold arabic">
                      ۱ پوائنٹ = ۲ روپے
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground arabic">
                    ہر مہینے ۲۹ تاریخ کو انعامات کا اعلان
                  </div>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="btn-islamic w-full text-xl arabic"
                >
                  لاگ اِن کریں
                </Button>
                <p className="text-xs text-center text-muted-foreground ltr">
                  Demo mode - Click to start
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-gradient-islamic p-2">
              <img src={prayerBeads} alt="App logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h1 className="font-bold text-primary arabic">درود ریوارڈز</h1>
              <p className="text-sm text-muted-foreground arabic">{user?.name}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-sm arabic"
          >
            لاگ آؤٹ
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Points Banner */}
        <Card className="card-gold">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <Star className="w-5 h-5 text-gold" />
              <p className="text-lg font-semibold text-gold-foreground arabic">
                ۱ پوائنٹ = ۲ روپے | آج کے پوائنٹس: {todayCount}
              </p>
              <Star className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-gold-foreground/80 mt-2 arabic">
              ہر مہینے ۲۹ تاریخ کو انعامات کا اعلان
            </p>
          </CardContent>
        </Card>

        {/* Counter Section */}
        <Card className="card-islamic">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Session Count Display */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-muted-foreground arabic">
                  آج کا شمار
                </h2>
                <div className="text-6xl font-bold text-primary">
                  {todayCount}
                </div>
              </div>

              {/* Counter Ring */}
              <div className="flex justify-center">
                <div className={`counter-ring ${isPressed ? 'active animate-ring-pulse' : ''}`}>
                  <div className="text-2xl font-bold text-primary">
                    {sessionCount}
                  </div>
                </div>
              </div>

              {/* Main Button */}
              <Button
                onClick={handlePress}
                disabled={isCooldown}
                className={`w-full max-w-xs h-16 text-2xl font-bold arabic transition-all duration-300 ${
                  isCooldown 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'btn-islamic shadow-lg hover:shadow-glow transform hover:scale-105'
                }`}
              >
                {isCooldown ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>ایک سیکنڈ...</span>
                  </div>
                ) : (
                  'ایک درود'
                )}
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-spiritual">{sessionCount}</div>
                  <div className="text-sm text-muted-foreground arabic">اس سیشن میں</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{totalCount}</div>
                  <div className="text-sm text-muted-foreground arabic">مکمل شمار</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        <Card className="card-islamic">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse arabic">
              <Trophy className="w-6 h-6 text-gold" />
              <span>انعامات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="leaderboard-row rank-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Crown className="w-6 h-6 text-gold" />
                    <span className="font-semibold arabic">پہلا انعام</span>
                  </div>
                  <Badge className="bg-gradient-gold text-gold-foreground arabic">
                    ۵۰۰۰ روپے نقد
                  </Badge>
                </div>
              </div>
              
              <div className="leaderboard-row rank-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Gift className="w-6 h-6 text-spiritual" />
                    <span className="font-semibold arabic">دوسرا انعام</span>
                  </div>
                  <Badge className="bg-gradient-spiritual text-spiritual-foreground arabic">
                    قرآن پاک
                  </Badge>
                </div>
              </div>
              
              <div className="leaderboard-row rank-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Star className="w-6 h-6 text-primary" />
                    <span className="font-semibold arabic">تیسرا انعام</span>
                  </div>
                  <Badge className="bg-gradient-islamic text-primary-foreground arabic">
                    تسبیح + کاؤنٹر
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboards */}
        <div className="grid gap-6">
          {/* Monthly Leaders */}
          <Card className="card-islamic">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse arabic">
                <Users className="w-6 h-6 text-gold" />
                <span>اس مہینے کے نمایاں افراد</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyLeaders.map((leader) => (
                  <div key={leader.rank} className={`leaderboard-row rank-${leader.rank}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light text-gold-foreground flex items-center justify-center font-bold">
                          {leader.rank}
                        </div>
                        <div>
                          <div className="font-semibold arabic">{leader.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {leader.points} پوائنٹس
                          </div>
                        </div>
                      </div>
                      <Badge className="arabic text-xs">
                        {leader.prize}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Leaders */}
          <Card className="card-islamic">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse arabic">
                <Clock className="w-6 h-6 text-spiritual" />
                <span>آج کے نمایاں افراد</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayLeaders.map((leader) => (
                  <div key={leader.rank} className={`leaderboard-row`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spiritual to-spiritual-light text-spiritual-foreground flex items-center justify-center font-bold">
                          {leader.rank}
                        </div>
                        <span className="font-semibold arabic">{leader.name}</span>
                      </div>
                      <Badge variant="secondary" className="arabic">
                        {leader.count} درود
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
        <p className="arabic">اللہ تعالیٰ آپ کو جزائے خیر عطا فرمائے</p>
        <p className="mt-2 ltr">Made with ❤️ for the Ummah</p>
      </footer>
    </div>
  );
};

export default Index;
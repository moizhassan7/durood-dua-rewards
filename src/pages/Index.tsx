import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Gift, Clock, Users, Star, Heart, Zap } from 'lucide-react';
import islamicPatternBg from '@/assets/islamic-pattern-bg.jpg';
import bismillahCalligraphy from '@/assets/bismillah-calligraphy.jpg';
import mosqueSunset from '@/assets/mosque-sunset.jpg';

// Static data store to simulate database
const staticData = {
  user: null as any,
  todayCount: 47,
  totalCount: 1234,
  sessionCount: 0,
  monthlyLeaders: [
    { rank: 1, name: 'محمد حسن', points: 2847, prize: '۵۰۰۰ روپے نقد' },
    { rank: 2, name: 'فاطمہ خان', points: 2156, prize: 'قرآن پاک' },
    { rank: 3, name: 'علی احمد', points: 1923, prize: 'تسبیح + کاؤنٹر' }
  ],
  todayLeaders: [
    { rank: 1, name: 'عائشہ صدیقی', count: 156 },
    { rank: 2, name: 'عمر فاروق', count: 134 },
    { rank: 3, name: 'خدیجہ علی', count: 121 }
  ]
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayCount, setTodayCount] = useState(staticData.todayCount);
  const [totalCount, setTotalCount] = useState(staticData.totalCount);
  const [sessionCount, setSessionCount] = useState(staticData.sessionCount);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Check login status from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('durood_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      staticData.user = user;
    }
  }, []);

  const handlePress = () => {
    if (isCooldown || !isLoggedIn) return;
    
    setIsPressed(true);
    setIsCooldown(true);
    
    // Update counts
    const newTodayCount = todayCount + 1;
    const newTotalCount = totalCount + 1;
    const newSessionCount = sessionCount + 1;
    
    setTodayCount(newTodayCount);
    setTotalCount(newTotalCount);
    setSessionCount(newSessionCount);
    
    // Update static data
    staticData.todayCount = newTodayCount;
    staticData.totalCount = newTotalCount;
    staticData.sessionCount = newSessionCount;
    
    // Save to localStorage
    localStorage.setItem('durood_counts', JSON.stringify({
      todayCount: newTodayCount,
      totalCount: newTotalCount,
      sessionCount: newSessionCount
    }));
    
    // Reset visual feedback
    setTimeout(() => setIsPressed(false), 200);
    
    // 1 second cooldown
    setTimeout(() => setIsCooldown(false), 1000);
  };

  const handleLogin = () => {
    // Simulate login
    const user = { name: 'احمد علی', email: 'ahmed@example.com' };
    setIsLoggedIn(true);
    staticData.user = user;
    localStorage.setItem('durood_user', JSON.stringify(user));
    
    // Load saved counts
    const savedCounts = localStorage.getItem('durood_counts');
    if (savedCounts) {
      const counts = JSON.parse(savedCounts);
      setTodayCount(counts.todayCount || staticData.todayCount);
      setTotalCount(counts.totalCount || staticData.totalCount);
      setSessionCount(counts.sessionCount || staticData.sessionCount);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    staticData.user = null;
    localStorage.removeItem('durood_user');
    // Reset session count but keep today and total
    setSessionCount(0);
    staticData.sessionCount = 0;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${islamicPatternBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="card-islamic backdrop-blur-md bg-card/95 border-2 border-gold/30">
              <CardHeader className="text-center space-y-4">
                {/* Bismillah Header */}
                <div className="w-full h-20 bg-gradient-to-r from-primary to-gold rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                     style={{ backgroundImage: `url(${bismillahCalligraphy})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2">
                    <h1 className="text-white font-calligraphy text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold arabic text-primary calligraphy">
                  درود پڑھیں، نیکیاں کمائیں
                  <span className="block text-sm font-normal text-muted-foreground mt-1 ltr">Read Durood, Earn Rewards</span>
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
                  Demo mode - Click to start with static data
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
              <Heart className="w-6 h-6 text-white mx-auto" />
            </div>
            <div>
              <h1 className="font-bold text-primary arabic">درود ریوارڈز</h1>
              <p className="text-sm text-muted-foreground arabic">{staticData.user?.name}</p>
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
                {staticData.monthlyLeaders.map((leader) => (
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
                {staticData.todayLeaders.map((leader) => (
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

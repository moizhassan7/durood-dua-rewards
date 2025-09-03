import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Trophy, 
  DollarSign, 
  Settings, 
  Download, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Ban,
  RotateCcw
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const stats = {
    totalUsers: 1247,
    activeToday: 87,
    totalDurood: 125487,
    pendingPayouts: 12,
    monthlyWinners: 3
  };

  const users = [
    { id: 1, name: 'احمد علی', email: 'ahmed@example.com', totalCount: 1234, todayCount: 47, status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'فاطمہ خان', email: 'fatima@example.com', totalCount: 2156, todayCount: 89, status: 'active', joinDate: '2024-01-20' },
    { id: 3, name: 'محمد حسن', email: 'hassan@example.com', totalCount: 2847, todayCount: 156, status: 'banned', joinDate: '2024-01-10' }
  ];

  const payouts = [
    { id: 1, userId: 1, userName: 'احمد علی', month: '2024-02', points: 1234, amount: 2468, method: 'Easypaisa', account: '0300-1234567', status: 'pending' },
    { id: 2, userId: 2, userName: 'فاطمہ خان', month: '2024-02', points: 2156, amount: 4312, method: 'Bank', account: '12345678901234', status: 'approved' },
    { id: 3, userId: 3, userName: 'محمد حسن', month: '2024-01', points: 2847, amount: 5694, method: 'JazzCash', account: '0301-9876543', status: 'paid' }
  ];

  const winners = [
    { rank: 1, name: 'محمد حسن', points: 2847, prize: '۵۰۰۰ روپے نقد', month: '2024-02' },
    { rank: 2, name: 'فاطمہ خان', points: 2156, prize: 'قرآن پاک', month: '2024-02' },
    { rank: 3, name: 'علی احمد', points: 1923, prize: 'تسبیح + کاؤنٹر', month: '2024-02' }
  ];

  const updatePayoutStatus = (id: number, status: string) => {
    console.log(`Updating payout ${id} to ${status}`);
    // Here you would update the status in your database
  };

  const toggleUserStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    console.log(`Toggling user ${id} from ${currentStatus} to ${newStatus}`);
    // Here you would update the user status in your database
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data`);
    // Here you would generate and download CSV
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-gradient-islamic p-2">
                <Settings className="w-full h-full text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary arabic">ایڈمن پینل</h1>
                <p className="text-sm text-muted-foreground arabic">درود ریوارڈز منیجمنٹ</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="arabic">
              صارف پینل
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="arabic">ڈیش بورڈ</TabsTrigger>
            <TabsTrigger value="users" className="arabic">صارفین</TabsTrigger>
            <TabsTrigger value="payouts" className="arabic">ادائیگیاں</TabsTrigger>
            <TabsTrigger value="winners" className="arabic">فاتحین</TabsTrigger>
            <TabsTrigger value="settings" className="arabic">سیٹنگز</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="card-islamic">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-sm text-muted-foreground arabic">کل صارفین</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-islamic">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold">{stats.activeToday}</p>
                      <p className="text-sm text-muted-foreground arabic">آج فعال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-islamic">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Trophy className="w-8 h-8 text-spiritual" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalDurood.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground arabic">کل درود</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-islamic">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <DollarSign className="w-8 h-8 text-gold" />
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingPayouts}</p>
                      <p className="text-sm text-muted-foreground arabic">زیر التوا ادائیگیاں</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-islamic">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">{stats.monthlyWinners}</p>
                      <p className="text-sm text-muted-foreground arabic">اس ماہ فاتحین</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="card-islamic">
              <CardHeader>
                <CardTitle className="arabic">حالیہ سرگرمی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="arabic">محمد حسن نے آج 156 درود پڑھے</span>
                    </div>
                    <span className="text-sm text-muted-foreground">2 منٹ پہلے</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <DollarSign className="w-5 h-5 text-gold" />
                      <span className="arabic">فاطمہ خان کی ادائیگی منظور</span>
                    </div>
                    <span className="text-sm text-muted-foreground">15 منٹ پہلے</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="arabic">نیا صارف احمد علی شامل ہوا</span>
                    </div>
                    <span className="text-sm text-muted-foreground">1 گھنٹہ پہلے</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold arabic">صارفین کا انتظام</h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button onClick={() => exportData('users')} className="arabic">
                  <Download className="w-4 h-4 ml-2" />
                  CSV ایکسپورٹ
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="صارف تلاش کریں..." className="pr-10 arabic text-right" />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="حالت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="arabic">تمام</SelectItem>
                  <SelectItem value="active" className="arabic">فعال</SelectItem>
                  <SelectItem value="banned" className="arabic">محدود</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <Card className="card-islamic">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border/50">
                      <tr className="bg-muted/30">
                        <th className="text-right p-4 arabic">صارف</th>
                        <th className="text-right p-4 arabic">کل درود</th>
                        <th className="text-right p-4 arabic">آج</th>
                        <th className="text-right p-4 arabic">حالت</th>
                        <th className="text-right p-4 arabic">شمولیت</th>
                        <th className="text-right p-4 arabic">عمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="p-4">
                            <div className="text-right">
                              <div className="font-semibold arabic">{user.name}</div>
                              <div className="text-sm text-muted-foreground ltr">{user.email}</div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-semibold">{user.totalCount.toLocaleString()}</td>
                          <td className="p-4 text-right">{user.todayCount}</td>
                          <td className="p-4 text-right">
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'destructive'}
                              className="arabic"
                            >
                              {user.status === 'active' ? 'فعال' : 'محدود'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right text-sm text-muted-foreground">
                            {new Date(user.joinDate).toLocaleDateString('ur-PK')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2 space-x-reverse justify-end">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={user.status === 'active' ? 'destructive' : 'default'}
                                onClick={() => toggleUserStatus(user.id, user.status)}
                              >
                                {user.status === 'active' ? <Ban className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold arabic">ادائیگیوں کا انتظام</h2>
              <Button onClick={() => exportData('payouts')} className="arabic">
                <Download className="w-4 h-4 ml-2" />
                CSV ایکسپورٹ
              </Button>
            </div>

            <Card className="card-islamic">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border/50">
                      <tr className="bg-muted/30">
                        <th className="text-right p-4 arabic">صارف</th>
                        <th className="text-right p-4 arabic">مہینہ</th>
                        <th className="text-right p-4 arabic">پوائنٹس</th>
                        <th className="text-right p-4 arabic">رقم</th>
                        <th className="text-right p-4 arabic">طریقہ</th>
                        <th className="text-right p-4 arabic">حالت</th>
                        <th className="text-right p-4 arabic">عمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="p-4 text-right">
                            <div className="font-semibold arabic">{payout.userName}</div>
                            <div className="text-sm text-muted-foreground">{payout.account}</div>
                          </td>
                          <td className="p-4 text-right">{payout.month}</td>
                          <td className="p-4 text-right font-semibold">{payout.points.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-gold">{payout.amount.toLocaleString()} PKR</td>
                          <td className="p-4 text-right">{payout.method}</td>
                          <td className="p-4 text-right">
                            <Badge 
                              variant={
                                payout.status === 'paid' ? 'default' : 
                                payout.status === 'approved' ? 'secondary' : 
                                'destructive'
                              }
                              className="arabic"
                            >
                              {payout.status === 'pending' ? 'زیر التوا' : 
                               payout.status === 'approved' ? 'منظور' : 'ادا شدہ'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2 space-x-reverse justify-end">
                              {payout.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updatePayoutStatus(payout.id, 'approved')}
                                    className="arabic text-xs"
                                  >
                                    منظور
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                                    className="arabic text-xs"
                                  >
                                    مسترد
                                  </Button>
                                </>
                              )}
                              {payout.status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => updatePayoutStatus(payout.id, 'paid')}
                                  className="arabic text-xs"
                                >
                                  ادا شدہ
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold arabic">ماہانہ فاتحین</h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button className="arabic">
                  <Trophy className="w-4 h-4 ml-2" />
                  نئے فاتحین کا حساب
                </Button>
                <Button onClick={() => exportData('winners')} variant="outline" className="arabic">
                  <Download className="w-4 h-4 ml-2" />
                  CSV ایکسپورٹ
                </Button>
              </div>
            </div>

            <Card className="card-islamic">
              <CardHeader>
                <CardTitle className="arabic">فروری 2024 کے فاتحین</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {winners.map((winner) => (
                    <div key={winner.rank} className={`leaderboard-row rank-${winner.rank}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light text-gold-foreground flex items-center justify-center font-bold text-lg">
                            {winner.rank}
                          </div>
                          <div>
                            <div className="font-bold arabic text-lg">{winner.name}</div>
                            <div className="text-muted-foreground">
                              {winner.points.toLocaleString()} پوائنٹس
                            </div>
                          </div>
                        </div>
                        <Badge className="arabic text-sm px-4 py-2">
                          {winner.prize}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold arabic">سسٹم سیٹنگز</h2>
            
            <div className="grid gap-6">
              <Card className="card-islamic">
                <CardHeader>
                  <CardTitle className="arabic">پوائنٹس کی قیمت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pointValue" className="arabic">ایک پوائنٹ = PKR</Label>
                      <Input id="pointValue" type="number" defaultValue="2" className="text-right" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cooldown" className="arabic">پریس کولڈاؤن (ملی سیکنڈ)</Label>
                      <Input id="cooldown" type="number" defaultValue="1000" className="text-right" />
                    </div>
                  </div>
                  <Button className="arabic">تبدیلیاں محفوظ کریں</Button>
                </CardContent>
              </Card>

              <Card className="card-islamic">
                <CardHeader>
                  <CardTitle className="arabic">انعامات کی ترتیب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <Label className="arabic">پہلا انعام:</Label>
                      <Input defaultValue="۵۰۰۰ روپے نقد" className="text-right arabic" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label className="arabic">دوسرا انعام:</Label>
                      <Input defaultValue="قرآن پاک" className="text-right arabic" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label className="arabic">تیسرا انعام:</Label>
                      <Input defaultValue="تسبیح + کاؤنٹر" className="text-right arabic" />
                    </div>
                  </div>
                  <Button className="arabic">انعامات اپڈیٹ کریں</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
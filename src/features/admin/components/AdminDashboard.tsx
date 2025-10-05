import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { useAdminStats } from '../hooks/useAdminStats';
import { formatPrice } from '../../../utils/formatters';
import { Users, UserCheck, FileText, DollarSign, TrendingUp, Download } from 'lucide-react';

interface AdminDashboardProps {
  onExportData?: () => void;
}

export function AdminDashboard({ onExportData }: AdminDashboardProps) {
  const { stats, isLoading, error, refreshStats } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshStats} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: <UserCheck className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Scenarios',
      value: stats.totalScenarios.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Guest Submissions',
      value: stats.totalGuestSubmissions.toLocaleString(),
      icon: <UserCheck className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg Scenario Value',
      value: formatPrice(stats.averageScenarioValue),
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={refreshStats} variant="outline" size="sm">
            Refresh
          </Button>
          {onExportData && (
            <Button onClick={onExportData} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <Badge variant="secondary">
                  {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Guest Conversion</span>
                <Badge variant="secondary">
                  {stats.totalGuestSubmissions > 0 
                    ? ((stats.totalScenarios / stats.totalGuestSubmissions) * 100).toFixed(1)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">{formatPrice(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg per Scenario</span>
                <span className="font-semibold">{formatPrice(stats.averageScenarioValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;

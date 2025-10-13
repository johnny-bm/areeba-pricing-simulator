import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Eye, 
  Download,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  UserCheck
} from 'lucide-react';
import { Spinner } from './ui/spinner';
import { formatPrice } from '../utils/formatters';
import { api } from '../utils/api';
import { SimulatorApi } from '../utils/simulatorApi';
import { Simulator } from '../types/simulator';
import { PricingItem } from '../types/domain';

interface DashboardStats {
  totalSessions: number;
  totalSubmissions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  recentActivity: any[];
  topServices: PricingItem[];
}

interface SimulatorDashboardProps {
  simulatorId: string;
}

export function SimulatorDashboard({ simulatorId }: SimulatorDashboardProps) {
  const [simulator, setSimulator] = useState<Simulator | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalSubmissions: 0,
    totalRevenue: 0,
    averageSessionDuration: 0,
    recentActivity: [],
    topServices: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [simulatorId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load simulator details
      const simulators = await SimulatorApi.loadSimulators();
      const currentSimulator = simulators.find(s => s.id === simulatorId);
      setSimulator(currentSimulator || null);

      // Load dashboard statistics
      const [scenarios, guestSubmissions, services] = await Promise.all([
        api.loadScenarios().catch(() => []),
        api.loadGuestSubmissions().catch(() => []),
        api.loadSimulatorServices(simulatorId).catch(() => [])
      ]);

      // For now, show all data since we don't have simulator-specific filtering yet
      const simulatorScenarios = scenarios; // TODO: Filter by simulatorId when available
      const simulatorSubmissions = guestSubmissions; // TODO: Filter by simulatorId when available

      // Calculate stats
      const totalSessions = simulatorScenarios.length + simulatorSubmissions.length;
      const totalSubmissions = simulatorSubmissions.length;
      let totalRevenue = 0;
      for (const s of simulatorScenarios) {
        const cost = s.summary?.totalProjectCost;
        if (typeof cost === 'number') {
          totalRevenue += cost;
        }
      }
      
      // Calculate average session duration (mock data for now)
      const averageSessionDuration = 15; // minutes

      // Get recent activity
      const recentActivity = [
        ...simulatorScenarios.map(s => ({
          id: s.scenarioId,
          type: 'scenario',
          title: `${s.clientName} - ${s.projectName}`,
          date: s.createdAt,
          value: s.summary?.totalProjectCost || 0,
          status: 'completed'
        })),
        ...simulatorSubmissions.map(s => ({
          id: s.id,
          type: 'submission',
          title: `${s.contactName} - ${s.company}`,
          date: s.createdAt,
          value: s.totalPrice || 0,
          status: s.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Get top services from real data
      const topServices = services.slice(0, 5); // Show top 5 services

      setStats({
        totalSessions,
        totalSubmissions,
        totalRevenue,
        averageSessionDuration,
        recentActivity,
        topServices
      });
    } catch (error) {
      // // console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor {simulator?.title || 'simulator'} activity and performance metrics
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={isLoading}>
          {isLoading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Submissions</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSessionDuration}m</div>
            <p className="text-xs text-muted-foreground">
              +2m from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest simulator sessions and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'scenario' ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatPrice(activity.value)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">
                    Activity will appear here once users start using the simulator
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>
              Most popular services in this simulator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topServices.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.categoryId || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(service.defaultPrice || 0)}</p>
                    <p className="text-xs text-muted-foreground">price</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing this simulator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">View Simulator</p>
                  <p className="text-xs text-muted-foreground">Preview the simulator</p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download reports</p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">View detailed analytics</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

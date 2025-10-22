import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Save, RefreshCw, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Spinner } from '../../../components/ui/spinner';
import { Simulator, SIMULATOR_ICONS } from '../../../types/simulator';
import { SimulatorApi } from '../../../utils/simulatorApi';
import { toast } from 'sonner';

interface SimulatorInfoPageProps {
  simulatorId: string;
}

export function SimulatorInfoPage({ simulatorId }: SimulatorInfoPageProps) {
  const [simulator, setSimulator] = useState<Simulator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Simulator>>({});

  useEffect(() => {
    loadSimulator();
  }, [simulatorId]);

  const loadSimulator = async () => {
    try {
      setIsLoading(true);
      const simulators = await SimulatorApi.loadSimulators();
      const currentSimulator = simulators.find(s => s.id === simulatorId);
      
      if (currentSimulator) {
        setSimulator(currentSimulator);
        setFormData(currentSimulator);
      } else {
        toast.error('Simulator not found');
      }
    } catch (error) {
      // // console.error('Failed to load simulator:', error);
      toast.error('Failed to load simulator details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!simulator) return;

    try {
      setIsSaving(true);
      await SimulatorApi.updateSimulator(simulatorId, formData);
      await loadSimulator();
      setIsEditing(false);
      toast.success('Simulator updated successfully');
    } catch (error) {
      // // console.error('Failed to save simulator:', error);
      toast.error('Failed to save simulator');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(simulator || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Simulator, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!simulator) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Simulator Not Found</h3>
        <p className="text-muted-foreground">The requested simulator could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Simulator Information</h2>
          <p className="text-muted-foreground">
            Manage simulator details, description, and display settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Simulator
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details of your simulator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., hosting-pricing"
                  />
                  <p className="text-xs text-muted-foreground">
                    Internal identifier (used in URLs)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Display Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Hosting Pricing Calculator"
                  />
                  <p className="text-xs text-muted-foreground">
                    The title shown to users
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Describe what this simulator does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Call-to-Action Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText || ''}
                    onChange={(e) => handleInputChange('ctaText', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Get Started"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iconName">Icon</Label>
                  <Select
                    value={formData.iconName || ''}
                    onValueChange={(value) => handleInputChange('iconName', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIMULATOR_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>URL Configuration</CardTitle>
              <CardDescription>
                Configure how this simulator appears in URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urlSlug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="urlSlug"
                    value={formData.urlSlug || ''}
                    onChange={(e) => handleInputChange('urlSlug', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., hosting-pricing"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" disabled={!isEditing}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL: /simulator/{formData.urlSlug || simulator.urlSlug}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Simulator is available for use
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.is_active ?? false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isAvailable">Available</Label>
                  <p className="text-xs text-muted-foreground">
                    Simulator appears in listings
                  </p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable ?? false}
                  onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comingSoon">Coming Soon</Label>
                  <p className="text-xs text-muted-foreground">
                    Show as coming soon
                  </p>
                </div>
                <Switch
                  id="comingSoon"
                  checked={formData.comingSoon ?? false}
                  onCheckedChange={(checked) => handleInputChange('comingSoon', checked)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(simulator.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(simulator.updated_at).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={simulator.is_active ? 'default' : 'secondary'}>
                  {simulator.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

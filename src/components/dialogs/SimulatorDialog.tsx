import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Save, X, Trash2, Copy, CreditCard } from 'lucide-react';
import { Simulator, CreateSimulatorData, UpdateSimulatorData, SIMULATOR_ICONS } from '../../types/simulator';
import { SIMULATOR_ICON_MAP_SMALL } from '../../utils/icons';

interface SimulatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSimulatorData | UpdateSimulatorData) => Promise<void>;
  simulator?: Simulator | null;
  isCreating: boolean;
}

interface SimulatorFormData {
  name: string;
  title: string;
  description: string;
  ctaText: string;
  iconName: string;
  urlSlug: string;
  isActive: boolean;
  isAvailable: boolean;
  comingSoon: boolean;
  sort_order: number;
}

export function SimulatorDialog({
  isOpen,
  onClose,
  onSave,
  simulator,
  isCreating
}: SimulatorDialogProps) {
  const [formData, setFormData] = useState<SimulatorFormData>({
    name: '',
    title: '',
    description: '',
    ctaText: 'Start Simulation',
    iconName: 'CreditCard',
    urlSlug: '',
    isActive: true,
    isAvailable: true,
    comingSoon: false,
    sort_order: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (simulator && !isCreating) {
        // Edit mode - populate with existing data
        setFormData({
          name: simulator.name,
          title: simulator.title,
          description: simulator.description,
          ctaText: simulator.ctaText,
          iconName: simulator.iconName,
          urlSlug: simulator.urlSlug,
          isActive: simulator.is_active,
          isAvailable: simulator.isAvailable,
          comingSoon: simulator.comingSoon,
          sort_order: simulator.sort_order
        });
      } else {
        // Create mode - start with defaults
        setFormData({
          name: '',
          title: '',
          description: '',
          ctaText: 'Start Simulation',
          iconName: 'CreditCard',
          urlSlug: '',
          isActive: true,
          isAvailable: true,
          comingSoon: false,
          sort_order: 0
        });
      }
    }
  }, [isOpen, simulator, isCreating]);

  // Auto-generate URL slug from name
  useEffect(() => {
    if (formData.name && !formData.urlSlug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, urlSlug: slug }));
    }
  }, [formData.name, formData.urlSlug]);

  const updateField = <K extends keyof SimulatorFormData>(
    field: K,
    value: SimulatorFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields (Name, Title, and Description)');
      return;
    }

    if (!formData.urlSlug.trim()) {
      alert('Please provide a URL slug');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving simulator:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = formData.name?.trim() && formData.title?.trim() && formData.description?.trim() && formData.urlSlug?.trim();

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Create New Simulator' : 'Edit Simulator'}
      description={
        isCreating 
          ? 'Add a new simulator configuration with custom settings and appearance.'
          : 'Modify the selected simulator settings, visibility, and configuration options.'
      }
      size="lg"
      secondaryActions={[
        {
          label: 'Cancel',
          onClick: onClose,
          disabled: isSaving
        }
      ]}
      primaryAction={{
        label: isSaving ? 'Saving...' : (isCreating ? 'Create Simulator' : 'Save Changes'),
        onClick: handleSave,
        loading: isSaving,
        disabled: !isValid
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="simulator-name">Name *</Label>
            <Input
              id="simulator-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter simulator name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simulator-title">Title *</Label>
            <Input
              id="simulator-title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter display title"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="simulator-description">Description *</Label>
          <Textarea
            id="simulator-description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe this simulator"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="simulator-cta">CTA Text</Label>
            <Input
              id="simulator-cta"
              value={formData.ctaText}
              onChange={(e) => updateField('ctaText', e.target.value)}
              placeholder="Start Simulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simulator-icon">Icon</Label>
            <Select value={formData.iconName} onValueChange={(value) => updateField('iconName', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIMULATOR_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      {SIMULATOR_ICON_MAP_SMALL[icon] || <CreditCard className="h-4 w-4" />}
                      <span>{icon}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="simulator-slug">URL Slug *</Label>
          <Input
            id="simulator-slug"
            value={formData.urlSlug}
            onChange={(e) => updateField('urlSlug', e.target.value)}
            placeholder="issuing-processing"
          />
          <p className="text-xs text-muted-foreground">
            URL: /simulator/{formData.urlSlug || 'your-slug'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this simulator in the landing page
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Available</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to start this simulator
              </p>
            </div>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(checked) => updateField('isAvailable', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Coming Soon</Label>
              <p className="text-sm text-muted-foreground">
                Mark as coming soon (overrides available)
              </p>
            </div>
            <Switch
              checked={formData.comingSoon}
              onCheckedChange={(checked) => updateField('comingSoon', checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="simulator-sort">Sort Order</Label>
          <Input
            id="simulator-sort"
            type="number"
            value={formData.sort_order}
            onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Lower numbers appear first
          </p>
        </div>
      </div>
    </StandardDialog>
  );
}

// Template Presets Component
// Provides pre-built document structures for common use cases

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  Briefcase, 
  GraduationCap,
  FileCheck,
  Presentation,
  ArrowRight,
  Plus
} from 'lucide-react';

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  structure: Array<{
    type: 'title' | 'text' | 'image' | 'table' | 'bullet' | 'callout';
    title: string;
    level?: number;
    content?: string;
  }>;
  numbering: {
    [level: number]: 'roman' | 'letters' | 'numbers' | 'decimal' | 'none';
  };
}

const PRESETS: TemplatePreset[] = [
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal with executive summary, methodology, and pricing',
    icon: <Briefcase className="h-5 w-5" />,
    category: 'Business',
    structure: [
      { type: 'title', title: 'Executive Summary', level: 1 },
      { type: 'text', title: 'Company Overview' },
      { type: 'title', title: 'Problem Statement', level: 1 },
      { type: 'text', title: 'Current Challenges' },
      { type: 'title', title: 'Proposed Solution', level: 1 },
      { type: 'text', title: 'Methodology' },
      { type: 'title', title: 'Implementation Plan', level: 1 },
      { type: 'bullet', title: 'Phase 1: Setup' },
      { type: 'bullet', title: 'Phase 2: Development' },
      { type: 'bullet', title: 'Phase 3: Testing' },
      { type: 'title', title: 'Pricing', level: 1 },
      { type: 'table', title: 'Cost Breakdown' },
      { type: 'title', title: 'Timeline', level: 1 },
      { type: 'text', title: 'Project Schedule' }
    ],
    numbering: {
      1: 'roman',
      2: 'letters',
      3: 'numbers'
    }
  },
  {
    id: 'technical-manual',
    name: 'Technical Manual',
    description: 'Comprehensive technical documentation with detailed sections and procedures',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'Technical',
    structure: [
      { type: 'title', title: 'Introduction', level: 1 },
      { type: 'text', title: 'Overview' },
      { type: 'title', title: 'System Requirements', level: 1 },
      { type: 'bullet', title: 'Hardware Requirements' },
      { type: 'bullet', title: 'Software Requirements' },
      { type: 'title', title: 'Installation', level: 1 },
      { type: 'text', title: 'Step-by-step installation guide' },
      { type: 'title', title: 'Configuration', level: 1 },
      { type: 'text', title: 'System setup instructions' },
      { type: 'title', title: 'Usage', level: 1 },
      { type: 'text', title: 'How to use the system' },
      { type: 'title', title: 'Troubleshooting', level: 1 },
      { type: 'text', title: 'Common issues and solutions' }
    ],
    numbering: {
      1: 'numbers',
      2: 'decimal',
      3: 'letters'
    }
  },
  {
    id: 'academic-paper',
    name: 'Academic Paper',
    description: 'Research paper with abstract, methodology, results, and conclusions',
    icon: <GraduationCap className="h-5 w-5" />,
    category: 'Academic',
    structure: [
      { type: 'title', title: 'Abstract', level: 1 },
      { type: 'text', title: 'Research summary' },
      { type: 'title', title: 'Introduction', level: 1 },
      { type: 'text', title: 'Background and motivation' },
      { type: 'title', title: 'Literature Review', level: 1 },
      { type: 'text', title: 'Previous research' },
      { type: 'title', title: 'Methodology', level: 1 },
      { type: 'text', title: 'Research approach' },
      { type: 'title', title: 'Results', level: 1 },
      { type: 'text', title: 'Findings and data' },
      { type: 'title', title: 'Discussion', level: 1 },
      { type: 'text', title: 'Analysis and interpretation' },
      { type: 'title', title: 'Conclusion', level: 1 },
      { type: 'text', title: 'Summary and future work' }
    ],
    numbering: {
      1: 'numbers',
      2: 'decimal',
      3: 'letters'
    }
  },
  {
    id: 'project-report',
    name: 'Project Report',
    description: 'Project status report with milestones, deliverables, and next steps',
    icon: <FileCheck className="h-5 w-5" />,
    category: 'Project Management',
    structure: [
      { type: 'title', title: 'Project Overview', level: 1 },
      { type: 'text', title: 'Project description and objectives' },
      { type: 'title', title: 'Current Status', level: 1 },
      { type: 'text', title: 'Progress update' },
      { type: 'title', title: 'Milestones Achieved', level: 1 },
      { type: 'bullet', title: 'Completed tasks' },
      { type: 'title', title: 'Deliverables', level: 1 },
      { type: 'table', title: 'Deliverable status' },
      { type: 'title', title: 'Challenges', level: 1 },
      { type: 'text', title: 'Issues and obstacles' },
      { type: 'title', title: 'Next Steps', level: 1 },
      { type: 'bullet', title: 'Upcoming tasks' }
    ],
    numbering: {
      1: 'numbers',
      2: 'letters',
      3: 'decimal'
    }
  },
  {
    id: 'presentation-outline',
    name: 'Presentation Outline',
    description: 'Structured presentation with introduction, main points, and conclusion',
    icon: <Presentation className="h-5 w-5" />,
    category: 'Presentation',
    structure: [
      { type: 'title', title: 'Introduction', level: 1 },
      { type: 'text', title: 'Opening remarks' },
      { type: 'title', title: 'Main Points', level: 1 },
      { type: 'title', title: 'Point 1', level: 2 },
      { type: 'text', title: 'Supporting details' },
      { type: 'title', title: 'Point 2', level: 2 },
      { type: 'text', title: 'Supporting details' },
      { type: 'title', title: 'Point 3', level: 2 },
      { type: 'text', title: 'Supporting details' },
      { type: 'title', title: 'Conclusion', level: 1 },
      { type: 'text', title: 'Summary and call to action' }
    ],
    numbering: {
      1: 'numbers',
      2: 'letters',
      3: 'decimal'
    }
  }
];

interface TemplatePresetsProps {
  onSelectPreset: (preset: TemplatePreset) => void;
  onCreateCustom: () => void;
}

export function TemplatePresets({ onSelectPreset, onCreateCustom }: TemplatePresetsProps) {
  const categories = Array.from(new Set(PRESETS.map(preset => preset.category)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Template Presets</h3>
        <p className="text-sm text-muted-foreground">
          Choose from pre-built document structures or create a custom template.
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.filter(preset => preset.category === category).map(preset => (
              <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {preset.icon}
                    <CardTitle className="text-base">{preset.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {preset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{preset.structure.length} sections</span>
                      <span>•</span>
                      <span>Auto-numbered</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(preset.numbering).map(([level, type]) => (
                        <Badge key={level} variant="outline" className="text-xs">
                          H{level}: {type}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => onSelectPreset(preset)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t pt-6">
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-medium mb-2">Create Custom Template</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Build your own document structure from scratch
              </p>
              <Button onClick={onCreateCustom} variant="outline">
                Start Building
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

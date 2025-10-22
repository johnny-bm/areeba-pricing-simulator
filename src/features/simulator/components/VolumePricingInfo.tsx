import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function VolumePricingInfo() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="text-blue-600">📊</span>
          Volume Pricing Available
          <Badge variant="secondary" className="text-xs">New</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-blue-800 space-y-2">
        <p>
          Some services now offer <strong>volume discounts</strong> that automatically reduce unit costs as quantities increase.
        </p>
        <div className="space-y-1">
          <div>• <strong>Card Hosting:</strong> Better rates for larger portfolios</div>
          <div>• <strong>Auto-calculated:</strong> Best pricing applied automatically</div>
          <div>• <strong>Transparent:</strong> See tier breakdowns in each item</div>
        </div>
        <p className="text-blue-600 italic mt-2">
          💡 Look for the "📊 Volume Pricing" badges in the item library
        </p>
      </CardContent>
    </Card>
  );
}
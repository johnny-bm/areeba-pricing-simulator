import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { NumberInput } from "./NumberInput";
import { ClientConfig } from "../types/pricing";

interface ClientConfigBarProps {
  config: ClientConfig;
  onConfigChange: (config: ClientConfig) => void;
}

export function ClientConfigBar({ 
  config, 
  onConfigChange
}: ClientConfigBarProps) {
  const updateConfig = (field: keyof ClientConfig, value: string | number | boolean) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Project Information Card */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="clientName" className="text-sm">Client Name</Label>
            <Input
              id="clientName"
              value={config.clientName}
              onChange={(e) => updateConfig('clientName', e.target.value)}
              placeholder="Enter client name"
              className={`h-8 ${config.clientName ? 'bg-white border-border-filled shadow-sm' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">Name of the client organization</p>
          </div>
          <div>
            <Label htmlFor="projectName" className="text-sm">Project Name</Label>
            <Input
              id="projectName"
              value={config.projectName}
              onChange={(e) => updateConfig('projectName', e.target.value)}
              placeholder="Enter project name"
              className={`h-8 ${config.projectName ? 'bg-white border-border-filled shadow-sm' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">Internal project identifier</p>
          </div>
          <div>
            <Label htmlFor="preparedBy" className="text-sm">Prepared By</Label>
            <Input
              id="preparedBy"
              value={config.preparedBy}
              onChange={(e) => updateConfig('preparedBy', e.target.value)}
              placeholder="Enter your name"
              className={`h-8 ${config.preparedBy ? 'bg-white border-border-filled shadow-sm' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">Person preparing this quote</p>
          </div>
        </div>
      </Card>

      {/* Card Configuration Card */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Card Configuration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDebitCards"
                  checked={config.hasDebitCards}
                  onCheckedChange={(checked) => updateConfig('hasDebitCards', checked)}
                />
                <Label htmlFor="hasDebitCards" className="text-sm">Debit/Prepaid/Virtual Cards</Label>
              </div>
              {config.hasDebitCards && (
                <div>
                  <Label htmlFor="debitCards" className="text-xs">Number of Debit/Prepaid/Virtual Cards</Label>
                  <NumberInput
                    id="debitCards"
                    value={config.debitCards}
                    onChange={(value) => updateConfig('debitCards', value)}
                    placeholder="0"
                    className="h-8"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total debit, prepaid, and virtual cards to be issued</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCreditCards"
                  checked={config.hasCreditCards}
                  onCheckedChange={(checked) => updateConfig('hasCreditCards', checked)}
                />
                <Label htmlFor="hasCreditCards" className="text-sm">Credit Cards</Label>
              </div>
              {config.hasCreditCards && (
                <div>
                  <Label htmlFor="creditCards" className="text-xs">Number of Credit Cards</Label>
                  <NumberInput
                    id="creditCards"
                    value={config.creditCards}
                    onChange={(value) => updateConfig('creditCards', value)}
                    placeholder="0"
                    className="h-8"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total credit cards to be issued</p>
                </div>
              )}
            </div>
          </div>

          {/* Card Delivery Configuration */}
          {(config.hasDebitCards || config.hasCreditCards) && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Card Delivery</h4>
              <div className="max-w-xs">
                <Label htmlFor="monthlyDeliveries" className="text-xs">Monthly Card Deliveries</Label>
                <NumberInput
                  id="monthlyDeliveries"
                  value={config.monthlyDeliveries}
                  onChange={(value) => updateConfig('monthlyDeliveries', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly card deliveries to cardholders</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Volumes Card */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Monthly Transaction & Communication Volumes</h3>
        <div className="space-y-4">
          {/* Transaction Volumes */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Transaction Processing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="monthlyAuthorizations" className="text-xs">Authorizations</Label>
                <NumberInput
                  id="monthlyAuthorizations"
                  value={config.monthlyAuthorizations}
                  onChange={(value) => updateConfig('monthlyAuthorizations', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly authorization transactions</p>
              </div>
              <div>
                <Label htmlFor="monthlySettlements" className="text-xs">Settlements</Label>
                <NumberInput
                  id="monthlySettlements"
                  value={config.monthlySettlements}
                  onChange={(value) => updateConfig('monthlySettlements', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly settlement transactions</p>
              </div>
              <div>
                <Label htmlFor="monthly3DS" className="text-xs">3D Secure</Label>
                <NumberInput
                  id="monthly3DS"
                  value={config.monthly3DS}
                  onChange={(value) => updateConfig('monthly3DS', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly 3DS authentications</p>
              </div>
            </div>
          </div>

          {/* Communication Volumes */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Communication Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="monthlySMS" className="text-xs">SMS Alerts</Label>
                <NumberInput
                  id="monthlySMS"
                  value={config.monthlySMS}
                  onChange={(value) => updateConfig('monthlySMS', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly SMS notifications sent</p>
              </div>
              <div>
                <Label htmlFor="monthlyNotifications" className="text-xs">Push Notifications</Label>
                <NumberInput
                  id="monthlyNotifications"
                  value={config.monthlyNotifications}
                  onChange={(value) => updateConfig('monthlyNotifications', value)}
                  placeholder="0"
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground mt-1">Monthly push notifications sent</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
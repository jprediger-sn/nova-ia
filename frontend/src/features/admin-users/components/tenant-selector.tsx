import { Label } from "@/components/ui/label";
import type { TenantOption } from "../types";

interface TenantSelectorProps {
  label?: string;
  tenants: TenantOption[];
  value: string;
  onChange: (tenantId: string) => void;
  disabled?: boolean;
}

export function TenantSelector({
  label = "Tenant",
  tenants,
  value,
  onChange,
  disabled,
}: TenantSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.label}
          </option>
        ))}
      </select>
    </div>
  );
}


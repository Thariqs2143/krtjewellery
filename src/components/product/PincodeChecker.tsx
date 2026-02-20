import { useMemo, useState } from 'react';
import { MapPin, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDeliveryPincodes } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

type CheckStatus = 'idle' | 'invalid' | 'available' | 'unavailable' | 'not_configured';

const normalizePincode = (value: string) => value.replace(/\D/g, '').slice(0, 6);

export function PincodeChecker({ className }: { className?: string }) {
  const { data, isLoading } = useDeliveryPincodes();
  const [pincodeInput, setPincodeInput] = useState('');
  const [status, setStatus] = useState<CheckStatus>('idle');

  const allowedPincodes = useMemo(() => {
    const list = data?.pincodes ?? [];
    return new Set(list.map((pin) => normalizePincode(String(pin))).filter((pin) => pin.length === 6));
  }, [data?.pincodes]);

  const hasConfigured = allowedPincodes.size > 0;

  const handleCheck = () => {
    const normalized = normalizePincode(pincodeInput);
    if (normalized.length !== 6) {
      setStatus('invalid');
      return;
    }

    if (!hasConfigured) {
      setStatus('not_configured');
      return;
    }

    setStatus(allowedPincodes.has(normalized) ? 'available' : 'unavailable');
  };

  const statusMessage = (() => {
    const normalized = normalizePincode(pincodeInput);
    switch (status) {
      case 'invalid':
        return {
          tone: 'text-destructive',
          icon: XCircle,
          text: 'Please enter a valid 6-digit pincode.',
        };
      case 'available':
        return {
          tone: 'text-green-700',
          icon: CheckCircle2,
          text: `Delivery available to ${normalized}. Estimated delivery in 3-5 business days.`,
        };
      case 'unavailable':
        return {
          tone: 'text-amber-700',
          icon: XCircle,
          text: `Sorry, we do not deliver to ${normalized} yet.`,
        };
      case 'not_configured':
        return {
          tone: 'text-muted-foreground',
          icon: Truck,
          text: 'Delivery availability is being updated. Please try again later.',
        };
      default:
        return null;
    }
  })();

  return (
    <div className={cn('border border-border rounded-xl p-4 space-y-3', className)}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <div>
          <p className="text-sm font-semibold">Check Delivery Availability</p>
          <p className="text-xs text-muted-foreground">Enter your pincode to see if delivery is available.</p>
        </div>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleCheck();
        }}
      >
        <Input
          value={pincodeInput}
          onChange={(event) => {
            const nextValue = normalizePincode(event.target.value);
            setPincodeInput(nextValue);
            if (status !== 'idle') setStatus('idle');
          }}
          inputMode="numeric"
          placeholder="Enter pincode"
          className="h-10"
        />
        <Button type="submit" className="h-10 px-4" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check'}
        </Button>
      </form>

      {statusMessage ? (
        <div className={cn('flex items-start gap-2 text-xs', statusMessage.tone)}>
          <statusMessage.icon className="w-4 h-4 mt-0.5" />
          <span>{statusMessage.text}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="w-4 h-4" />
          <span>Fast insured shipping across India.</span>
        </div>
      )}
    </div>
  );
}

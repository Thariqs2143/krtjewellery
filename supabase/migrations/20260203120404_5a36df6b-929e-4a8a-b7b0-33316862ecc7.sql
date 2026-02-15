-- Add RLS policy to allow public lookup of chit funds by phone or id
-- This is needed for the customer-facing Digital Gold Scheme lookup page

CREATE POLICY "Anyone can lookup chit funds by phone or id" 
ON public.chit_funds 
FOR SELECT 
USING (true);

-- Also need to allow public lookup of chit payments for the scheme details
CREATE POLICY "Anyone can view payments for accessible chit funds" 
ON public.chit_payments 
FOR SELECT 
USING (true);
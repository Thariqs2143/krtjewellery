-- Fix the overly permissive enquiries INSERT policy
-- Drop the old policy and create a more restrictive one
DROP POLICY IF EXISTS "Anyone can create enquiries" ON public.enquiries;

-- Allow authenticated users to create enquiries with their user_id
-- Allow unauthenticated users to create enquiries (for contact forms) with null user_id
CREATE POLICY "Authenticated users can create enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );
-- Add INSERT policy for users table
-- This allows users to create their own record in public.users
-- Required for social auth and automatic user sync

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Also add a policy for service role to insert users (for triggers and background jobs)
-- This is needed when the trigger creates users or when ensureUserExists runs
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT 
  WITH CHECK (true);


-- Take EXECUTE on the helper functions away from anonymous callers.
--
-- 0001 revoked these "from public", which does not remove the separate grant
-- Supabase issues to the `anon` role by default for new functions in the public
-- schema. The result was that a signed-out caller could invoke both functions.
--
-- Neither was exploitable — current_app_role() only ever returns the caller's
-- own role (null when signed out), and set_user_role() refuses anyone who is
-- not already an admin — but a function that is not meant to be reachable
-- should not be reachable.

revoke all on function public.current_app_role() from anon;
revoke all on function public.set_user_role(text, public.app_role) from anon;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.set_user_role(text, public.app_role) to authenticated;

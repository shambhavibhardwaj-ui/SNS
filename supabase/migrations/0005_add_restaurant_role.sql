-- A fourth role: the restaurant owner.
--
-- Onboarding needs an actor the platform did not have. A customer orders, an
-- admin reviews, a delivery partner rides — nobody owned the restaurant's own
-- side of the application. This is that person: they fill the form, choose a
-- delivery model, upload documents, and watch the decision come back.
--
-- ---------------------------------------------------------------------------
-- RUN THIS FILE ON ITS OWN, BEFORE 0006.
--
-- Postgres will not let a new enum value be *used* in the same transaction
-- that adds it, and 0006 inserts a row carrying 'restaurant'. Putting both in
-- one file fails with "unsafe use of new value of enum type". That is the only
-- reason this is two migrations instead of one.
-- ---------------------------------------------------------------------------

alter type public.app_role add value if not exists 'restaurant';

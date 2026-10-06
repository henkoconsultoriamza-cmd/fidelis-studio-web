
DROP POLICY IF EXISTS "auth ve config" ON public.configuracion_web;
CREATE POLICY "auth ve config" ON public.configuracion_web
FOR SELECT TO authenticated
USING (
  public.puede_admin(barberia_id)
  OR EXISTS (SELECT 1 FROM public.barberias b WHERE b.id = configuracion_web.barberia_id AND b.activa)
);

DROP POLICY IF EXISTS "auth ve horarios" ON public.horarios;
CREATE POLICY "auth ve horarios" ON public.horarios
FOR SELECT TO authenticated
USING (
  public.puede_admin(barberia_id)
  OR EXISTS (SELECT 1 FROM public.barberias b WHERE b.id = horarios.barberia_id AND b.activa)
);

-- Trigger-only functions: never called directly via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.proteger_rol_perfil() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_perfil_rol() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Authorization helpers: not callable by anonymous visitors
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_henko_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mi_barberia_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_henko_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mi_barberia_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_admin(uuid) TO authenticated, service_role;

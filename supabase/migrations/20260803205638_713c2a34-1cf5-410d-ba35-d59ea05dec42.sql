create policy "admins leen imagenes de su barberia"
on storage.objects for select to authenticated
using (
  bucket_id in ('logos','equipo','galeria','promociones','testimonios')
  and public.puede_admin(nullif(split_part(name, '/', 1), '')::uuid)
);

create policy "admins suben imagenes de su barberia"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('logos','equipo','galeria','promociones','testimonios')
  and public.puede_admin(nullif(split_part(name, '/', 1), '')::uuid)
);

create policy "admins actualizan imagenes de su barberia"
on storage.objects for update to authenticated
using (
  bucket_id in ('logos','equipo','galeria','promociones','testimonios')
  and public.puede_admin(nullif(split_part(name, '/', 1), '')::uuid)
)
with check (
  bucket_id in ('logos','equipo','galeria','promociones','testimonios')
  and public.puede_admin(nullif(split_part(name, '/', 1), '')::uuid)
);

create policy "admins borran imagenes de su barberia"
on storage.objects for delete to authenticated
using (
  bucket_id in ('logos','equipo','galeria','promociones','testimonios')
  and public.puede_admin(nullif(split_part(name, '/', 1), '')::uuid)
);

revoke all on function public.update_updated_at_column() from anon, authenticated;
revoke all on function public.sync_perfil_rol() from anon, authenticated;
revoke all on function public.proteger_rol_perfil() from anon, authenticated;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.mi_barberia_id() from anon;
revoke all on function public.is_henko_admin() from anon;

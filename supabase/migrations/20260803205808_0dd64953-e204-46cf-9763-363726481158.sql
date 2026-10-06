create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.perfiles (id, email, nombre, barberia_id)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
          nullif(new.raw_user_meta_data->>'barberia_id','')::uuid)
  on conflict (id) do nothing;
  return new;
end; $function$;

revoke all on function public.handle_new_user() from anon, authenticated;
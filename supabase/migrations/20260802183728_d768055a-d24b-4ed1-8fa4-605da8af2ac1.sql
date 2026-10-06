-- ============ ENUM ============
create type public.app_role as enum ('henko_admin', 'cliente_admin');

-- ============ FUNCIONES BASE ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ BARBERIAS ============
create table public.barberias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique,
  slogan text,
  descripcion text,
  logo_url text,
  favicon_url text,
  telefono text,
  whatsapp text,
  email text,
  direccion text,
  ciudad text,
  provincia text,
  codigo_postal text,
  google_maps_url text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  reserva_url text,
  reserva_texto_boton text,
  reserva_nueva_pestana boolean not null default true,
  color_principal text,
  color_secundario text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.barberias to anon;
grant select, insert, update, delete on public.barberias to authenticated;
grant all on public.barberias to service_role;
alter table public.barberias enable row level security;

-- ============ PERFILES ============
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  barberia_id uuid references public.barberias(id) on delete set null,
  nombre text,
  apellido text,
  email text,
  rol text not null default 'cliente_admin',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.perfiles to authenticated;
grant all on public.perfiles to service_role;
alter table public.perfiles enable row level security;

-- ============ USER ROLES (fuente de verdad) ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_henko_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'henko_admin');
$$;

create or replace function public.mi_barberia_id()
returns uuid language sql stable security definer set search_path = public as $$
  select barberia_id from public.perfiles where id = auth.uid() and activo = true;
$$;

-- puede administrar el contenido de esta barberia
create or replace function public.puede_admin(_barberia_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_henko_admin()
      or (_barberia_id is not null and _barberia_id = public.mi_barberia_id()
          and public.has_role(auth.uid(), 'cliente_admin'));
$$;

-- sincroniza perfiles.rol desde user_roles y evita autoedicion de rol
create or replace function public.sync_perfil_rol()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.perfiles p set rol = coalesce(
    (select r.role::text from public.user_roles r where r.user_id = coalesce(new.user_id, old.user_id)
      order by (r.role = 'henko_admin') desc limit 1), 'cliente_admin')
  where p.id = coalesce(new.user_id, old.user_id);
  return null;
end; $$;
create trigger trg_sync_perfil_rol after insert or update or delete on public.user_roles
  for each row execute function public.sync_perfil_rol();

create or replace function public.proteger_rol_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol and not public.is_henko_admin() then
    new.rol := old.rol;
  end if;
  if new.barberia_id is distinct from old.barberia_id and not public.is_henko_admin() then
    new.barberia_id := old.barberia_id;
  end if;
  return new;
end; $$;
create trigger trg_proteger_rol_perfil before update on public.perfiles
  for each row execute function public.proteger_rol_perfil();

-- ============ SERVICIOS ============
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  nombre text not null,
  descripcion text,
  precio numeric,
  precio_texto text,
  duracion_minutos integer,
  imagen_url text,
  imagen_alt text,
  destacado boolean not null default false,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.servicios to anon;
grant select, insert, update, delete on public.servicios to authenticated;
grant all on public.servicios to service_role;
alter table public.servicios enable row level security;

-- ============ EQUIPO ============
create table public.equipo (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  nombre text not null,
  cargo text,
  especialidad text,
  descripcion text,
  foto_url text,
  foto_alt text,
  instagram_url text,
  instagram_handle text,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.equipo to anon;
grant select, insert, update, delete on public.equipo to authenticated;
grant all on public.equipo to service_role;
alter table public.equipo enable row level security;

-- ============ GALERIA ============
create table public.galeria (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  imagen_url text not null,
  texto_alt text,
  categoria text,
  destacado boolean not null default false,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.galeria to anon;
grant select, insert, update, delete on public.galeria to authenticated;
grant all on public.galeria to service_role;
alter table public.galeria enable row level security;

-- ============ HORARIOS ============
create table public.horarios (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  dia_semana integer not null check (dia_semana between 0 and 6),
  nombre_dia text,
  hora_apertura time,
  hora_cierre time,
  cerrado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (barberia_id, dia_semana)
);
grant select on public.horarios to anon;
grant select, insert, update, delete on public.horarios to authenticated;
grant all on public.horarios to service_role;
alter table public.horarios enable row level security;

-- ============ TESTIMONIOS ============
create table public.testimonios (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  nombre_cliente text not null,
  texto text not null,
  calificacion integer check (calificacion between 1 and 5),
  avatar_url text,
  fuente text,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonios to anon;
grant select, insert, update, delete on public.testimonios to authenticated;
grant all on public.testimonios to service_role;
alter table public.testimonios enable row level security;

-- ============ PROMOCIONES ============
create table public.promociones (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias(id) on delete cascade,
  titulo text not null,
  descripcion text,
  imagen_url text,
  precio_promocional numeric,
  texto_boton text,
  enlace_boton text,
  fecha_inicio date,
  fecha_fin date,
  activa boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.promociones to anon;
grant select, insert, update, delete on public.promociones to authenticated;
grant all on public.promociones to service_role;
alter table public.promociones enable row level security;

-- ============ CONFIGURACION WEB ============
create table public.configuracion_web (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null unique references public.barberias(id) on delete cascade,
  mostrar_servicios boolean not null default true,
  mostrar_equipo boolean not null default true,
  mostrar_galeria boolean not null default true,
  mostrar_testimonios boolean not null default true,
  mostrar_promociones boolean not null default true,
  mostrar_horarios boolean not null default true,
  mostrar_whatsapp boolean not null default true,
  mostrar_reservas boolean not null default true,
  texto_cta_principal text,
  texto_cta_secundario text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.configuracion_web to anon;
grant select, insert, update, delete on public.configuracion_web to authenticated;
grant all on public.configuracion_web to service_role;
alter table public.configuracion_web enable row level security;

-- ============ REGISTRO DE CAMBIOS ============
create table public.registro_cambios (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid references public.barberias(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete set null,
  usuario_nombre text,
  entidad text,
  entidad_id uuid,
  accion text,
  descripcion text,
  created_at timestamptz not null default now()
);
grant select, insert on public.registro_cambios to authenticated;
grant all on public.registro_cambios to service_role;
alter table public.registro_cambios enable row level security;

-- ============ INDICES ============
create index idx_servicios_barberia on public.servicios(barberia_id, orden);
create index idx_equipo_barberia on public.equipo(barberia_id, orden);
create index idx_galeria_barberia on public.galeria(barberia_id, orden);
create index idx_testimonios_barberia on public.testimonios(barberia_id, orden);
create index idx_promociones_barberia on public.promociones(barberia_id, orden);
create index idx_horarios_barberia on public.horarios(barberia_id, dia_semana);
create index idx_registro_barberia on public.registro_cambios(barberia_id, created_at desc);
create index idx_perfiles_barberia on public.perfiles(barberia_id);

-- ============ TRIGGERS updated_at ============
create trigger t1 before update on public.barberias for each row execute function public.update_updated_at_column();
create trigger t2 before update on public.perfiles for each row execute function public.update_updated_at_column();
create trigger t3 before update on public.servicios for each row execute function public.update_updated_at_column();
create trigger t4 before update on public.equipo for each row execute function public.update_updated_at_column();
create trigger t5 before update on public.galeria for each row execute function public.update_updated_at_column();
create trigger t6 before update on public.horarios for each row execute function public.update_updated_at_column();
create trigger t7 before update on public.testimonios for each row execute function public.update_updated_at_column();
create trigger t8 before update on public.promociones for each row execute function public.update_updated_at_column();
create trigger t9 before update on public.configuracion_web for each row execute function public.update_updated_at_column();

-- ============ POLITICAS ============
-- barberias
create policy "publico ve barberias activas" on public.barberias for select to anon using (activa = true);
create policy "admins ven su barberia" on public.barberias for select to authenticated using (public.is_henko_admin() or id = public.mi_barberia_id() or activa = true);
create policy "admins editan su barberia" on public.barberias for update to authenticated using (public.puede_admin(id)) with check (public.puede_admin(id));
create policy "henko crea barberias" on public.barberias for insert to authenticated with check (public.is_henko_admin());
create policy "henko borra barberias" on public.barberias for delete to authenticated using (public.is_henko_admin());

-- perfiles
create policy "ver perfil propio o de mi barberia" on public.perfiles for select to authenticated
  using (id = auth.uid() or public.is_henko_admin());
create policy "editar perfil propio" on public.perfiles for update to authenticated
  using (id = auth.uid() or public.is_henko_admin()) with check (id = auth.uid() or public.is_henko_admin());
create policy "henko crea perfiles" on public.perfiles for insert to authenticated with check (public.is_henko_admin());
create policy "henko borra perfiles" on public.perfiles for delete to authenticated using (public.is_henko_admin());

-- user_roles
create policy "ver roles propios" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_henko_admin());
create policy "henko gestiona roles" on public.user_roles for all to authenticated using (public.is_henko_admin()) with check (public.is_henko_admin());

-- servicios
create policy "publico ve servicios activos" on public.servicios for select to anon
  using (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve servicios" on public.servicios for select to authenticated
  using (public.puede_admin(barberia_id) or (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa)));
create policy "admin gestiona servicios" on public.servicios for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- equipo
create policy "publico ve equipo activo" on public.equipo for select to anon
  using (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve equipo" on public.equipo for select to authenticated
  using (public.puede_admin(barberia_id) or (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa)));
create policy "admin gestiona equipo" on public.equipo for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- galeria
create policy "publico ve galeria activa" on public.galeria for select to anon
  using (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve galeria" on public.galeria for select to authenticated
  using (public.puede_admin(barberia_id) or (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa)));
create policy "admin gestiona galeria" on public.galeria for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- horarios
create policy "publico ve horarios" on public.horarios for select to anon
  using (exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve horarios" on public.horarios for select to authenticated using (true);
create policy "admin gestiona horarios" on public.horarios for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- testimonios
create policy "publico ve testimonios activos" on public.testimonios for select to anon
  using (activo = true and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve testimonios" on public.testimonios for select to authenticated
  using (public.puede_admin(barberia_id) or activo = true);
create policy "admin gestiona testimonios" on public.testimonios for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- promociones
create policy "publico ve promos vigentes" on public.promociones for select to anon
  using (activa = true
    and (fecha_inicio is null or fecha_inicio <= current_date)
    and (fecha_fin is null or fecha_fin >= current_date)
    and exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve promos" on public.promociones for select to authenticated
  using (public.puede_admin(barberia_id) or activa = true);
create policy "admin gestiona promos" on public.promociones for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- configuracion_web
create policy "publico ve config" on public.configuracion_web for select to anon
  using (exists (select 1 from public.barberias b where b.id = barberia_id and b.activa));
create policy "auth ve config" on public.configuracion_web for select to authenticated using (true);
create policy "admin gestiona config" on public.configuracion_web for all to authenticated
  using (public.puede_admin(barberia_id)) with check (public.puede_admin(barberia_id));

-- registro_cambios
create policy "admin ve registro" on public.registro_cambios for select to authenticated
  using (public.puede_admin(barberia_id));
create policy "admin escribe registro" on public.registro_cambios for insert to authenticated
  with check (public.puede_admin(barberia_id) and usuario_id = auth.uid());

-- ============ PERFIL AUTOMATICO AL REGISTRARSE ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre, barberia_id)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
          (select id from public.barberias order by created_at limit 1))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'cliente_admin')
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ DATOS INICIALES ============
insert into public.barberias (id, nombre, slug, slogan, descripcion, telefono, whatsapp, email, direccion, ciudad, provincia, google_maps_url, instagram_url, reserva_url, reserva_texto_boton, reserva_nueva_pestana, color_principal, color_secundario, logo_url)
values ('11111111-1111-4111-8111-111111111111', 'Distrito Barber Club', 'distrito-barber-club',
  'Corte. Barba. Actitud.',
  'Barbería contemporánea en Mendoza. Cortes clásicos y modernos, barba y styling con atención con turno previo.',
  '+54 261 555 1234', '542615551234', 'hola@distritobarberclub.com',
  'Av. Ejemplo 1234', 'Mendoza', 'Mendoza',
  'https://www.google.com/maps/search/?api=1&query=Av.+Ejemplo+1234+Mendoza+Argentina',
  'https://instagram.com', 'https://example.com/reservas', 'Reservar turno', true,
  '#32ff6a', '#0a0a0a', '/img/logo.svg');

insert into public.configuracion_web (barberia_id, texto_cta_principal, texto_cta_secundario)
values ('11111111-1111-4111-8111-111111111111', 'Reservar turno', 'Ver servicios');

insert into public.servicios (barberia_id, nombre, descripcion, precio, precio_texto, duracion_minutos, imagen_url, imagen_alt, orden) values
('11111111-1111-4111-8111-111111111111','Corte Distrito','Asesoramiento, corte y terminación.',18000,'$18.000',45,'/img/gallery-1.jpg','Nuca con fade prolijo recién terminado en blanco y negro',1),
('11111111-1111-4111-8111-111111111111','Corte + Barba','Servicio completo con perfilado y terminación.',26000,'$26.000',75,'/img/gallery-2.jpg','Barbero perfilando la barba de un cliente con navaja',2),
('11111111-1111-4111-8111-111111111111','Barba','Diseño, perfilado y cuidado.',12000,'$12.000',30,'/img/gallery-6.jpg','Perfil de un cliente con barba diseñada frente al espejo',3),
('11111111-1111-4111-8111-111111111111','Perfilado','Detalles, contornos y terminación precisa.',9000,'$9.000',20,'/img/gallery-4.jpg','Manos del barbero trabajando con peine y tijera',4),
('11111111-1111-4111-8111-111111111111','Experiencia completa','Corte, barba, lavado y styling.',34000,'$34.000',90,'/img/gallery-5.jpg','Cliente relajado con toalla caliente en el sillón de barbería',5);

insert into public.equipo (barberia_id, nombre, cargo, especialidad, descripcion, foto_url, foto_alt, instagram_url, instagram_handle, orden) values
('11111111-1111-4111-8111-111111111111','Mateo','Barbero','Cortes clásicos y fades','Precisión en la máquina y lectura del rostro. Su fade es una firma.','/img/team-mateo.jpg','Retrato en blanco y negro de Mateo, barbero de Distrito Barber Club','https://instagram.com','@mateo.distrito',1),
('11111111-1111-4111-8111-111111111111','Nico','Barbero','Barba y styling','Trabaja la barba como arquitectura: contorno, densidad y proporción.','/img/team-nico.jpg','Retrato en blanco y negro de Nico, especialista en barba','https://instagram.com','@nico.distrito',2),
('11111111-1111-4111-8111-111111111111','Tomás','Barbero','Texturas y tendencias','Cortes con movimiento para pelo difícil. Le encanta el riesgo bien calculado.','/img/team-tomas.jpg','Retrato en blanco y negro de Tomás, barbero de texturas','https://instagram.com','@tomas.distrito',3);

insert into public.galeria (barberia_id, imagen_url, texto_alt, categoria, orden) values
('11111111-1111-4111-8111-111111111111','/img/gallery-1.jpg','Nuca con fade y line-up recién terminado','bw',1),
('11111111-1111-4111-8111-111111111111','/img/gallery-2.jpg','Perfilado de barba con navaja bajo luz cálida','warm',2),
('11111111-1111-4111-8111-111111111111','/img/gallery-3.jpg','Herramientas de barbería sobre una mesada oscura','warm',3),
('11111111-1111-4111-8111-111111111111','/img/gallery-4.jpg','Manos del barbero cortando con tijera y peine','bw',4),
('11111111-1111-4111-8111-111111111111','/img/gallery-5.jpg','Cliente con toalla caliente en el sillón','warm',5),
('11111111-1111-4111-8111-111111111111','/img/gallery-6.jpg','Perfil de cliente con corte y barba terminados','bw',6);

insert into public.horarios (barberia_id, dia_semana, nombre_dia, hora_apertura, hora_cierre, cerrado) values
('11111111-1111-4111-8111-111111111111',1,'Lunes','10:00','20:00',false),
('11111111-1111-4111-8111-111111111111',2,'Martes','10:00','20:00',false),
('11111111-1111-4111-8111-111111111111',3,'Miércoles','10:00','20:00',false),
('11111111-1111-4111-8111-111111111111',4,'Jueves','10:00','20:00',false),
('11111111-1111-4111-8111-111111111111',5,'Viernes','10:00','20:00',false),
('11111111-1111-4111-8111-111111111111',6,'Sábado','09:00','18:00',false),
('11111111-1111-4111-8111-111111111111',0,'Domingo',null,null,true);

insert into public.testimonios (barberia_id, nombre_cliente, texto, calificacion, fuente, orden) values
('11111111-1111-4111-8111-111111111111','Santiago R.','Encontré el corte que venía buscando. La atención y el nivel de detalle hacen la diferencia.',5,'Google',1),
('11111111-1111-4111-8111-111111111111','Marcos L.','Desde que llegás hasta que te vas, todo está pensado. Excelente trabajo.',5,'Google',2),
('11111111-1111-4111-8111-111111111111','Franco M.','Entendieron exactamente lo que quería y el resultado fue mejor de lo esperado.',5,'Google',3);

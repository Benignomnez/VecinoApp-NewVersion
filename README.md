# DomiReviews

DomiReviews es una plataforma para descubrir y reseñar negocios locales en la República Dominicana. Permite a los usuarios buscar lugares, ver detalles, escribir reseñas y crear colecciones de sus lugares favoritos.

## Características

- Búsqueda de negocios locales por categoría, ubicación y palabras clave
- Perfiles detallados de negocios con información, fotos y reseñas
- Sistema de autenticación de usuarios con Supabase
- Creación y gestión de reseñas
- Perfiles de usuario con historial de actividad
- Creación de colecciones personalizadas de lugares
- Diseño responsivo para móvil y escritorio
- Integración con la API de Google Places

## Tecnologías Utilizadas

- **Frontend**: React, Next.js, TypeScript
- **UI Framework**: Material UI
- **Autenticación**: Supabase
- **Datos de Negocios**: API de Google Places
- **Base de Datos**: Supabase

## Requisitos Previos

- Node.js 18.x o superior
- NPM o Yarn
- Cuenta de Supabase
- Clave de API de Google Places

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/domireviews.git
   cd domireviews
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=tu-clave-api-de-google-places
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
domireviews/
├── public/             # Archivos estáticos
├── src/
│   ├── app/            # Páginas de la aplicación (App Router)
│   ├── components/     # Componentes reutilizables
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilidades y configuraciones
│   ├── styles/         # Estilos globales
│   ├── types/          # Definiciones de tipos TypeScript
│   └── utils/          # Funciones de utilidad
├── .env.local          # Variables de entorno locales
├── next.config.js      # Configuración de Next.js
├── package.json        # Dependencias y scripts
└── tsconfig.json       # Configuración de TypeScript
```

## Configuración de Supabase

1. Crear una nueva base de datos en Supabase
2. Ejecutar el siguiente script SQL para crear las tablas necesarias:

```sql
-- Crear la tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Crear la tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    place_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON public.reviews(place_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el campo updated_at en la tabla profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar el campo updated_at en la tabla reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Configurar políticas de seguridad para la tabla profiles

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla profiles
CREATE POLICY "Cualquiera puede ver perfiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Configurar políticas de seguridad para la tabla reviews

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla reviews
CREATE POLICY "Cualquiera puede ver reseñas"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear reseñas"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias reseñas"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias reseñas"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);
```

3. Configurar la autenticación en Supabase:
   - Habilitar los proveedores de autenticación deseados (Email, Google, Facebook, Apple)
   - Configurar las URLs de redirección para OAuth
   - Configurar las plantillas de correo electrónico para la autenticación por email

4. Obtener las credenciales de Supabase (URL y clave anónima) y agregarlas al archivo `.env.local`

## Despliegue

La aplicación puede ser desplegada en Vercel, Netlify u otro proveedor compatible con Next.js.

```bash
npm run build
# o
yarn build
```

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@example.com

Link del Proyecto: [https://github.com/tu-usuario/domireviews](https://github.com/tu-usuario/domireviews) 
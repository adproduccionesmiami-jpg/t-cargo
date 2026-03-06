# PRP: Rediseño Premium de la Pantalla de Login

> **Estado:** 📝 Borrador (Esperando validación de Alain)
> **Prioridad:** 🟡 Media-Alta
> **Dueño:** Alain

---

## 🎯 Objetivo

Transformar la pantalla de login actual en una experiencia visual de alto nivel (Premium) que sea consistente con el resto de la aplicación T-Cargo. El objetivo es transmitir confianza, tecnología y orden desde el primer contacto del usuario.

## 🎨 Especificaciones de Diseño

### 1. Fondo e Inmersión

- **Color base:** Slate 955 (Casi negro) con gradientes radiales sutiles.
- **Efecto Visual:** Un "World Map" sutil en el fondo o elementos geométricos abstractos que evoquen logística y conectividad.
- **Transiciones:** Fade-in suave al cargar la página.

### 2. Tarjeta de Login (Glassmorphism)

- **Cuerpo:** Fondo semi-transparente con desenfoque de fondo (`backdrop-blur-xl`).
- **Borde:** Borde fino de 1px con gradiente sutil de blanco a transparente.
- **Sombra:** Sombra profunda y suave para dar profundidad.

### 3. Identidad Visual

- **Logo:** Un icono de camión/carga minimalista en color **Amber 500**.
- **Tipografía:** Títulos en Negrita (Black) con tracking (espaciado entre letras) ajustado.

### 4. Formulario e Interacción

- **Inputs:** Fondo oscuro sutil, bordes redondeados (3xl) y bordes color Amber 500 en estado `:focus`.
- **Botón Primary:** Color Amber 500, con efecto hover de brillo y escalado sutil.
- **Loading State:** Spinner minimalista y desactivación de inputs durante el proceso.

## 🛠️ Especificaciones Técnicas

- **Tecnología:** Tailwind CSS y Lucide Icons.
- **Rutas:** Mantenimiento de la ruta `/login` actual.
- **Auth Logic:** Se mantiene intacta la comunicación con Supabase Auth.

---

## ✅ Criterios de Aceptación

1. La pantalla debe sentirse "Premium" y "Consistente" con el dashboard.
2. Debe ser 100% responsiva (móvil y desktop).
3. La lógica de autenticación debe seguir funcionando sin cambios.

---

## 📍 Estado del proyecto

- ✅ **Viajes:** Terminados y blindados.
- ✅ **Buscador/CSV:** Listos.
- 📌 **Estado actual:** Rediseño de Login propuesto.
- ▶️ **Siguiente paso:** Alain valida el rediseño para proceder con la implementación.

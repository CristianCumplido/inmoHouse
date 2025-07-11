# InmoHouse 🏠

Una aplicación web moderna para la gestión inmobiliaria desarrollada con Angular 16.2.16, diseñada para facilitar la búsqueda, gestión y administración de propiedades inmobiliarias.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Uso](#uso)
- [Testing](#testing)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

- **Gestión de Propiedades**: Crear, leer, actualizar y eliminar propiedades inmobiliarias
- **Búsqueda Avanzada**: Filtros por ubicación, precio, tipo de propiedad y más
- **Panel de Administración**: Interfaz intuitiva para gestionar el inventario
- **Responsive Design**: Adaptable a dispositivos móviles y desktop
- **Autenticación**: Sistema de login seguro para usuarios y administradores
- **Dashboard Interactivo**: Métricas y estadísticas en tiempo real

## 🛠️ Tecnologías

- **Frontend**: Angular 16.2.16
- **Testing**: Jest
- **CSS**: SCSS/CSS3
- **TypeScript**: ES2022
- **Package Manager**: npm
- **Build Tool**: Angular CLI

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── application/          # Lógica de aplicación y casos de uso
│   ├── core/                 # Servicios principales, guards e interceptors
│   ├── environment/          # Configuraciones de entorno
│   ├── infrastructure/       # Servicios de infraestructura y APIs
│   ├── presentation/         # Componentes de UI y páginas
│   └── shared/              # Componentes, pipes y utilidades compartidas
├── assets/                  # Recursos estáticos (imágenes, iconos, etc.)
├── environments/            # Configuraciones de entorno
└── ...
```

### Descripción de Carpetas

- **`application/`**: Contiene la lógica de negocio, casos de uso y servicios de aplicación
- **`core/`**: Módulos principales, guards, interceptors y configuraciones centrales
- **`environment/`**: Configuraciones específicas para diferentes entornos
- **`infrastructure/`**: Implementaciones de servicios externos, APIs y repositorios
- **`presentation/`**: Componentes de interfaz de usuario, páginas y elementos visuales
- **`shared/`**: Elementos reutilizables en toda la aplicación

## 🚀 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v16.2.16)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/CristianCumplido/inmoHouse.git
   cd inmohouse
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

   Edita `environment.ts` con tus configuraciones específicas.

4. **Ejecutar la aplicación**

   ```bash
   ng serve
   ```

5. **Abrir en el navegador**
   Navega a `http://localhost:4200`

## 💻 Uso

### Comandos Principales

```bash
# Desarrollo
ng serve                    # Ejecutar servidor de desarrollo
ng build                    # Build para producción
ng build --configuration=production  # Build optimizado para producción

# Generación de código
ng generate component nombre-componente
ng generate service nombre-servicio
ng generate module nombre-modulo

# Linting y formateo
ng lint                     # Verificar código
npm run format              # Formatear código
```

### Configuración de Entornos

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  apiKey: "tu-api-key-aqui",
};
```

## 🧪 Testing

Este proyecto utiliza **Jest** como framework de testing para garantizar la calidad del código.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests específicos
npm test -- --testNamePattern="nombre-del-test"
```

### Estructura de Tests

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── api.service.spec.ts
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── property-card/
│   │   │   │   ├── property-card.component.ts
│   │   │   │   └── property-card.component.spec.ts
```

### Configuración de Jest

```javascript
// jest.config.js
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: ["src/app/**/*.ts", "!src/app/**/*.spec.ts", "!src/app/**/index.ts"],
  coverageReporters: ["html", "text-summary", "lcov"],
};
```

## 🔧 Desarrollo

### Convenciones de Código

- **Naming**: Utilizar camelCase para variables y métodos, PascalCase para clases
- **Estructura**: Seguir la arquitectura de carpetas establecida
- **Commits**: Usar conventional commits (feat, fix, docs, etc.)

### Arquitectura

El proyecto sigue una arquitectura limpia con separación de responsabilidades:

- **Presentation Layer**: Componentes Angular y lógica de UI
- **Application Layer**: Casos de uso y lógica de aplicación
- **Infrastructure Layer**: Servicios externos y persistencia
- **Core Layer**: Configuraciones y servicios centrales

### Guía de Estilo

```typescript
// Ejemplo de componente
@Component({
  selector: "app-property-card",
  templateUrl: "./property-card.component.html",
  styleUrls: ["./property-card.component.scss"],
})
export class PropertyCardComponent implements OnInit {
  @Input() property: Property;
  @Output() propertySelected = new EventEmitter<Property>();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    // Lógica de inicialización
  }

  onSelectProperty(): void {
    this.propertySelected.emit(this.property);
  }
}
```

## 📈 Scripts Disponibles

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "jest --coverage --silent --detectOpenHandles",
    "test:console": "jest --coverage --detectOpenHandles "
  }
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Proceso de Code Review

- Todos los PRs requieren al menos 1 revisión
- Los tests deben pasar antes del merge
- Seguir las convenciones de código establecidas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Email**: cristian.cumplido@pragma.com.co
- **Issues**: [GitHub Issues](https://github.com/CristianCumplido/inmoHouse/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/CristianCumplido/inmoHouse/wiki)

---

**InmoHouse** - Desarrollado con ❤️ usando Angular 16.2.16

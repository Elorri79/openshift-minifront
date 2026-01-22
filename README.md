# Consola de OpenShift - Simplificada

Una aplicación web simplificada para administración de OpenShift con enfoque en seguridad y red.

## Funcionalidades

### ✅ Namespaces

- Crear nuevos namespaces
- Listar y gestionar namespaces existentes
- Eliminar namespaces
- Asignar etiquetas y descripciones

### ✅ Gestión de Usuarios

- Crear nuevos usuarios
- Asignar roles a usuarios
- Gestionar estado de usuarios (Active/Inactive)
- Eliminar usuarios

### ✅ Roles RBAC

- Crear roles personalizados
- Definir recursos y verbos
- Crear ClusterRoles y Roles
- Eliminar roles

### ✅ Network Policies

- Crear políticas de red (Allow/Deny)
- Configurar pod selectors
- Gestionar ingress/egress
- Eliminar políticas

### ✅ Egress IPs

- Asignar IPs de salida
- Asociar a nodos específicos
- Gestionar pools de egress
- Eliminar egress IPs

## Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con variables CSS
- **JavaScript (ES6+)**: Funcionalidad interactiva
- **Font Awesome**: Iconografía
- **Google Fonts (Inter)**: Tipografía

## Instalación

### Opción 1: Abrir directamente

1. Abre `index.html` en tu navegador
2. La aplicación funciona offline

### Opción 2: Servidor local

```bash
cd openshift-frontend
python3 -m http.server 8000
# Abrir: http://localhost:8000
```

## Conexión con OpenShift Real

### 1. Configurar URL del Cluster

Edita `api-integration.js`:

```javascript
this.baseURL = 'https://tu-cluster-openshift.com:6443';
```

### 2. Autenticación

La aplicación soporta autenticación con token:

```javascript
openshiftAPI.setToken('tu-token-aqui');
```

### 3. Obtener Token

```bash
# Desde la consola web de OpenShift
oc whoami -t
```

## API Soportada

### Endpoints

- **Namespaces**: `/api/v1/namespaces`
- **Users**: `/apis/user.openshift.io/v1/users`
- **Roles**: `/apis/rbac.authorization.k8s.io/v1/clusterroles`
- **Network Policies**: `/apis/networking.k8s.io/v1/networkpolicies`
- **Egress IPs**: `/apis/network.openshift.io/v1/hostsubnets`

## Estructura

```bash
openshift-frontend/
├── index.html          # Interfaz principal
├── styles.css          # Estilos
├── app.js              # Lógica JavaScript
├── api-integration.js  # Integración API
└── README.md           # Documentación
```

## Modo Demo

La aplicación incluye datos simulados para pruebas. Para conectar con un cluster real, configura la autenticación en `api-integration.js`.

## Seguridad

1. **HTTPS obligatorio** para conexiones a OpenShift
2. **Tokens seguros**: Usa tokens de Service Account
3. **RBAC**: Configura permisos mínimos necesarios
4. **CORS**: Configura apropiadamente para desarrollo local

## Licencia

MIT

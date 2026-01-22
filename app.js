// OpenShift Console - Simplified Version with All Fixes

// ==================== GLOBAL DATA ====================
const appData = {
    namespaces: [
        { name: 'default', status: 'Active', labels: { environment: 'production' }, resources: 12 },
        { name: 'kube-system', status: 'Active', labels: { 'k8s-app': 'kubernetes' }, resources: 45 },
        { name: 'kube-public', status: 'Active', labels: {}, resources: 3 },
        { name: 'my-project', status: 'Active', labels: { team: 'devops' }, resources: 18 },
        { name: 'analytics', status: 'Active', labels: { department: 'data' }, resources: 8 }
    ],
    users: [
        { username: 'admin', email: 'admin@example.com', roles: ['cluster-admin'], status: 'Active', lastLogin: '2 min ago' },
        { username: 'developer1', email: 'dev1@example.com', roles: ['developer', 'view'], status: 'Active', lastLogin: '1 hour ago' },
        { username: 'developer2', email: 'dev2@example.com', roles: ['developer'], status: 'Active', lastLogin: '3 hours ago' },
        { username: 'devops1', email: 'devops@example.com', roles: ['admin', 'edit'], status: 'Active', lastLogin: '30 min ago' },
        { username: 'readonly1', email: 'readonly@example.com', roles: ['view'], status: 'Inactive', lastLogin: '2 days ago' }
    ],
    roles: [
        { name: 'cluster-admin', type: 'ClusterRole', resources: '*', verbs: '*', description: 'Full access to all resources' },
        { name: 'admin', type: 'ClusterRole', resources: '*', verbs: '*', description: 'Full access to namespace resources' },
        { name: 'developer', type: 'ClusterRole', resources: 'pods,services,deployments', verbs: 'get,list,watch,create,update', description: 'Developer access' },
        { name: 'view', type: 'ClusterRole', resources: '*', verbs: 'get,list,watch', description: 'Read-only access' },
        { name: 'edit', type: 'ClusterRole', resources: '*', verbs: 'get,list,watch,create,update,patch', description: 'Edit access' }
    ],
    networkPolicies: [
        { name: 'default-deny', namespace: 'my-project', type: 'Deny', podSelector: 'all', status: 'Active' },
        { name: 'allow-same-namespace', namespace: 'my-project', type: 'Allow', podSelector: 'all', status: 'Active' },
        { name: 'allow-database', namespace: 'my-project', type: 'Allow', podSelector: 'app=database', status: 'Active' },
        { name: 'restrict-ingress', namespace: 'analytics', type: 'Deny', podSelector: 'all', status: 'Active' }
    ],
    egressIPs: [
        { ip: '10.0.1.100', namespace: 'my-project', node: 'worker-1', type: 'Assigned', status: 'Active' },
        { ip: '10.0.1.101', namespace: 'analytics', node: 'worker-2', type: 'Assigned', status: 'Active' },
        { ip: '10.0.1.102', namespace: 'default', node: 'worker-1', type: 'Reserved', status: 'Inactive' }
    ]
};

// ==================== UTILITY FUNCTIONS ====================
function parseLabels(labelsString) {
    if (!labelsString) return {};
    const labels = {};
    labelsString.split(',').forEach(label => {
        const [key, value] = label.split('=');
        if (key && value) labels[key.trim()] = value.trim();
    });
    return labels;
}

function formatLabels(labels) {
    if (!labels || Object.keys(labels).length === 0) return '-';
    return Object.entries(labels).map(([k, v]) => `${k}=${v}`).join(', ');
}

// ==================== DOM ELEMENTS ====================
let sidebar, mainContent, menuToggle, modalOverlay, modal, modalTitle, modalBody, modalSubmit, toastContainer, currentSection;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    initializeElements();
    initializeNavigation();
    initializeMenuToggle();
    showSection('dashboard');
    updateDashboardStats();
});

function initializeElements() {
    sidebar = document.getElementById('sidebar');
    mainContent = document.getElementById('mainContent');
    menuToggle = document.getElementById('menuToggle');
    modalOverlay = document.getElementById('modalOverlay');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modalTitle');
    modalBody = document.getElementById('modalBody');
    modalSubmit = document.getElementById('modalSubmit');
    toastContainer = document.getElementById('toastContainer');
    currentSection = document.getElementById('currentSection');
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.parentElement.getAttribute('data-section');
            showSection(section);
        });
    });
}

function initializeMenuToggle() {
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('mobile-open');
            mainContent.classList.toggle('expanded');
        });
    }
}

// ==================== NAVIGATION ====================
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Update breadcrumb
    const sectionTitles = {
        'dashboard': 'Dashboard',
        'namespaces': 'Namespaces',
        'users': 'Usuarios',
        'roles': 'Roles',
        'networkpolicies': 'Network Policies',
        'egressips': 'Egress IPs'
    };

    if (currentSection) {
        currentSection.textContent = sectionTitles[sectionName] || 'Dashboard';
    }

    // Load section data
    loadSectionData(sectionName);

    // Close sidebar on mobile
    if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('mobile-open');
        mainContent.classList.remove('expanded');
    }
}

// ==================== LOAD SECTION DATA ====================
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'namespaces': renderNamespaces(); break;
        case 'users': renderUsers(); break;
        case 'roles': renderRoles(); break;
        case 'networkpolicies': renderNetworkPolicies(); break;
        case 'egressips': renderEgressIPs(); break;
        case 'dashboard': updateDashboardStats(); break;
    }
}

function updateDashboardStats() {
    const namespaceCount = document.getElementById('namespaceCount');
    const userCount = document.getElementById('userCount');
    const roleCount = document.getElementById('roleCount');
    const policyCount = document.getElementById('policyCount');

    if (namespaceCount) namespaceCount.textContent = appData.namespaces.length;
    if (userCount) userCount.textContent = appData.users.length;
    if (roleCount) roleCount.textContent = appData.roles.length;
    if (policyCount) policyCount.textContent = appData.networkPolicies.length;
}

// ==================== RENDER FUNCTIONS ====================
function renderNamespaces() {
    const tbody = document.getElementById('namespacesTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    appData.namespaces.forEach(ns => {
        const labels = formatLabels(ns.labels);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fas fa-cube"></i>${escapeHtml(ns.name)}</td>
            <td><span class="status-badge active">${ns.status}</span></td>
            <td>${escapeHtml(labels)}</td>
            <td>${ns.resources}</td>
            <td>
                <button class="action-table-btn" title="Ver" onclick="viewNamespace('${escapeHtml(ns.name)}')"><i class="fas fa-eye"></i></button>
                <button class="action-table-btn" title="Eliminar" onclick="deleteNamespace('${escapeHtml(ns.name)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUsers() {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    appData.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fas fa-user"></i>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.roles.join(', ')}</td>
            <td><span class="status-badge ${user.status === 'Active' ? 'active' : 'warning'}">${user.status}</span></td>
            <td>${user.lastLogin}</td>
            <td>
                <button class="action-table-btn" title="Ver" onclick="viewUser('${escapeHtml(user.username)}')"><i class="fas fa-eye"></i></button>
                <button class="action-table-btn danger" title="Eliminar" onclick="deleteUser('${escapeHtml(user.username)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRoles() {
    const tbody = document.getElementById('rolesTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    appData.roles.forEach(role => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fas fa-user-tag"></i>${escapeHtml(role.name)}</td>
            <td><span class="type-badge">${role.type}</span></td>
            <td>${escapeHtml(role.resources)}</td>
            <td>${escapeHtml(role.verbs)}</td>
            <td>${escapeHtml(role.description)}</td>
            <td>
                <button class="action-table-btn" title="Ver" onclick="viewRole('${escapeHtml(role.name)}')"><i class="fas fa-eye"></i></button>
                <button class="action-table-btn danger" title="Eliminar" onclick="deleteRole('${escapeHtml(role.name)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderNetworkPolicies() {
    const tbody = document.getElementById('networkPoliciesTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    appData.networkPolicies.forEach(policy => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fas fa-shield-alt"></i>${escapeHtml(policy.name)}</td>
            <td>${escapeHtml(policy.namespace)}</td>
            <td><span class="type-badge">${policy.type}</span></td>
            <td>${escapeHtml(policy.podSelector)}</td>
            <td><span class="status-badge active">${policy.status}</span></td>
            <td>
                <button class="action-table-btn" title="Ver" onclick="viewNetworkPolicy('${escapeHtml(policy.name)}')"><i class="fas fa-eye"></i></button>
                <button class="action-table-btn danger" title="Eliminar" onclick="deleteNetworkPolicy('${escapeHtml(policy.name)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderEgressIPs() {
    const tbody = document.getElementById('egressIPsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    appData.egressIPs.forEach(eip => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fas fa-ip"></i>${escapeHtml(eip.ip)}</td>
            <td>${escapeHtml(eip.namespace)}</td>
            <td>${escapeHtml(eip.node)}</td>
            <td><span class="type-badge">${eip.type}</span></td>
            <td><span class="status-badge ${eip.status === 'Active' ? 'active' : 'warning'}">${eip.status}</span></td>
            <td>
                <button class="action-table-btn" title="Ver" onclick="viewEgressIP('${escapeHtml(eip.ip)}')"><i class="fas fa-eye"></i></button>
                <button class="action-table-btn danger" title="Eliminar" onclick="deleteEgressIP('${escapeHtml(eip.ip)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== CRUD OPERATIONS ====================
// Namespaces
function createNamespace(name, description) {
    appData.namespaces.push({
        name: name,
        status: 'Active',
        labels: { description: description },
        resources: 0
    });
    showToast('success', `Namespace "${name}" creado`);
    renderNamespaces();
    updateDashboardStats();
}

function deleteNamespace(name) {
    if (confirm(`Eliminar namespace "${name}"?`)) {
        appData.namespaces = appData.namespaces.filter(ns => ns.name !== name);
        showToast('success', `Namespace "${name}" eliminado`);
        renderNamespaces();
        updateDashboardStats();
    }
}

function viewNamespace(name) {
    const ns = appData.namespaces.find(n => n.name === name);
    showToast('info', `Namespace: ${name}<br>Estado: ${ns?.status}<br>Labels: ${formatLabels(ns?.labels)}`);
}

// Users
function createUser(username, email, role) {
    appData.users.push({
        username: username,
        email: email,
        roles: [role],
        status: 'Active',
        lastLogin: 'Just now'
    });
    showToast('success', `Usuario "${username}" creado`);
    renderUsers();
    updateDashboardStats();
}

function deleteUser(username) {
    if (confirm(`Eliminar usuario "${username}"?`)) {
        appData.users = appData.users.filter(u => u.username !== username);
        showToast('success', `Usuario "${username}" eliminado`);
        renderUsers();
        updateDashboardStats();
    }
}

function viewUser(username) {
    const user = appData.users.find(u => u.username === username);
    showToast('info', `Usuario: ${username}<br>Email: ${user?.email}<br>Roles: ${user?.roles.join(', ')}`);
}

// Roles
function createRole(name, type, resources, verbs, description) {
    appData.roles.push({
        name: name,
        type: type,
        resources: resources,
        verbs: verbs,
        description: description
    });
    showToast('success', `Role "${name}" creado`);
    renderRoles();
    updateDashboardStats();
}

function deleteRole(name) {
    if (confirm(`Eliminar role "${name}"?`)) {
        appData.roles = appData.roles.filter(r => r.name !== name);
        showToast('success', `Role "${name}" eliminado`);
        renderRoles();
        updateDashboardStats();
    }
}

function viewRole(name) {
    const role = appData.roles.find(r => r.name === name);
    showToast('info', `Role: ${name}<br>Tipo: ${role?.type}<br>Recursos: ${role?.resources}<br>Verbos: ${role?.verbs}`);
}

// Network Policies
function createNetworkPolicy(name, namespace, type, podSelector) {
    appData.networkPolicies.push({
        name: name,
        namespace: namespace,
        type: type,
        podSelector: podSelector,
        status: 'Active'
    });
    showToast('success', `Network Policy "${name}" creada`);
    renderNetworkPolicies();
    updateDashboardStats();
}

function deleteNetworkPolicy(name) {
    if (confirm(`Eliminar policy "${name}"?`)) {
        appData.networkPolicies = appData.networkPolicies.filter(p => p.name !== name);
        showToast('success', `Policy "${name}" eliminada`);
        renderNetworkPolicies();
        updateDashboardStats();
    }
}

function viewNetworkPolicy(name) {
    const policy = appData.networkPolicies.find(p => p.name === name);
    showToast('info', `Policy: ${name}<br>Namespace: ${policy?.namespace}<br>Tipo: ${policy?.type}`);
}

// Egress IPs
function createEgressIP(ip, namespace, node, type) {
    appData.egressIPs.push({
        ip: ip,
        namespace: namespace,
        node: node,
        type: type,
        status: 'Active'
    });
    showToast('success', `Egress IP "${ip}" creada`);
    renderEgressIPs();
    updateDashboardStats();
}

function deleteEgressIP(ip) {
    if (confirm(`Eliminar Egress IP "${ip}"?`)) {
        appData.egressIPs = appData.egressIPs.filter(e => e.ip !== ip);
        showToast('success', `Egress IP "${ip}" eliminada`);
        renderEgressIPs();
        updateDashboardStats();
    }
}

function viewEgressIP(ip) {
    const eip = appData.egressIPs.find(e => e.ip === ip);
    showToast('info', `IP: ${ip}<br>Namespace: ${eip?.namespace}<br>Nodo: ${eip?.node}<br>Tipo: ${eip?.type}`);
}

// ==================== MODAL FUNCTIONS ====================
function showModal(modalType) {
    const modalConfigs = {
        'newNamespace': {
            title: 'Crear Nuevo Namespace',
            content: `
                <form id="newNamespaceForm" onsubmit="return false;">
                    <div class="form-group">
                        <label for="namespaceName">Nombre</label>
                        <input type="text" id="namespaceName" placeholder="mi-namespace" required pattern="[a-z0-9-]+">
                    </div>
                    <div class="form-group">
                        <label for="namespaceDescription">Descripción</label>
                        <textarea id="namespaceDescription" placeholder="Descripción..." rows="3"></textarea>
                    </div>
                </form>
            `,
            submitText: 'Crear Namespace',
            onSubmit: function () {
                const name = document.getElementById('namespaceName').value.trim();
                const description = document.getElementById('namespaceDescription').value.trim();
                if (name) {
                    createNamespace(name, description);
                    closeModal();
                }
            }
        },
        'newUser': {
            title: 'Crear Nuevo Usuario',
            content: `
                <form id="newUserForm" onsubmit="return false;">
                    <div class="form-group">
                        <label for="username">Nombre de Usuario</label>
                        <input type="text" id="username" placeholder="username" required>
                    </div>
                    <div class="form-group">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" placeholder="user@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="userRole">Rol</label>
                        <select id="userRole" required>
                            <option value="">Seleccionar rol...</option>
                            ${appData.roles.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
                        </select>
                    </div>
                </form>
            `,
            submitText: 'Crear Usuario',
            onSubmit: function () {
                const username = document.getElementById('username').value.trim();
                const email = document.getElementById('userEmail').value.trim();
                const role = document.getElementById('userRole').value;
                if (username && email && role) {
                    createUser(username, email, role);
                    closeModal();
                }
            }
        },
        'newRole': {
            title: 'Crear Nuevo Role',
            content: `
                <form id="newRoleForm" onsubmit="return false;">
                    <div class="form-group">
                        <label for="roleName">Nombre</label>
                        <input type="text" id="roleName" placeholder="mi-role" required>
                    </div>
                    <div class="form-group">
                        <label for="roleType">Tipo</label>
                        <select id="roleType" required>
                            <option value="ClusterRole">ClusterRole</option>
                            <option value="Role">Role</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="roleResources">Recursos</label>
                        <input type="text" id="roleResources" placeholder="pods,services,deployments" required>
                    </div>
                    <div class="form-group">
                        <label for="roleVerbs">Verbos</label>
                        <input type="text" id="roleVerbs" placeholder="get,list,watch" required>
                    </div>
                </form>
            `,
            submitText: 'Crear Role',
            onSubmit: function () {
                const name = document.getElementById('roleName').value.trim();
                const type = document.getElementById('roleType').value;
                const resources = document.getElementById('roleResources').value.trim();
                const verbs = document.getElementById('roleVerbs').value.trim();
                if (name && resources && verbs) {
                    createRole(name, type, resources, verbs, '');
                    closeModal();
                }
            }
        },
        'newNetworkPolicy': {
            title: 'Crear Network Policy',
            content: `
                <form id="newNetworkPolicyForm" onsubmit="return false;">
                    <div class="form-group">
                        <label for="policyName">Nombre</label>
                        <input type="text" id="policyName" placeholder="mi-policy" required>
                    </div>
                    <div class="form-group">
                        <label for="policyNamespace">Namespace</label>
                        <select id="policyNamespace" required>
                            <option value="">Seleccionar...</option>
                            ${appData.namespaces.map(ns => `<option value="${ns.name}">${ns.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="policyType">Tipo</label>
                        <select id="policyType" required>
                            <option value="Allow">Allow</option>
                            <option value="Deny">Deny</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="policyPodSelector">Pod Selector</label>
                        <input type="text" id="policyPodSelector" placeholder="app=myapp" required>
                    </div>
                </form>
            `,
            submitText: 'Crear Policy',
            onSubmit: function () {
                const name = document.getElementById('policyName').value.trim();
                const namespace = document.getElementById('policyNamespace').value;
                const type = document.getElementById('policyType').value;
                const podSelector = document.getElementById('policyPodSelector').value.trim();
                if (name && namespace && podSelector) {
                    createNetworkPolicy(name, namespace, type, podSelector);
                    closeModal();
                }
            }
        },
        'newEgressIP': {
            title: 'Crear Egress IP',
            content: `
                <form id="newEgressIPForm" onsubmit="return false;">
                    <div class="form-group">
                        <label for="egressIP">IP</label>
                        <input type="text" id="egressIP" placeholder="10.0.1.100" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$">
                    </div>
                    <div class="form-group">
                        <label for="egressNamespace">Namespace</label>
                        <select id="egressNamespace" required>
                            <option value="">Seleccionar...</option>
                            ${appData.namespaces.map(ns => `<option value="${ns.name}">${ns.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="egressNode">Nodo</label>
                        <input type="text" id="egressNode" placeholder="worker-1" required>
                    </div>
                    <div class="form-group">
                        <label for="egressType">Tipo</label>
                        <select id="egressType" required>
                            <option value="Assigned">Assigned</option>
                            <option value="Reserved">Reserved</option>
                        </select>
                    </div>
                </form>
            `,
            submitText: 'Crear Egress IP',
            onSubmit: function () {
                const ip = document.getElementById('egressIP').value.trim();
                const namespace = document.getElementById('egressNamespace').value;
                const node = document.getElementById('egressNode').value.trim();
                const type = document.getElementById('egressType').value;
                if (ip && namespace && node) {
                    createEgressIP(ip, namespace, node, type);
                    closeModal();
                }
            }
        }
    };

    const config = modalConfigs[modalType];
    if (!config) return;

    modalTitle.textContent = config.title;
    modalBody.innerHTML = config.content;
    modalSubmit.textContent = config.submitText;
    modalSubmit.onclick = config.onSubmit;
    modalOverlay.classList.add('active');
}

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(type, message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconClass = {
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle',
        'info': 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="${iconClass[type]} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// ==================== UTILITIES ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================
// Responsive design
window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && sidebar) {
        sidebar.classList.remove('mobile-open');
        mainContent.classList.remove('expanded');
    }
});

// Close modal when clicking overlay
if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ==================== USER MENU FUNCTIONS ====================
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) {
        console.error('userDropdown element not found');
        return;
    }
    dropdown.classList.toggle('active');
}

function closeUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

function viewProfile(e) {
    e.preventDefault();
    closeUserMenu();
    showToast('info', 'Perfil de usuario: admin<br>Email: admin@openshift.local<br>Rol: Cluster Admin');
}

function editSettings(e) {
    e.preventDefault();
    closeUserMenu();
    showToast('info', 'Panel de configuración abierto (funcionalidad en desarrollo)');
}

function logout(e) {
    e.preventDefault();
    closeUserMenu();
    if (confirm('¿Deseas cerrar sesión?')) {
        showToast('success', 'Sesión cerrada. Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenu && userDropdown && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        closeUserMenu();
    }
});

// ==================== EXPORT FUNCTIONS ====================
window.showSection = showSection;
window.showModal = showModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.appData = appData;
window.parseLabels = parseLabels;
window.toggleUserMenu = toggleUserMenu;
window.viewProfile = viewProfile;
window.editSettings = editSettings;
window.logout = logout;


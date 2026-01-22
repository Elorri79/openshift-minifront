// OpenShift API Integration - Simplified Version
// Funcionalidades: Namespaces, Users, Roles, Network Policies, Egress IPs

class OpenShiftAPI {
    constructor() {
        this.baseURL = 'https://api.openshift.example.com:6443';
        this.token = null;
        this.namespace = 'default';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('openshift-token', token);
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) {
                this.handleAuthError();
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API GET error:', error);
            return null;
        }
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            if (response.status === 401) {
                this.handleAuthError();
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API POST error:', error);
            return null;
        }
    }

    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) {
                this.handleAuthError();
                return null;
            }
            return response.ok;
        } catch (error) {
            console.error('API DELETE error:', error);
            return false;
        }
    }

    handleAuthError() {
        this.token = null;
        localStorage.removeItem('openshift-token');
        showToast('error', 'Sesión expirada');
    }

    // Namespaces
    async getNamespaces() {
        return await this.get('/api/v1/namespaces');
    }

    async createNamespace(name, description = '', labels = {}) {
        const namespaceData = {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
                name: name,
                labels: { ...labels, 'openshift.io/description': description }
            }
        };
        return await this.post('/api/v1/namespaces', namespaceData);
    }

    async deleteNamespace(name) {
        return await this.delete(`/api/v1/namespaces/${name}`);
    }

    // Users
    async getUsers() {
        return await this.get('/apis/user.openshift.io/v1/users');
    }

    async createUser(username, email = '') {
        const userData = {
            apiVersion: 'user.openshift.io/v1',
            kind: 'User',
            metadata: { name: username },
            fullName: email
        };
        return await this.post('/apis/user.openshift.io/v1/users', userData);
    }

    async deleteUser(username) {
        return await this.delete(`/apis/user.openshift.io/v1/users/${username}`);
    }

    // Roles
    async getRoles(namespace = null) {
        if (namespace) {
            return await this.get(`/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`);
        }
        return await this.get('/apis/rbac.authorization.k8s.io/v1/clusterroles');
    }

    async createRole(namespace, roleData) {
        const role = {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'Role',
            metadata: { name: roleData.name, namespace: namespace },
            rules: [{
                apiGroups: [''],
                resources: roleData.resources.split(','),
                verbs: roleData.verbs.split(',')
            }]
        };
        return await this.post(`/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`, role);
    }

    async deleteRole(name, namespace) {
        return await this.delete(`/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`);
    }

    // Network Policies
    async getNetworkPolicies(namespace = null) {
        if (namespace) {
            return await this.get(`/apis/networking.k8s.io/v1/namespaces/${namespace}/networkpolicies`);
        }
        return await this.get('/apis/networking.k8s.io/v1/networkpolicies');
    }

    async createNetworkPolicy(namespace, policyData) {
        const policy = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'NetworkPolicy',
            metadata: { name: policyData.name, namespace: namespace },
            spec: {
                podSelector: { matchLabels: this.parseLabels(policyData.podSelector) },
                policyTypes: [policyData.type],
                ingress: policyData.type === 'Allow' ? [{ from: [] }] : [],
                egress: policyData.type === 'Allow' ? [{ to: [] }] : []
            }
        };
        return await this.post(`/apis/networking.k8s.io/v1/namespaces/${namespace}/networkpolicies`, policy);
    }

    async deleteNetworkPolicy(name, namespace) {
        return await this.delete(`/apis/networking.k8s.io/v1/namespaces/${namespace}/networkpolicies/${name}`);
    }

    // Egress IPs
    async getEgressIPs() {
        return await this.get('/apis/network.openshift.io/v1/hostsubnets');
    }

    async assignEgressIP(egressIP, namespace, nodeName) {
        const hostSubnet = await this.get(`/apis/network.openshift.io/v1/hostsubnets/${nodeName}`);
        if (hostSubnet) {
            hostSubnet.spec = hostSubnet.spec || {};
            hostSubnet.spec.egressIPs = hostSubnet.spec.egressIPs || [];
            if (!hostSubnet.spec.egressIPs.includes(egressIP)) {
                hostSubnet.spec.egressIPs.push(egressIP);
                return await this.put(`/apis/network.openshift.io/v1/hostsubnets/${nodeName}`, hostSubnet);
            }
        }
        return null;
    }

    async deleteEgressIP(name, namespace) {
        return await this.delete(`/apis/network.openshift.io/v1/namespaces/${namespace}/egressips/${name}`);
    }

    parseLabels(labelsString) {
        if (!labelsString) return {};
        const labels = {};
        labelsString.split(',').forEach(label => {
            const [key, value] = label.split('=');
            if (key && value) labels[key.trim()] = value.trim();
        });
        return labels;
    }

    setNamespace(namespace) {
        this.namespace = namespace;
        localStorage.setItem('openshift-namespace', namespace);
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/healthz`, {
                headers: this.getAuthHeaders()
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

const openshiftAPI = new OpenShiftAPI();

document.addEventListener('DOMContentLoaded', function () {
    const savedToken = localStorage.getItem('openshift-token');
    const savedNamespace = localStorage.getItem('openshift-namespace');
    if (savedToken) openshiftAPI.setToken(savedToken);
    if (savedNamespace) openshiftAPI.setNamespace(savedNamespace);
});

window.OpenShiftAPI = OpenShiftAPI;
window.openshiftAPI = openshiftAPI;


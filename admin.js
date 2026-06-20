document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const token = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;
    // Route protection
    if (currentPath === '/dashboard' && !token) {
        window.location.href = '/login';
        return;
    }
    if (currentPath === '/login' && token) {
        window.location.href = '/dashboard';
        return;
    }
    // Login logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            const loginBtn = document.getElementById('loginBtn');
            try {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                });
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('adminToken', data.access_token);
                    window.location.href = '/dashboard';
                } else {
                    errorDiv.textContent = 'Invalid email or password';
                    errorDiv.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.classList.remove('d-none');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login to Dashboard';
            }
        });
    }
    // Dashboard logic
    if (currentPath === '/dashboard') {
        const logoutBtn = document.getElementById('logoutBtn');
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        // Fetch Stats
        async function fetchStats() {
            try {
                const response = await fetch('/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) handleUnauthorized();
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('stat-total').textContent = data.total_leads;
                    document.getElementById('stat-today').textContent = data.today_leads;
                    document.getElementById('stat-month').textContent = data.month_leads;
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
        // Fetch Leads
        async function fetchLeads(search = '') {
            try {
                const url = search ? `/api/leads?search=${encodeURIComponent(search)}` : '/api/leads';
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) handleUnauthorized();
                if (response.ok) {
                    const leads = await response.json();
                    renderLeads(leads);
                }
            } catch (error) {
                console.error('Error fetching leads:', error);
            }
        }
        function renderLeads(leads) {
            const tbody = document.getElementById('leadsTableBody');
            tbody.innerHTML = '';
            if (leads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No leads found.</td></tr>';
                return;
            }
            leads.forEach(lead => {
                const date = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-muted small">${date}</td>
                    <td class="fw-medium">${lead.full_name}</td>
                    <td class="small">
                        <a href="mailto:${lead.email}" class="text-primary text-decoration-none">${lead.email}</a><br>
                        <span class="text-muted">${lead.phone}</span>
                    </td>
                    <td class="small">
                        ${lead.college_name}<br>
                        <span class="text-muted">${lead.current_year}</span>
                    </td>
                    <td class="small text-muted">${lead.target_company || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-light rounded-pill view-btn" data-lead='${JSON.stringify(lead).replace(/'/g, "&#39;")}'>View</button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger rounded-pill delete-btn" data-id="${lead.id}">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            // Attach event listeners
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const lead = JSON.parse(e.currentTarget.getAttribute('data-lead'));
                    openMessageModal(lead);
                });
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('Are you sure you want to delete this inquiry?')) {
                        const id = e.currentTarget.getAttribute('data-id');
                        await deleteLead(id);
                    }
                });
            });
        }
        async function deleteLead(id) {
            try {
                const response = await fetch(`/api/leads/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) handleUnauthorized();
                if (response.ok) {
                    fetchStats();
                    fetchLeads(searchInput.value);
                } else {
                    alert('Error deleting lead');
                }
            } catch (error) {
                console.error('Error deleting lead:', error);
            }
        }
        function openMessageModal(lead) {
            document.getElementById('modalName').textContent = `Message from ${lead.full_name}`;
            document.getElementById('modalMessage').textContent = lead.message;
            document.getElementById('modalEmail').textContent = lead.email;
            document.getElementById('modalPhone').textContent = lead.phone;
            document.getElementById('modalMailto').href = `mailto:${lead.email}?subject=Reply to your Inquiry on Ankit DSA`;

            const modal = new bootstrap.Modal(document.getElementById('messageModal'));
            modal.show();
        }
        function handleUnauthorized() {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    fetchLeads(e.target.value);
                }, 300);
            });
        }
        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
            });
        }
        // Initial fetch
        fetchStats();
        fetchLeads();
    }
});

/**
 * Club Event and OD Approval System - Main Application Logic
 * Integrates native fetch API calls with interactive UI and role-based workflows.
 */

// Application State
const state = {
  currentUser: null,
  users: [],
  clubs: [],
  events: [],
  odRequests: [],
  activeTab: 'dashboard',
  searchDebounceTimer: null
};

// Document Ready
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupRoleSwitcher();
  await loadInitialData();
});

// ==================== NAVIGATION & TAB HANDLING ====================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      navigateTo(targetTab);
    });
  });

  // Handle browser back/forward or hash
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'clubs', 'events', 'od', 'users', 'workflow'].includes(hash)) {
      navigateTo(hash, false);
    }
  });

  // Initial tab from hash if present
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && ['dashboard', 'clubs', 'events', 'od', 'users', 'workflow'].includes(initialHash)) {
    navigateTo(initialHash, false);
  }
}

function navigateTo(tabName, updateHash = true) {
  state.activeTab = tabName;

  // Update nav item classes
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update tab pane visibility
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`tab-${tabName}`);
  if (activePane) {
    activePane.classList.add('active');
  }

  // Update page title
  const titles = {
    dashboard: 'Dashboard Overview',
    clubs: 'Clubs & Societies',
    events: 'Club Event Proposals',
    od: 'On-Duty (OD) Leave Applications',
    users: 'Users & Role Directory',
    workflow: 'System Architecture & Workflow Guide'
  };
  document.getElementById('current-page-title').textContent = titles[tabName] || 'Dashboard';

  if (updateHash) {
    window.location.hash = tabName;
  }

  // Refresh tab-specific data
  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'clubs') loadClubs();
  if (tabName === 'events') loadEvents();
  if (tabName === 'od') loadOdRequests();
  if (tabName === 'users') loadUsers();
}

// ==================== INITIAL DATA & USER PERSONA SWITCHER ====================
async function loadInitialData() {
  try {
    await Promise.all([
      loadUsersList(),
      loadClubs(),
      loadDashboard()
    ]);
  } catch (error) {
    console.error('Initial data loading error:', error);
    showToast('Failed to connect to backend server. Make sure server is running.', 'error');
  }
}

async function loadUsersList() {
  try {
    const res = await API.getUsers();
    if (res.success && res.data.length > 0) {
      state.users = res.data;
      renderRoleSwitcherOptions();
      
      // Default to first student if not set
      if (!state.currentUser) {
        state.currentUser = state.users.find(u => u.role === 'student') || state.users[0];
      }
      updateActiveUserUI();
    }
  } catch (err) {
    console.error('Failed to load users for switcher:', err);
  }
}

function renderRoleSwitcherOptions() {
  const select = document.getElementById('current-user-select');
  select.innerHTML = '';

  state.users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    const roleEmoji = user.role === 'student' ? '👨‍🎓' : user.role === 'faculty' ? '👨‍🏫' : user.role === 'hod' ? '👔' : '🏛️';
    option.textContent = `${roleEmoji} ${user.name} (${user.role.toUpperCase()}) - ${user.identifier}`;
    select.appendChild(option);
  });

  if (state.currentUser) {
    select.value = state.currentUser._id;
  }
}

function setupRoleSwitcher() {
  const select = document.getElementById('current-user-select');
  select.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    const selectedUser = state.users.find(u => u._id === selectedId);
    if (selectedUser) {
      state.currentUser = selectedUser;
      updateActiveUserUI();
      showToast(`Switched active persona to ${selectedUser.name} (${selectedUser.role.toUpperCase()})`, 'info');
      
      // Re-render currently visible tables to update action buttons for this role
      if (state.activeTab === 'dashboard') loadDashboard();
      if (state.activeTab === 'events') renderEventsTable();
      if (state.activeTab === 'od') renderOdTable();
    }
  });
}

function updateActiveUserUI() {
  if (!state.currentUser) return;
  const u = state.currentUser;

  // Update top banner
  const bannerName = document.getElementById('banner-user-name');
  if (bannerName) bannerName.textContent = u.name;

  // Update sidebar user card
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) {
    const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    sidebarAvatar.textContent = initials;
    sidebarAvatar.style.backgroundColor = u.avatarColor || '#2563eb';
  }

  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = u.name;

  const sidebarRole = document.getElementById('sidebar-role-badge');
  if (sidebarRole) {
    sidebarRole.textContent = u.role.toUpperCase();
  }

  // Update Role Permissions description box on dashboard
  const roleBox = document.getElementById('role-permission-box');
  if (roleBox) {
    let perms = '';
    if (u.role === 'student') {
      perms = `
        <p><strong>Role:</strong> Student (${u.identifier})</p>
        <p><strong>Department:</strong> ${u.department}</p>
        <p style="margin-top:6px;">You can propose new club events, apply for academic On-Duty (OD) passes, and print verified clearance slips once approved.</p>
      `;
    } else if (u.role === 'faculty') {
      perms = `
        <p><strong>Role:</strong> Faculty Advisor (${u.identifier})</p>
        <p><strong>Department:</strong> ${u.department}</p>
        <p style="margin-top:6px;">You have <strong>Level 1 Verification Authority</strong>. You review and recommend initial student event proposals and OD applications.</p>
      `;
    } else if (u.role === 'hod') {
      perms = `
        <p><strong>Role:</strong> Head of Department (HOD) (${u.identifier})</p>
        <p><strong>Department:</strong> ${u.department}</p>
        <p style="margin-top:6px;">You have <strong>Level 2 Scrutiny Authority</strong>. You verify academic attendance eligibility and forward applications to the Dean.</p>
      `;
    } else if (u.role === 'admin') {
      perms = `
        <p><strong>Role:</strong> Dean of Student Affairs / Admin (${u.identifier})</p>
        <p><strong>Authority:</strong> Full Institutional Sanction & Admin</p>
        <p style="margin-top:6px;">You have <strong>Final Institutional Sanction Authority</strong>. Approving here officially credits attendance to the college ERP.</p>
      `;
    }
    roleBox.innerHTML = perms;
  }
}

// ==================== DASHBOARD TAB ====================
async function loadDashboard() {
  try {
    const res = await API.getDashboardStats();
    if (res.success) {
      const stats = res.stats;
      document.getElementById('stat-clubs').textContent = stats.totalClubs;
      document.getElementById('stat-events-approved').textContent = stats.events.approved;
      document.getElementById('stat-events-pending').textContent = stats.events.pending;
      document.getElementById('stat-od-pending').textContent = stats.od.pending;
      document.getElementById('stat-od-days').textContent = stats.od.totalDaysCredited;

      // Update sidebar badges
      document.getElementById('badge-clubs').textContent = stats.totalClubs;
      document.getElementById('badge-events').textContent = stats.events.total;
      document.getElementById('badge-od').textContent = stats.od.total;

      // Render recent activity logs
      renderRecentActivity(res.recentActivity);
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

function renderRecentActivity(logs = []) {
  const tbody = document.getElementById('dashboard-activity-tbody');
  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No recent activity logs recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => {
    let actionBadge = `<span class="badge" style="background:#f1f5f9; color:#334155;">${log.action}</span>`;
    if (log.action.includes('APPROVED')) actionBadge = `<span class="badge badge-approved">✓ ${log.action}</span>`;
    if (log.action.includes('REJECTED')) actionBadge = `<span class="badge badge-rejected">✕ REJECTED</span>`;
    if (log.action === 'SUBMITTED') actionBadge = `<span class="badge badge-pending_faculty">↑ SUBMITTED</span>`;

    const timeAgo = formatTimeAgo(log.createdAt || log.timestamp);

    return `
      <tr>
        <td><strong>${log.entityType}</strong></td>
        <td>${escapeHtml(log.entityTitle || '-')}</td>
        <td>${actionBadge}</td>
        <td><small>${escapeHtml(log.actorName)} (${log.actorRole.toUpperCase()})</small></td>
        <td style="color: var(--text-muted); font-size: 12px;">${timeAgo}</td>
      </tr>
    `;
  }).join('');
}

// ==================== CLUBS TAB ====================
async function loadClubs() {
  try {
    const res = await API.getClubs();
    if (res.success) {
      state.clubs = res.data;
      renderClubsGrid();
      populateClubDropdowns();
    }
  } catch (error) {
    console.error('Failed to load clubs:', error);
    showToast('Failed to load clubs.', 'error');
  }
}

function renderClubsGrid() {
  const grid = document.getElementById('clubs-grid');
  if (!state.clubs || state.clubs.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No clubs found matching criteria.</div>';
    return;
  }

  const currentUserId = state.currentUser ? state.currentUser._id : null;

  grid.innerHTML = state.clubs.map(club => {
    const advisorName = club.facultyAdvisor ? club.facultyAdvisor.name : 'Unassigned';
    const advisorDept = club.facultyAdvisor ? club.facultyAdvisor.department : '';
    const leadName = club.studentLead ? club.studentLead.name : 'Student Lead Pending';
    const isMember = currentUserId && club.members && club.members.some(m => (m._id || m) === currentUserId);
    const memberCount = (club.members && club.members.length) || 1;

    return `
      <div class="club-card">
        <div class="card-top-strip" style="background: ${club.themeColor || '#3b82f6'};"></div>
        <div class="card-title-row">
          <h3>${escapeHtml(club.name)}</h3>
          <span class="club-code-badge">${escapeHtml(club.code)}</span>
        </div>
        <span class="badge badge-category" style="width: fit-content; margin-bottom: 10px;">${escapeHtml(club.category)}</span>
        <p class="card-desc">${escapeHtml(club.description)}</p>

        <div class="card-meta-list">
          <div class="card-meta-item">
            <span>👨‍🏫 Advisor:</span>
            <strong>${escapeHtml(advisorName)}</strong> <small style="color:var(--text-light)">(${escapeHtml(advisorDept)})</small>
          </div>
          <div class="card-meta-item">
            <span>👨‍🎓 Student Lead:</span>
            <strong>${escapeHtml(leadName)}</strong>
          </div>
          <div class="card-meta-item">
            <span>👥 Registered Members:</span>
            <strong>${memberCount} members</strong>
          </div>
        </div>

        <div class="card-actions">
          ${isMember 
            ? `<span class="badge badge-approved">✓ Joined Member</span>` 
            : `<button class="btn btn-secondary btn-sm" onclick="handleJoinClub('${club._id}')">+ Join Club</button>`
          }
          <div style="margin-left: auto; display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" title="Propose Event for this club" onclick="openCreateEventModal('${club._id}')">+ Propose Event</button>
            ${state.currentUser && state.currentUser.role === 'admin' 
              ? `<button class="btn btn-danger btn-sm" onclick="handleDeleteClub('${club._id}')" title="Delete Club">🗑️</button>` 
              : ''
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleClubSearch() {
  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(async () => {
    const search = document.getElementById('club-search-input').value.trim();
    const category = document.getElementById('club-category-filter').value;
    try {
      const res = await API.getClubs(category, 'all', search);
      if (res.success) {
        state.clubs = res.data;
        renderClubsGrid();
      }
    } catch (e) {
      console.error(e);
    }
  }, 250);
}

function filterClubs() {
  handleClubSearch();
}

async function handleJoinClub(clubId) {
  if (!state.currentUser) {
    showToast('Please select a user persona first.', 'error');
    return;
  }
  try {
    const res = await API.joinClub(clubId, state.currentUser._id);
    if (res.success) {
      showToast(`Successfully joined club!`, 'success');
      await loadClubs();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleDeleteClub(clubId) {
  if (!confirm('Are you sure you want to delete this club?')) return;
  try {
    const res = await API.deleteClub(clubId);
    if (res.success) {
      showToast('Club deleted successfully', 'success');
      await loadClubs();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==================== EVENT PROPOSALS TAB ====================
async function loadEvents() {
  try {
    const status = document.getElementById('event-status-filter').value;
    const clubId = document.getElementById('event-club-filter').value;
    const search = document.getElementById('event-search-input').value.trim();

    const res = await API.getEvents(status, 'all', clubId, search);
    if (res.success) {
      state.events = res.data;
      renderEventsTable();
    }
  } catch (error) {
    console.error('Failed to load events:', error);
    showToast('Failed to load events.', 'error');
  }
}

function renderEventsTable() {
  const tbody = document.getElementById('events-tbody');
  if (!state.events || state.events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No event proposals found.</td></tr>';
    return;
  }

  const currentRole = state.currentUser ? state.currentUser.role : 'student';

  tbody.innerHTML = state.events.map(event => {
    const clubName = event.club ? `${event.club.name} (${event.club.code})` : 'General';
    const dates = `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`;
    const budget = `₹${(event.budget || 0).toLocaleString()}`;
    
    // Status Badge
    let statusBadge = `<span class="badge badge-${event.status}">${formatStatus(event.status)}</span>`;

    // Workflow Stepper Indicator
    const stepper = renderWorkflowStepper(event.status, event.currentStage);

    // Review Actions: determine if current role is eligible to review
    let reviewActions = '';
    const isPending = !['approved', 'rejected'].includes(event.status);
    const canReview = isPending && (currentRole === event.currentStage || currentRole === 'admin');

    if (canReview) {
      reviewActions = `
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-success btn-sm" onclick="openReviewModal('Event', '${event._id}', '${escapeHtml(event.title)}', 'approved')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="openReviewModal('Event', '${event._id}', '${escapeHtml(event.title)}', 'rejected')">Reject</button>
        </div>
      `;
    } else if (event.status === 'approved') {
      reviewActions = `<span style="color:var(--success); font-weight:600; font-size:12px;">✓ Sanctioned</span>`;
    } else if (event.status === 'rejected') {
      reviewActions = `<small style="color:var(--danger); font-size:11px;" title="${escapeHtml(event.rejectionReason)}">✕ Rejected</small>`;
    } else {
      reviewActions = `<small style="color:var(--text-muted); font-size:11px;">Awaiting ${event.currentStage.toUpperCase()}</small>`;
    }

    // Delete button for student organizer or admin
    const canDelete = currentRole === 'admin' || (state.currentUser && event.submittedBy && (event.submittedBy._id || event.submittedBy) === state.currentUser._id);
    const deleteBtn = canDelete ? `<button class="btn btn-secondary btn-sm" onclick="handleDeleteEvent('${event._id}')" title="Delete">🗑️</button>` : '';

    return `
      <tr>
        <td>
          <strong style="color: var(--text-main);">${escapeHtml(event.title)}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">
            Proposed by: ${event.submittedBy ? escapeHtml(event.submittedBy.name) : 'Student'}
          </div>
        </td>
        <td><span class="badge badge-category">${escapeHtml(clubName)}</span></td>
        <td>${escapeHtml(event.category)}</td>
        <td>
          <div>${dates}</div>
          <small style="color: var(--text-muted); font-size: 11.5px;">📍 ${escapeHtml(event.venue)}</small>
        </td>
        <td>
          <div>${budget}</div>
          <small style="color: var(--text-muted); font-size: 11px;">${event.expectedParticipants} attendees</small>
        </td>
        <td>
          <div>${statusBadge}</div>
          ${stepper}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${reviewActions}
            ${deleteBtn}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleEventSearch() {
  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(loadEvents, 250);
}

function filterEvents() {
  loadEvents();
}

async function handleDeleteEvent(eventId) {
  if (!confirm('Are you sure you want to withdraw/delete this event proposal?')) return;
  try {
    const res = await API.deleteEvent(eventId);
    if (res.success) {
      showToast('Event deleted successfully', 'success');
      await loadEvents();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==================== OD (ON DUTY) REQUESTS TAB ====================
async function loadOdRequests() {
  try {
    const status = document.getElementById('od-status-filter').value;
    const department = document.getElementById('od-dept-filter').value;
    const search = document.getElementById('od-search-input').value.trim();

    const res = await API.getOdRequests(status, 'all', department, search);
    if (res.success) {
      state.odRequests = res.data;
      renderOdTable();
    }
  } catch (error) {
    console.error('Failed to load ODs:', error);
    showToast('Failed to load OD applications.', 'error');
  }
}

function renderOdTable() {
  const tbody = document.getElementById('od-tbody');
  if (!state.odRequests || state.odRequests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No OD applications found.</td></tr>';
    return;
  }

  const currentRole = state.currentUser ? state.currentUser.role : 'student';

  tbody.innerHTML = state.odRequests.map(od => {
    const studentName = od.student ? od.student.name : 'Student';
    const dates = `${new Date(od.fromDate).toLocaleDateString()} to ${new Date(od.toDate).toLocaleDateString()}`;
    const statusBadge = `<span class="badge badge-${od.status}">${formatStatus(od.status)}</span>`;
    const stepper = renderWorkflowStepper(od.status, od.currentStage);

    // Review Actions
    let reviewActions = '';
    const isPending = !['approved', 'rejected'].includes(od.status);
    const canReview = isPending && (currentRole === od.currentStage || currentRole === 'admin');

    if (canReview) {
      reviewActions = `
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-success btn-sm" onclick="openReviewModal('OdRequest', '${od._id}', '${escapeHtml(od.odReferenceNumber)} - ${escapeHtml(od.eventTitle)}', 'approved')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="openReviewModal('OdRequest', '${od._id}', '${escapeHtml(od.odReferenceNumber)} - ${escapeHtml(od.eventTitle)}', 'rejected')">Reject</button>
        </div>
      `;
    } else if (od.status === 'approved') {
      reviewActions = `<button class="btn btn-primary btn-sm" onclick="viewOdSlip('${od._id}')">📄 View Slip</button>`;
    } else if (od.status === 'rejected') {
      reviewActions = `<small style="color:var(--danger); font-size:11px;" title="${escapeHtml(od.rejectionReason)}">✕ Rejected</small>`;
    } else {
      reviewActions = `<small style="color:var(--text-muted); font-size:11px;">Stage: ${od.currentStage.toUpperCase()}</small>`;
    }

    const canDelete = currentRole === 'admin' || (state.currentUser && od.student && (od.student._id || od.student) === state.currentUser._id);
    const deleteBtn = canDelete ? `<button class="btn btn-secondary btn-sm" onclick="handleDeleteOd('${od._id}')" title="Delete">🗑️</button>` : '';

    return `
      <tr>
        <td>
          <strong style="color: var(--primary); font-family: monospace; font-size: 13px;">${escapeHtml(od.odReferenceNumber)}</strong>
          <div style="margin-top: 3px;">
            ${od.attendanceCredited ? '<span class="badge badge-approved" style="font-size:10px;">Credited</span>' : ''}
          </div>
        </td>
        <td>
          <strong>${escapeHtml(studentName)}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">${escapeHtml(od.studentRoll)} • ${escapeHtml(od.department)}</div>
        </td>
        <td>
          <strong>${escapeHtml(od.eventTitle)}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">${escapeHtml(od.organizationOrCollege)}</div>
          <span class="badge badge-category" style="margin-top: 3px;">${escapeHtml(od.category)}</span>
        </td>
        <td>
          <div>${dates}</div>
          <strong style="font-size: 12px; color: var(--purple);">${od.totalDays} Day${od.totalDays > 1 ? 's' : ''}</strong>
        </td>
        <td style="max-width: 200px;">
          <div style="font-size: 12px; line-height: 1.4; color: var(--secondary);" title="${escapeHtml(od.reason)}">
            ${escapeHtml(od.reason.length > 70 ? od.reason.substring(0, 70) + '...' : od.reason)}
          </div>
        </td>
        <td>
          <div>${statusBadge}</div>
          ${stepper}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${reviewActions}
            ${deleteBtn}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleOdSearch() {
  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(loadOdRequests, 250);
}

function filterOds() {
  loadOdRequests();
}

async function handleDeleteOd(odId) {
  if (!confirm('Are you sure you want to cancel/delete this OD application?')) return;
  try {
    const res = await API.deleteOd(odId);
    if (res.success) {
      showToast('OD application deleted successfully', 'success');
      await loadOdRequests();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function viewOdSlip(odId) {
  try {
    const res = await API.getOdSlip(odId);
    if (res.success) {
      renderOdSlipModal(res.slipData);
      openModal('modal-od-slip');
    }
  } catch (error) {
    showToast('Failed to generate clearance slip: ' + error.message, 'error');
  }
}

function renderOdSlipModal(slip) {
  const container = document.getElementById('od-slip-modal-body');
  
  const workflowSignatures = (slip.workflow || []).map(step => `
    <div class="signature-box">
      <div class="seal">✓ ${step.action.toUpperCase()}</div>
      <div class="title">${step.stage.toUpperCase()} VERIFICATION</div>
      <div class="officer">${escapeHtml(step.reviewerName || 'Authorized Signatory')}</div>
      <small style="font-size:10px; color:#94a3b8;">${new Date(step.actionDate).toLocaleDateString()}</small>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="od-slip-container" id="printable-od-slip">
      <div class="od-slip-header">
        <h2>Official On-Duty (OD) Clearance Slip</h2>
        <p>Institutional Academic & Attendance Endorsement Form</p>
        <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: var(--primary); margin-top: 6px;">
          REF NO: ${escapeHtml(slip.odReferenceNumber)} | VERIFICATION HASH: ${escapeHtml(slip.verificationHash)}
        </div>
      </div>

      <div class="od-slip-grid">
        <div class="od-slip-row">
          <span class="label">Student Full Name:</span>
          <span class="value">${escapeHtml(slip.studentName)}</span>
        </div>
        <div class="od-slip-row">
          <span class="label">Roll Number:</span>
          <span class="value">${escapeHtml(slip.rollNumber)}</span>
        </div>
        <div class="od-slip-row">
          <span class="label">Department:</span>
          <span class="value">${escapeHtml(slip.department)}</span>
        </div>
        <div class="od-slip-row">
          <span class="label">Event / Activity:</span>
          <span class="value">${escapeHtml(slip.eventTitle)} (${escapeHtml(slip.category)})</span>
        </div>
        <div class="od-slip-row">
          <span class="label">Host Institution & Venue:</span>
          <span class="value">${escapeHtml(slip.hostCollege)} - ${escapeHtml(slip.venue)}</span>
        </div>
        <div class="od-slip-row">
          <span class="label">Sanctioned Leave Duration:</span>
          <span class="value" style="color:var(--success);">${escapeHtml(slip.duration)}</span>
        </div>
      </div>

      <div style="background:#f8fafc; padding: 12px; border-radius: 6px; font-size: 12.5px; border: 1px solid var(--border);">
        <strong>Purpose / Justification:</strong>
        <p style="margin-top: 4px; color: var(--secondary);">${escapeHtml(slip.reason)}</p>
      </div>

      <div style="margin-top: 14px; font-size: 12px; color: var(--success); font-weight: 600;">
        ✓ Attendance Status: Official attendance credit granted to college records.
      </div>

      <div class="od-slip-signatures">
        ${workflowSignatures}
      </div>
    </div>
  `;
}

function printOdSlip() {
  const slipElement = document.getElementById('printable-od-slip');
  if (!slipElement) return;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>OD Clearance Slip</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .od-slip-container { border: 2px solid #333; padding: 20px; border-radius: 8px; }
          .od-slip-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          .od-slip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 15px; }
          .od-slip-signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-top: 1px solid #ccc; padding-top: 15px; margin-top: 15px; text-align: center; }
          .signature-box { border: 1px solid #ddd; padding: 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        ${slipElement.outerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// ==================== USERS & ROLES TAB ====================
async function loadUsers() {
  try {
    const role = document.getElementById('user-role-filter').value;
    const dept = document.getElementById('user-dept-filter').value;
    const search = document.getElementById('user-search-input').value.trim();

    const res = await API.getUsers(role, dept, search);
    if (res.success) {
      state.users = res.data;
      renderUsersTable();
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    showToast('Failed to load user directory.', 'error');
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!state.users || state.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = state.users.map(user => {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const roleEmoji = user.role === 'student' ? '👨‍🎓' : user.role === 'faculty' ? '👨‍🏫' : user.role === 'hod' ? '👔' : '🏛️';
    
    let roleClass = 'badge-category';
    if (user.role === 'admin') roleClass = 'badge-rejected';
    if (user.role === 'faculty') roleClass = 'badge-pending_admin';
    if (user.role === 'hod') roleClass = 'badge-pending_hod';
    if (user.role === 'student') roleClass = 'badge-approved';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: ${user.avatarColor || '#2563eb'}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
              ${initials}
            </div>
            <div>
              <strong>${escapeHtml(user.name)}</strong>
              <div style="font-size: 11.5px; color: var(--text-muted);">${escapeHtml(user.email)}</div>
            </div>
          </div>
        </td>
        <td><strong style="font-family: monospace;">${escapeHtml(user.identifier)}</strong></td>
        <td>${escapeHtml(user.department)}</td>
        <td><span class="badge ${roleClass}">${roleEmoji} ${user.role.toUpperCase()}</span></td>
        <td><small>${escapeHtml(user.phone || '-')}</small></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="handleSelectUserAsPersona('${user._id}')">Switch As</button>
          ${state.currentUser && state.currentUser.role === 'admin' 
            ? `<button class="btn btn-danger btn-sm" onclick="handleDeleteUser('${user._id}')">🗑️</button>` 
            : ''
          }
        </td>
      </tr>
    `;
  }).join('');
}

function handleUserSearch() {
  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(loadUsers, 250);
}

function filterUsers() {
  loadUsers();
}

function handleSelectUserAsPersona(userId) {
  const user = state.users.find(u => u._id === userId);
  if (user) {
    state.currentUser = user;
    document.getElementById('current-user-select').value = user._id;
    updateActiveUserUI();
    showToast(`Switched active persona to ${user.name}`, 'info');
  }
}

async function handleDeleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const res = await API.deleteUser(userId);
    if (res.success) {
      showToast('User deleted successfully', 'success');
      await loadUsers();
      await loadUsersList();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==================== WORKFLOW STEPPER HELPER ====================
function renderWorkflowStepper(status, currentStage) {
  const stages = ['faculty', 'hod', 'admin'];
  const labels = { faculty: 'Faculty', hod: 'HOD', admin: 'Dean/Admin' };

  if (status === 'rejected') {
    return `
      <div class="workflow-stepper">
        <span class="step-node rejected">✕ Rejected</span>
      </div>
    `;
  }

  if (status === 'approved') {
    return `
      <div class="workflow-stepper">
        <span class="step-node completed">✓ Faculty</span>
        <span class="step-divider">→</span>
        <span class="step-node completed">✓ HOD</span>
        <span class="step-divider">→</span>
        <span class="step-node completed">✓ Sanctioned</span>
      </div>
    `;
  }

  // Pending stages
  const currentIdx = stages.indexOf(currentStage);

  return `
    <div class="workflow-stepper">
      ${stages.map((stage, idx) => {
        let nodeClass = 'pending';
        let icon = '○';
        if (idx < currentIdx) {
          nodeClass = 'completed';
          icon = '✓';
        } else if (idx === currentIdx) {
          nodeClass = 'current';
          icon = '⏳';
        }
        return `
          <span class="step-node ${nodeClass}">${icon} ${labels[stage]}</span>
          ${idx < stages.length - 1 ? '<span class="step-divider">→</span>' : ''}
        `;
      }).join('')}
    </div>
  `;
}

// ==================== MODALS & FORM SUBMISSIONS ====================

// 1. Create Club
function openCreateClubModal() {
  populateFacultyDropdown();
  openModal('modal-create-club');
}

function populateFacultyDropdown() {
  const select = document.getElementById('club-form-faculty');
  select.innerHTML = '';
  const facultyMembers = state.users.filter(u => u.role === 'faculty' || u.role === 'hod');
  facultyMembers.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f._id;
    opt.textContent = `${f.name} (${f.department})`;
    select.appendChild(opt);
  });
}

async function handleCreateClub(e) {
  e.preventDefault();
  const name = document.getElementById('club-form-name').value.trim();
  const code = document.getElementById('club-form-code').value.trim();
  const category = document.getElementById('club-form-category').value;
  const facultyAdvisor = document.getElementById('club-form-faculty').value;
  const description = document.getElementById('club-form-desc').value.trim();

  const colors = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#0891b2', '#db2777'];
  const themeColor = colors[Math.floor(Math.random() * colors.length)];

  try {
    const res = await API.createClub({
      name,
      code,
      category,
      facultyAdvisor,
      studentLead: state.currentUser ? state.currentUser._id : null,
      description,
      themeColor
    });

    if (res.success) {
      showToast('Club registered successfully!', 'success');
      closeModal('modal-create-club');
      document.getElementById('form-create-club').reset();
      await loadClubs();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// 2. Create Event
function openCreateEventModal(defaultClubId = null) {
  populateClubDropdowns();
  if (defaultClubId) {
    const clubSelect = document.getElementById('event-form-club');
    if (clubSelect) clubSelect.value = defaultClubId;
  }
  openModal('modal-create-event');
}

function populateClubDropdowns() {
  const selects = [document.getElementById('event-form-club'), document.getElementById('event-club-filter')];
  
  if (selects[0]) {
    selects[0].innerHTML = '';
    state.clubs.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = `${c.name} (${c.code})`;
      selects[0].appendChild(opt);
    });
  }

  if (selects[1]) {
    selects[1].innerHTML = '<option value="all">All Clubs</option>';
    state.clubs.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = `${c.name} (${c.code})`;
      selects[1].appendChild(opt);
    });
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();
  if (!state.currentUser) {
    showToast('Please select an active persona first.', 'error');
    return;
  }

  const title = document.getElementById('event-form-title').value.trim();
  const club = document.getElementById('event-form-club').value;
  const category = document.getElementById('event-form-category').value;
  const startDate = document.getElementById('event-form-start').value;
  const endDate = document.getElementById('event-form-end').value;
  const venue = document.getElementById('event-form-venue').value.trim();
  const budget = document.getElementById('event-form-budget').value;
  const expectedParticipants = document.getElementById('event-form-participants').value;
  const description = document.getElementById('event-form-desc').value.trim();

  try {
    const res = await API.createEvent({
      title,
      club,
      submittedBy: state.currentUser._id,
      category,
      startDate,
      endDate,
      venue,
      budget,
      expectedParticipants,
      description
    });

    if (res.success) {
      showToast('Event proposal submitted for Faculty review!', 'success');
      closeModal('modal-create-event');
      document.getElementById('form-create-event').reset();
      navigateTo('events');
      await loadEvents();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// 3. Create OD
function openCreateOdModal() {
  // Set default dates to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  document.getElementById('od-form-from').value = tomorrowStr;
  document.getElementById('od-form-to').value = tomorrowStr;
  calcOdDays();

  openModal('modal-create-od');
}

function calcOdDays() {
  const from = new Date(document.getElementById('od-form-from').value);
  const to = new Date(document.getElementById('od-form-to').value);
  if (!isNaN(from) && !isNaN(to) && to >= from) {
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('od-form-days').value = diffDays;
  } else {
    document.getElementById('od-form-days').value = 1;
  }
}

async function handleCreateOd(e) {
  e.preventDefault();
  if (!state.currentUser) {
    showToast('Please select an active persona first.', 'error');
    return;
  }

  const category = document.getElementById('od-form-category').value;
  const eventTitle = document.getElementById('od-form-title').value.trim();
  const organizationOrCollege = document.getElementById('od-form-org').value.trim();
  const venue = document.getElementById('od-form-venue').value.trim();
  const fromDate = document.getElementById('od-form-from').value;
  const toDate = document.getElementById('od-form-to').value;
  const totalDays = document.getElementById('od-form-days').value;
  const proofDocument = document.getElementById('od-form-proof').value.trim();
  const reason = document.getElementById('od-form-reason').value.trim();

  try {
    const res = await API.createOd({
      student: state.currentUser._id,
      studentRoll: state.currentUser.identifier,
      department: state.currentUser.department,
      category,
      eventTitle,
      organizationOrCollege,
      venue,
      fromDate,
      toDate,
      totalDays,
      proofDocument,
      reason
    });

    if (res.success) {
      showToast(`OD Request submitted successfully!`, 'success');
      closeModal('modal-create-od');
      document.getElementById('form-create-od').reset();
      navigateTo('od');
      await loadOdRequests();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// 4. Multi-tier Review Modal (Faculty / HOD / Admin)
function openReviewModal(entityType, entityId, title, action) {
  if (!state.currentUser) {
    showToast('Please select a user persona first.', 'error');
    return;
  }

  document.getElementById('review-entity-type').value = entityType;
  document.getElementById('review-entity-id').value = entityId;
  document.getElementById('review-action-type').value = action;

  document.getElementById('review-modal-title').textContent = action === 'approved' 
    ? `Approve & Forward ${entityType}` 
    : `Reject ${entityType}`;

  document.getElementById('review-reviewer-badge').textContent = `${state.currentUser.name} (${state.currentUser.role.toUpperCase()})`;
  document.getElementById('review-item-title').textContent = title;

  const submitBtn = document.getElementById('review-submit-btn');
  if (action === 'approved') {
    submitBtn.textContent = 'Confirm Approval & Forward';
    submitBtn.className = 'btn btn-success';
    document.getElementById('review-remarks').value = 'Verified and approved with institutional recommendation.';
  } else {
    submitBtn.textContent = 'Confirm Rejection';
    submitBtn.className = 'btn btn-danger';
    document.getElementById('review-remarks').value = 'Rejected due to academic schedule conflict.';
  }

  openModal('modal-review');
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const entityType = document.getElementById('review-entity-type').value;
  const entityId = document.getElementById('review-entity-id').value;
  const action = document.getElementById('review-action-type').value;
  const remarks = document.getElementById('review-remarks').value.trim();

  const payload = {
    reviewerId: state.currentUser._id,
    reviewerName: state.currentUser.name,
    role: state.currentUser.role,
    action,
    remarks
  };

  try {
    let res;
    if (entityType === 'Event') {
      res = await API.reviewEvent(entityId, payload);
    } else {
      res = await API.reviewOd(entityId, payload);
    }

    if (res.success) {
      showToast(res.message, 'success');
      closeModal('modal-review');
      if (entityType === 'Event') await loadEvents();
      if (entityType === 'OdRequest') await loadOdRequests();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// 5. Create User Modal
function openCreateUserModal() {
  openModal('modal-create-user');
}

async function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('user-form-name').value.trim();
  const email = document.getElementById('user-form-email').value.trim();
  const identifier = document.getElementById('user-form-id').value.trim();
  const role = document.getElementById('user-form-role').value;
  const department = document.getElementById('user-form-dept').value;
  const phone = document.getElementById('user-form-phone').value.trim();

  try {
    const res = await API.createUser({
      name,
      email,
      identifier,
      role,
      department,
      phone
    });

    if (res.success) {
      showToast('User created successfully!', 'success');
      closeModal('modal-create-user');
      document.getElementById('form-create-user').reset();
      await loadUsers();
      await loadUsersList();
      await loadDashboard();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==================== UTILITY FUNCTIONS ====================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

function formatStatus(status) {
  const map = {
    pending_faculty: 'Pending Faculty',
    pending_hod: 'Pending HOD',
    pending_admin: 'Pending Dean/Admin',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  return map[status] || status;
}

function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

const STORAGE_KEY = 'shortcuts-studio-v2';
const APP_ALIASES = {
  spotify: 'https://open.spotify.com/',
  youtube: 'https://www.youtube.com/',
  gmail: 'https://mail.google.com/',
  calendar: 'https://calendar.google.com/',
  notes: 'https://www.google.com/',
  maps: 'https://www.google.com/maps',
  slack: 'https://slack.com/',
  whatsapp: 'https://web.whatsapp.com/',
  instagram: 'https://www.instagram.com/',
  telegram: 'https://web.telegram.org/',
  drive: 'https://drive.google.com/',
  roblox: 'https://www.roblox.com/'
};

const APP_OPTIONS = [
  { label: 'Spotify', value: 'spotify' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Gmail', value: 'gmail' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Maps', value: 'maps' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Drive', value: 'drive' },
  { label: 'Roblox', value: 'roblox' }
];

const initialShortcuts = [
  {
    id: 1,
    title: 'Launch Roblox',
    description: 'Open Roblox instantly from your shortcuts home.',
    category: 'Games',
    icon: '🎮',
    steps: [{ type: 'open_app', value: 'roblox' }]
  },
  {
    id: 2,
    title: 'Morning Brief',
    description: 'Open your favorite news source and prep for the day.',
    category: 'Daily',
    icon: '⚡',
    steps: [
      { type: 'open_url', value: 'https://www.nytimes.com/' },
      { type: 'copy_text', value: 'Review your top 3 priorities before noon.' }
    ]
  },
  {
    id: 3,
    title: 'Deep Work Start',
    description: 'Set yourself up for focused work and keep the momentum.',
    category: 'Focus',
    icon: '🎵',
    steps: [
      { type: 'copy_text', value: 'Close extra tabs and start the first task.' },
      { type: 'reminder', value: 'Check the sprint board at 11:00.' }
    ]
  },
  {
    id: 4,
    title: 'Light Switch',
    description: 'Toggle between light and dark modes instantly.',
    category: 'System',
    icon: '🛜',
    steps: [{ type: 'toggle_theme', value: '' }]
  }
];

let shortcuts = loadShortcuts();
let activeCategory = 'All';
let searchTerm = '';
let theme = 'dark';
let logEntries = [];
let editingId = null;
let draggedStepIndex = null;
let deferredPrompt = null;
let discoveredBluetooth = [];
let mockWifiNetworks = [
  { name: 'Home WiFi', strength: '�📶📶' },
  { name: 'Work Network', strength: '📶📶' },
  { name: 'Coffee Shop', strength: '📶' },
  { name: 'Library WiFi', strength: '📶📶📶' },
  { name: 'Guest Network', strength: '📶' }
];

const WIFI_CONDITIONS = [
  { value: 'connect', label: 'When I connect to' },
  { value: 'disconnect', label: 'When I disconnect from' },
  { value: 'leave', label: 'When I leave' }
];

const BLUETOOTH_CONDITIONS = [
  { value: 'connect', label: 'When I connect to' },
  { value: 'disconnect', label: 'When I disconnect from' }
];

const shortcutGrid = document.getElementById('shortcutGrid');
const categoryChips = document.getElementById('categoryChips');
const searchInput = document.getElementById('searchInput');
const logList = document.getElementById('logList');
const themeToggle = document.getElementById('themeToggle');
const shortcutTitleInput = document.getElementById('shortcutTitle');
const shortcutDescriptionInput = document.getElementById('shortcutDescription');
const shortcutCategorySelect = document.getElementById('shortcutCategory');
const shortcutIconSelect = document.getElementById('shortcutIcon');
const builderSteps = document.getElementById('builderSteps');
const addStepBtn = document.getElementById('addStepBtn');
const saveShortcutBtn = document.getElementById('saveShortcutBtn');
const clearBuilderBtn = document.getElementById('clearBuilderBtn');
const newShortcutBtn = document.getElementById('newShortcutBtn');
const toast = document.getElementById('toast');
const shortcutCount = document.getElementById('shortcutCount');
const installButton = document.getElementById('installButton');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');

const builderState = {
  title: '',
  description: '',
  category: 'Daily',
  icon: '⚡',
  steps: [{ type: 'open_url', value: 'https://example.com' }]
};

function loadShortcuts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : initialShortcuts;
  } catch {
    return initialShortcuts;
  }
}

function saveShortcuts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        showToast('Offline support could not be enabled.');
      });
    });
  }
}

function setupInstallPrompt() {
  if (!installButton) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    installButton.classList.add('hidden');
    showToast('App installed');
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      showToast('Open the browser menu to install on Android.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Installing app');
    }
    deferredPrompt = null;
    installButton.classList.add('hidden');
  });
}

function exportShortcuts() {
  const blob = new Blob([JSON.stringify(shortcuts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'shortcuts-studio-backup.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Exported shortcuts');
}

function importShortcuts(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('Invalid backup');
      shortcuts = parsed.map((item) => ({
        ...item,
        icon: item.icon || '⚡',
        steps: Array.isArray(item.steps) ? item.steps : []
      }));
      saveShortcuts();
      renderChips();
      renderShortcuts();
      showToast('Imported shortcuts');
    } catch {
      showToast('Could not import backup');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

async function scanBluetooth() {
  if (!navigator.bluetooth) {
    showToast('Bluetooth scanning not available on this device');
    return;
  }

  try {
    showToast('Scanning for Bluetooth devices...');
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['generic_access']
    });
    
    if (!discoveredBluetooth.some((d) => d.id === device.id)) {
      discoveredBluetooth.push({
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: device.gatt?.connected || false
      });
    }
    
    showToast(`Found: ${device.name || 'Unknown Device'}`);
  } catch (error) {
    showToast('Bluetooth scan cancelled or unavailable');
  }
}

function getBluetoothOptions() {
  return discoveredBluetooth.length > 0
    ? discoveredBluetooth.map((device) => `<option value="${device.name}">${device.name}</option>`).join('')
    : '<option value="headphones">Headphones</option><option value="speaker">Speaker</option><option value="watch">Smartwatch</option>';
}

function getWifiOptions() {
  return mockWifiNetworks
    .map((network) => `<option value="${network.name}">${network.strength} ${network.name}</option>`)
    .join('');
}

function renderChips() {
  const categories = ['All', ...new Set(shortcuts.map((shortcut) => shortcut.category))];
  categoryChips.innerHTML = categories
    .map((category) => {
      const active = activeCategory === category ? 'active' : '';
      return `<button class="chip ${active}" data-category="${category}">${category}</button>`;
    })
    .join('');

  categoryChips.querySelectorAll('.chip').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderChips();
      renderShortcuts();
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderShortcuts() {
  const visibleShortcuts = shortcuts.filter((shortcut) => {
    const matchesCategory = activeCategory === 'All' || shortcut.category === activeCategory;
    const matchesSearch = `${shortcut.title} ${shortcut.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  shortcutCount.textContent = shortcuts.length;

  if (!visibleShortcuts.length) {
    shortcutGrid.innerHTML = '<p>No shortcuts match this view yet.</p>';
    return;
  }

  shortcutGrid.innerHTML = visibleShortcuts
    .map(
      (shortcut) => `
        <article class="shortcut-card">
          <div>
            <h3>${escapeHtml(shortcut.title)}</h3>
            <p>${escapeHtml(shortcut.description)}</p>
            <div class="card-badges">
              <span>${escapeHtml(shortcut.icon || '⚡')}</span>
              <span>${escapeHtml(shortcut.category)}</span>
              <span>${shortcut.steps.length} action${shortcut.steps.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div class="card-actions">
            <button data-action="run" data-id="${shortcut.id}">Run</button>
            <button class="secondary-button" data-action="edit" data-id="${shortcut.id}">Edit</button>
          </div>
        </article>
      `
    )
    .join('');

  shortcutGrid.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const shortcut = shortcuts.find((item) => item.id === Number(button.dataset.id));
      if (button.dataset.action === 'edit') {
        loadBuilder(shortcut);
      } else {
        runShortcut(shortcut);
      }
    });
  });
}

function renderBuilder() {
  builderSteps.innerHTML = builderState.steps
    .map(
      (step, index) => `
        <div class="step-row" data-index="${index}" draggable="true">
          <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
          <select data-index="${index}" class="step-type">
            <option value="open_url" ${step.type === 'open_url' ? 'selected' : ''}>Open link</option>
            <option value="open_app" ${step.type === 'open_app' ? 'selected' : ''}>Open app</option>
            <option value="open_maps" ${step.type === 'open_maps' ? 'selected' : ''}>Open maps</option>
            <option value="toggle_bluetooth" ${step.type === 'toggle_bluetooth' ? 'selected' : ''}>Toggle Bluetooth</option>
            <option value="toggle_wifi" ${step.type === 'toggle_wifi' ? 'selected' : ''}>Toggle Wi-Fi</option>
            <option value="copy_text" ${step.type === 'copy_text' ? 'selected' : ''}>Copy text</option>
            <option value="reminder" ${step.type === 'reminder' ? 'selected' : ''}>Create reminder</option>
            <option value="compose_note" ${step.type === 'compose_note' ? 'selected' : ''}>Compose note</option>
            <option value="toggle_theme" ${step.type === 'toggle_theme' ? 'selected' : ''}>Toggle theme</option>
          </select>
          <div class="step-input-wrap">
            ${step.type === 'toggle_bluetooth'
              ? `
                <div style="display: flex; gap: 8px; flex: 1;">
                  <select data-index="${index}" class="step-device" style="flex: 1;">
                    ${getBluetoothOptions()}
                  </select>
                  <button class="secondary-button" data-index="${index}" data-action="scan-bt" style="flex: 0; padding: 10px 12px; white-space: nowrap;">Scan</button>
                </div>
                <div class="toggle-pill" data-index="${index}" style="margin-top: 8px;">
                  <button class="toggle-option ${step.value === 'off' ? 'inactive' : 'active'}" data-value="on" data-index="${index}">On</button>
                  <button class="toggle-option ${step.value === 'on' || !step.value ? 'active' : 'inactive'}" data-value="off" data-index="${index}">Off</button>
                </div>
              `
              : step.type === 'toggle_wifi'
              ? `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; gap: 8px;">
                    <select data-index="${index}" class="step-condition" style="flex: 1;" title="Select trigger">
                      ${WIFI_CONDITIONS.map((cond) => `<option value="${cond.value}" ${step.condition === cond.value ? 'selected' : ''}>${cond.label}</option>`).join('')}
                    </select>
                  </div>
                  <select data-index="${index}" class="step-device" style="width: 100%;">
                    <option value="">-- Select network --</option>
                    ${getWifiOptions()}
                  </select>
                  <div class="toggle-pill">
                    <button class="toggle-option ${step.value === 'off' ? 'inactive' : 'active'}" data-value="on" data-index="${index}">Turn On</button>
                    <button class="toggle-option ${step.value === 'on' || !step.value ? 'active' : 'inactive'}" data-value="off" data-index="${index}">Turn Off</button>
                  </div>
                </div>
              `
              : `<input data-index="${index}" class="step-value" value="${escapeHtml(step.value)}" placeholder="${step.type === 'open_app' ? APP_OPTIONS.map((app) => app.label).join(', ') : 'Add a value'}" />`
            }
          </div>
          <button class="step-remove" data-index="${index}" title="Remove">×</button>
        </div>
      `
    )
    .join('');

  builderSteps.querySelectorAll('.step-row').forEach((row) => {
    row.addEventListener('dragstart', handleStepDragStart);
    row.addEventListener('dragover', handleStepDragOver);
    row.addEventListener('drop', handleStepDrop);
    row.addEventListener('dragend', handleStepDragEnd);
  });

  builderSteps.querySelectorAll('.step-type, .step-value, .step-remove, .toggle-option, .step-device, .step-condition').forEach((element) => {
    element.addEventListener('change', handleBuilderChange);
    element.addEventListener('input', handleBuilderChange);
    element.addEventListener('click', handleBuilderChange);
  });

  builderSteps.querySelectorAll('[data-action="scan-bt"]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      scanBluetooth().then(() => {
        renderBuilder();
      });
    });
  });
}

function handleBuilderChange(event) {
  const index = Number(event.target.dataset.index);

  if (event.target.classList.contains('toggle-option')) {
    builderState.steps[index].value = event.target.dataset.value;
    renderBuilder();
    return;
  }

  if (event.target.classList.contains('step-remove')) {
    builderState.steps.splice(index, 1);
    if (!builderState.steps.length) {
      builderState.steps.push({ type: 'open_url', value: 'https://example.com' });
    }
    renderBuilder();
    return;
  }

  if (event.target.classList.contains('step-device')) {
    builderState.steps[index].device = event.target.value;
    return;
  }

  if (event.target.classList.contains('step-condition')) {
    builderState.steps[index].condition = event.target.value;
    return;
  }

  if (event.target.classList.contains('step-type')) {
    builderState.steps[index].type = event.target.value;
    if (event.target.value === 'toggle_theme') {
      builderState.steps[index].value = '';
    } else if (event.target.value === 'open_app') {
      builderState.steps[index].value = 'spotify';
    } else if (event.target.value === 'toggle_bluetooth' || event.target.value === 'toggle_wifi') {
      builderState.steps[index].value = 'on';
      builderState.steps[index].condition = 'connect';
    }
    renderBuilder();
    return;
  }

  if (event.target.classList.contains('step-value')) {
    builderState.steps[index].value = event.target.value;
    if (event.type === 'change') {
      renderBuilder();
    }
  }
}

function handleStepDragStart(event) {
  draggedStepIndex = Number(event.currentTarget.dataset.index);
  event.dataTransfer.effectAllowed = 'move';
  event.currentTarget.classList.add('dragging');
}

function handleStepDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleStepDrop(event) {
  event.preventDefault();
  const dropIndex = Number(event.currentTarget.dataset.index);
  if (draggedStepIndex !== null && dropIndex !== draggedStepIndex) {
    const [movedStep] = builderState.steps.splice(draggedStepIndex, 1);
    const targetIndex = draggedStepIndex < dropIndex ? dropIndex - 1 : dropIndex;
    builderState.steps.splice(targetIndex, 0, movedStep);
    renderBuilder();
  }
  draggedStepIndex = null;
  document.querySelectorAll('.step-row').forEach((row) => row.classList.remove('drag-over'));
}

function handleStepDragEnd(event) {
  draggedStepIndex = null;
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.step-row').forEach((row) => row.classList.remove('drag-over'));
}

function loadBuilder(shortcut) {
  editingId = shortcut.id;
  builderState.title = shortcut.title;
  builderState.description = shortcut.description;
  builderState.category = shortcut.category;
  builderState.icon = shortcut.icon || '⚡';
  builderState.steps = shortcut.steps.map((step) => ({ ...step }));

  shortcutTitleInput.value = builderState.title;
  shortcutDescriptionInput.value = builderState.description;
  shortcutCategorySelect.value = builderState.category;
  shortcutIconSelect.value = builderState.icon;
  renderBuilder();
  saveShortcutBtn.textContent = 'Update shortcut';
}

function resetBuilder() {
  editingId = null;
  builderState.title = '';
  builderState.description = '';
  builderState.category = 'Daily';
  builderState.icon = '⚡';
  builderState.steps = [{ type: 'open_url', value: 'https://example.com' }];

  shortcutTitleInput.value = '';
  shortcutDescriptionInput.value = '';
  shortcutCategorySelect.value = 'Daily';
  shortcutIconSelect.value = '⚡';
  renderBuilder();
  saveShortcutBtn.textContent = 'Save shortcut';
}

function renderLog() {
  if (!logEntries.length) {
    logList.innerHTML = '<li>Your runs will show up here.</li>';
    return;
  }

  logList.innerHTML = logEntries
    .slice(-6)
    .reverse()
    .map((entry) => `<li>${escapeHtml(entry)}</li>`)
    .join('');
}

function log(message) {
  logEntries.push(message);
  renderLog();
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
  log(`Theme switched to ${theme}.`);
}

function resolveAppUrl(value) {
  const appName = String(value || '').trim().toLowerCase();
  if (!appName) return null;
  if (/^https?:\/\//.test(appName)) return value;
  return APP_ALIASES[appName] || null;
}

async function runShortcut(shortcut) {
  if (!shortcut) return;
  log(`Running ${shortcut.title}`);

  for (const step of shortcut.steps) {
    switch (step.type) {
      case 'open_url':
        window.open(step.value || 'https://example.com', '_blank', 'noopener');
        break;
      case 'open_app': {
        const appUrl = resolveAppUrl(step.value);
        if (appUrl) {
          window.open(appUrl, '_blank', 'noopener');
        } else {
          log(`App launcher: ${step.value || 'Unknown app'}`);
        }
        break;
      }
      case 'open_maps':
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(step.value || 'coffee near me'), '_blank', 'noopener');
        break;
      case 'toggle_bluetooth': {
        const stateText = step.value && step.value.toLowerCase() === 'off' ? 'off' : 'on';
        const device = step.device || 'Bluetooth';
        log(`${device}: turned ${stateText}`);
        break;
      }
      case 'toggle_wifi': {
        const stateText = step.value && step.value.toLowerCase() === 'off' ? 'off' : 'on';
        const network = step.device || 'Wi-Fi';
        const condition = WIFI_CONDITIONS.find((c) => c.value === step.condition)?.label || 'Wi-Fi action';
        log(`${condition} ${network}: turn ${stateText}`);
        break;
      }
      case 'copy_text':
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(step.value);
        }
        break;
      case 'reminder':
        log(`Reminder: ${step.value}`);
        break;
      case 'compose_note':
        log(`Note: ${step.value}`);
        break;
      case 'toggle_theme':
        toggleTheme();
        break;
      default:
        break;
    }
  }

  showToast(`${shortcut.title} completed`);
}

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value;
  renderShortcuts();
});

themeToggle.addEventListener('click', toggleTheme);
exportBtn.addEventListener('click', exportShortcuts);
importInput.addEventListener('change', importShortcuts);

newShortcutBtn.addEventListener('click', resetBuilder);
clearBuilderBtn.addEventListener('click', resetBuilder);

addStepBtn.addEventListener('click', () => {
  builderState.steps.push({ type: 'open_url', value: '' });
  renderBuilder();
});

saveShortcutBtn.addEventListener('click', () => {
  builderState.title = shortcutTitleInput.value;
  builderState.description = shortcutDescriptionInput.value;
  builderState.category = shortcutCategorySelect.value || 'Daily';

  const title = builderState.title.trim();
  if (!title) {
    showToast('Give your shortcut a name first.');
    return;
  }

  const shortcut = {
    id: editingId || Date.now(),
    title,
    description: builderState.description.trim() || 'A custom automation created in Shortcuts Studio.',
    category: builderState.category || 'Daily',
    icon: builderState.icon || '⚡',
    steps: builderState.steps.map((step) => ({ ...step }))
  };

  if (editingId) {
    shortcuts = shortcuts.map((item) => (item.id === editingId ? shortcut : item));
    showToast(`Updated ${shortcut.title}`);
  } else {
    shortcuts.unshift(shortcut);
    showToast(`Saved ${shortcut.title}`);
  }

  saveShortcuts();
  renderChips();
  renderShortcuts();
  resetBuilder();
});

['input', 'change'].forEach((eventName) => {
  shortcutTitleInput.addEventListener(eventName, () => {
    builderState.title = shortcutTitleInput.value;
  });
  shortcutDescriptionInput.addEventListener(eventName, () => {
    builderState.description = shortcutDescriptionInput.value;
  });
  shortcutCategorySelect.addEventListener(eventName, () => {
    builderState.category = shortcutCategorySelect.value;
  });
  shortcutIconSelect.addEventListener(eventName, () => {
    builderState.icon = shortcutIconSelect.value;
  });
});

registerServiceWorker();
setupInstallPrompt();
renderChips();
renderShortcuts();
renderBuilder();
renderLog();

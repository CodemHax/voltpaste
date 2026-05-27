const logoBtn = document.getElementById('logo-btn');
const newPasteBtn = document.getElementById('new-paste-btn');

const createSection = document.getElementById('create-section');
const viewSection = document.getElementById('view-section');
const successSection = document.getElementById('success-section');

const pasteTitle = document.getElementById('paste-title');
const pasteLanguage = document.getElementById('paste-language');
const pasteExpiration = document.getElementById('paste-expiration');
const pasteEncryption = document.getElementById('paste-encryption');
const passwordFieldContainer = document.getElementById('password-field-container');
const pastePassword = document.getElementById('paste-password');
const togglePwVisibility = document.getElementById('toggle-pw-visibility');
const pasteBurn = document.getElementById('paste-burn');
const submitPasteBtn = document.getElementById('submit-paste-btn');

const viewTitle = document.getElementById('view-title');
const metaLang = document.getElementById('meta-lang');
const metaTime = document.getElementById('meta-time');
const metaBurn = document.getElementById('meta-burn');
const copyRawBtn = document.getElementById('copy-raw-btn');
const downloadBtn = document.getElementById('download-btn');
const shareLinkBtn = document.getElementById('share-link-btn');
const qrCodeBtn = document.getElementById('qr-code-btn');
const qrModal = document.getElementById('qr-modal');
const closeQrBtn = document.getElementById('close-qr-btn');
const cloneBtn = document.getElementById('clone-btn');
const unlockContainer = document.getElementById('unlock-container');
const decryptPasswordInput = document.getElementById('decrypt-password-input');
const decryptSubmitBtn = document.getElementById('decrypt-submit-btn');
const decryptError = document.getElementById('decrypt-error');

const themeToggleBtn = document.getElementById('theme-toggle-btn');
const historyToggleBtn = document.getElementById('history-toggle-btn');
const historySidebar = document.getElementById('history-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyList = document.getElementById('history-list');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

let currentViewPasteId = null;
let currentPasteData = null;
let currentCreatedPasteUrl = null;
let currentDecryptedText = "";

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function bufToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBuf(hexString) {
    const matches = hexString.match(/.{1,2}/g);
    if (!matches) return new ArrayBuffer(0);
    const bytes = new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    return bytes.buffer;
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showSection(section) {
    [createSection, viewSection].forEach(s => s.classList.remove('active'));
    section.classList.add('active');
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function initializeEditors(theme) {
    window.editor = monaco.editor.create(document.getElementById('editor-widget'), {
        value: '',
        language: 'plaintext',
        theme: theme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Fira Code, monospace',
        lineHeight: 1.6,
        scrollBeyondLastLine: false,
        padding: { top: 16 }
    });

    window.editor.onDidChangeModelContent(() => {
        if (typeof updateCreatePreview === 'function') {
            updateCreatePreview();
        }
    });

    window.viewer = monaco.editor.create(document.getElementById('viewer-widget'), {
        value: '',
        language: 'plaintext',
        theme: theme,
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Fira Code, monospace',
        lineHeight: 1.6,
        scrollBeyondLastLine: false,
        padding: { top: 16 }
    });
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const theme = isLight ? 'vs' : 'vs-dark';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    if (window.editor) monaco.editor.setTheme(theme);
    if (window.viewer) monaco.editor.setTheme(theme);
    updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
    const icon = document.getElementById('theme-icon');
    if (isLight) {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    } else {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

function closeHistory() {
    historySidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
}

historyToggleBtn.addEventListener('click', () => {
    renderHistory();
    historySidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
});

closeHistoryBtn.addEventListener('click', closeHistory);
sidebarOverlay.addEventListener('click', closeHistory);

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('paste_history');
    renderHistory();
});

function saveToHistory(pasteId, title, url) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('paste_history')) || [];
    } catch (e) {}
    history = history.filter(item => item.id !== pasteId);
    history.unshift({
        id: pasteId,
        title: title,
        url: url,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('paste_history', JSON.stringify(history.slice(0, 50)));
}

function renderHistory() {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('paste_history')) || [];
    } catch (e) {}
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-text">No pastes created yet.</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-url="${item.url}">
            <div class="history-title">${escapeHtml(item.title)}</div>
            <div class="history-meta">
                <span>${formatDate(item.created_at)}</span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => {
            window.location.href = el.getAttribute('data-url');
            closeHistory();
        });
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

pasteLanguage.addEventListener('change', () => {
    if (window.editor) {
        const model = window.editor.getModel();
        monaco.editor.setModelLanguage(model, pasteLanguage.value);
    }
});

pasteEncryption.addEventListener('change', () => {
    if (pasteEncryption.value === 'password') {
        passwordFieldContainer.classList.remove('password-hide');
    } else {
        passwordFieldContainer.classList.add('password-hide');
        pastePassword.value = '';
    }
});

togglePwVisibility.addEventListener('click', () => {
    const type = pastePassword.getAttribute('type') === 'password' ? 'text' : 'password';
    pastePassword.setAttribute('type', type);
});

async function encryptAutoKey(plaintext) {
    const key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const exportedRawKey = await window.crypto.subtle.exportKey("raw", key);
    const keyHex = bufToHex(exportedRawKey);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encoder = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoder.encode(plaintext)
    );

    return {
        keyHex,
        ivBase64: arrayBufferToBase64(iv),
        ciphertextBase64: arrayBufferToBase64(ciphertext)
    };
}

async function encryptPasswordKey(plaintext, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const encoder = new TextEncoder();
    const passwordKeyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        passwordKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoder.encode(plaintext)
    );

    return {
        saltBase64: arrayBufferToBase64(salt),
        ivBase64: arrayBufferToBase64(iv),
        ciphertextBase64: arrayBufferToBase64(ciphertext)
    };
}

submitPasteBtn.addEventListener('click', async () => {
    if (!window.editor) return;
    const text = window.editor.getValue().trim();
    if (!text) {
        showToast("Please enter some text or code first.");
        return;
    }

    submitPasteBtn.classList.add('loading');
    submitPasteBtn.disabled = true;

    try {
        const title = pasteTitle.value.trim() || "Untitled Paste";
        const lang = pasteLanguage.value;
        const expirationVal = parseInt(pasteExpiration.value);
        const expiresMinutes = expirationVal > 0 ? expirationVal : null;
        const maxViews = parseInt(pasteBurn.value);
        const encType = pasteEncryption.value;

        let payload = {
            title: title,
            language: lang,
            max_views: maxViews,
            expires_in_minutes: expiresMinutes,
            is_encrypted: false,
            content: "",
            iv: null,
            salt: null
        };

        let keyHex = "";

        if (encType === 'auto') {
            const encResult = await encryptAutoKey(text);
            payload.content = encResult.ciphertextBase64;
            payload.iv = encResult.ivBase64;
            payload.is_encrypted = true;
            keyHex = encResult.keyHex;
        } else if (encType === 'password') {
            const password = pastePassword.value.trim();
            if (!password) {
                showToast("Please enter a decryption password.");
                submitPasteBtn.classList.remove('loading');
                submitPasteBtn.disabled = false;
                return;
            }
            const encResult = await encryptPasswordKey(text, password);
            payload.content = encResult.ciphertextBase64;
            payload.iv = encResult.ivBase64;
            payload.salt = encResult.saltBase64;
            payload.is_encrypted = true;
        } else {
            payload.content = text;
        }

        const response = await fetch('/api/pastes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("API responded with an error");
        }

        const data = await response.json();
        const pasteId = data.id;

        const finalUrl = window.location.origin + `/p/${pasteId}` + (keyHex ? `#${keyHex}` : '');
        currentCreatedPasteUrl = finalUrl;
        
        saveToHistory(data.id, payload.title || 'Untitled', finalUrl);

        navigator.clipboard.writeText(finalUrl)
            .then(() => showToast("Paste created! URL copied to clipboard."))
            .catch(() => showToast("Paste created! URL: " + finalUrl));

        window.history.pushState({}, document.title, `/p/${data.id}${keyHex ? '#' + keyHex : ''}`);
        

        const localData = {
            id: pasteId,
            title: payload.title,
            language: payload.language,
            max_views: payload.max_views,
            views: 0,
            expires_at: payload.expires_in_minutes ? new Date(Date.now() + payload.expires_in_minutes * 60000).toISOString() : null,
            is_encrypted: payload.is_encrypted,
            content: payload.content,
            iv: payload.iv,
            salt: payload.salt,
            created_at: new Date().toISOString()
        };
        
        showSection(viewSection);
        loadPaste(pasteId, localData);

    } catch (err) {
        console.error(err);
        showToast("Error uploading paste. Please try again.");
    } finally {
        submitPasteBtn.classList.remove('loading');
        submitPasteBtn.disabled = false;
    }
});

if (qrCodeBtn) {
    qrCodeBtn.addEventListener('click', () => {
        qrModal.style.display = 'flex';
        const url = window.location.href;
        
        if (window.qrcodeInstance) {
            window.qrcodeInstance.clear();
            window.qrcodeInstance.makeCode(url);
        } else if (typeof QRCode !== 'undefined') {
            window.qrcodeInstance = new QRCode(document.getElementById("qrcode"), {
                text: url,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    });
}

if (closeQrBtn) {
    closeQrBtn.addEventListener('click', () => {
        qrModal.style.display = 'none';
    });
}

async function decryptAutoKey(ciphertextBase64, ivBase64, keyHex) {
    const keyBuf = hexToBuf(keyHex);
    const iv = base64ToArrayBuffer(ivBase64);
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyBuf,
        "AES-GCM",
        false,
        ["decrypt"]
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

async function decryptPasswordKey(ciphertextBase64, ivBase64, saltBase64, password) {
    const salt = base64ToArrayBuffer(saltBase64);
    const iv = base64ToArrayBuffer(ivBase64);
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);

    const encoder = new TextEncoder();
    const passwordKeyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        passwordKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

async function loadPaste(pasteId, localData = null) {
    currentViewPasteId = pasteId;
    unlockContainer.style.display = 'none';
    document.getElementById('viewer-widget').style.display = 'none';
    showSection(viewSection);
    
    try {
        let data;
        if (localData) {
            data = localData;
        } else {
            const response = await fetch(`/api/pastes/${pasteId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    viewTitle.textContent = "Paste Not Found";
                    displayPlaintext("This paste has expired, been burned, or does not exist.");
                    return;
                }
                throw new Error("Failed to fetch paste");
            }
            data = await response.json();
        }
        
        currentPasteData = data;

        viewTitle.textContent = data.title || "Untitled Paste";
        metaLang.textContent = (data.title && data.title.includes('.') ? data.title.split('.').pop() : 'Plain Text').toUpperCase();
        metaTime.textContent = formatDate(data.created_at);
        if (data.max_views && data.max_views > 0) {
            metaBurn.style.display = 'inline-block';
            metaBurn.textContent = `Burn Limit: ${data.views}/${data.max_views}`;
            if (cloneBtn) cloneBtn.style.display = 'none';
        } else {
            metaBurn.style.display = 'none';
            if (cloneBtn) cloneBtn.style.display = 'inline-flex';
        }

        if (data.is_encrypted) {
            const keyHex = window.location.hash.substring(1);
            
            if (data.salt) {
                unlockContainer.style.display = 'flex';
                decryptPasswordInput.value = '';
                decryptError.textContent = '';
                decryptPasswordInput.focus();
            } else if (keyHex && keyHex.length === 64) {
                try {
                    const decrypted = await decryptAutoKey(data.content, data.iv, keyHex);
                    displayPlaintext(decrypted);
                } catch (e) {
                    console.error(e);
                    viewTitle.textContent = "Decryption Failed";
                    displayPlaintext("Decryption failed. The URL key may be corrupt or modified.");
                }
            } else {
                viewTitle.textContent = "Key Missing";
                displayPlaintext("This is an encrypted paste, but the decryption key is missing from the URL. Please ensure you have the full URL, including the section after the '#' symbol.");
            }
        } else {
            displayPlaintext(data.content);
        }

    } catch (err) {
        console.error(err);
        viewTitle.textContent = "Error Loading Paste";
        displayPlaintext("A system error occurred while retrieving this paste.");
    }
}

decryptSubmitBtn.addEventListener('click', async () => {
    const password = decryptPasswordInput.value.trim();
    if (!password) {
        decryptError.textContent = "Please enter a password.";
        return;
    }

    decryptSubmitBtn.disabled = true;
    decryptError.textContent = '';

    try {
        const decrypted = await decryptPasswordKey(
            currentPasteData.content,
            currentPasteData.iv,
            currentPasteData.salt,
            password
        );
        
        unlockContainer.style.display = 'none';
        displayPlaintext(decrypted);
    } catch (err) {
        console.error(err);
        decryptError.textContent = "Decryption failed. Incorrect password.";
    } finally {
        decryptSubmitBtn.disabled = false;
    }
});

decryptPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        decryptSubmitBtn.click();
    }
});

function displayPlaintext(text) {
    currentDecryptedText = text;
    
    let lang = 'plaintext';
    if (currentPasteData) {
        lang = currentPasteData.language || 'plaintext';
        if (lang === 'plaintext') {
            const title = currentPasteData.title || "";
            const extMatch = title.match(/\.([a-z0-9]+)$/i);
            if (extMatch) {
                const ext = extMatch[1].toLowerCase();
                const extMap = {
                    'py': 'python',
                    'js': 'javascript',
                    'ts': 'javascript',
                    'html': 'html',
                    'xml': 'xml',
                    'css': 'css',
                    'md': 'markdown',
                    'json': 'json',
                    'sql': 'sql',
                    'rs': 'rust',
                    'go': 'go',
                    'cpp': 'cpp',
                    'h': 'cpp',
                    'c': 'cpp'
                };
                lang = extMap[ext] || 'plaintext';
            }
        }
    }
    
    if (lang === 'markup') lang = 'html';

    metaLang.textContent = lang.toUpperCase();
    
    if (window.viewer) {
        window.viewer.setValue(text);
        const model = window.viewer.getModel();
        monaco.editor.setModelLanguage(model, lang);
        document.getElementById('viewer-widget').style.display = 'block';
    }

    if (typeof updateViewActions === 'function') {
        updateViewActions(lang, text);
    }
}

copyRawBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentDecryptedText)
        .then(() => showToast("Raw code copied to clipboard!"))
        .catch(() => showToast("Failed to copy."));
});

downloadBtn.addEventListener('click', () => {
    let filename = (currentPasteData && currentPasteData.title) || "paste";
    if (!filename.includes('.')) {
        const extMap = {
            'PYTHON': 'py',
            'JAVASCRIPT': 'js',
            'HTML': 'html',
            'CSS': 'css',
            'MARKDOWN': 'md',
            'JSON': 'json',
            'SQL': 'sql',
            'RUST': 'rs',
            'GO': 'go',
            'CPP': 'cpp'
        };
        const currentLang = metaLang.textContent;
        const ext = extMap[currentLang] || 'txt';
        filename += `.${ext}`;
    }

    const blob = new Blob([currentDecryptedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Paste file download started.");
});

cloneBtn.addEventListener('click', () => {
    if (!currentDecryptedText) return;
    window.editor.setValue(currentDecryptedText);
    pasteTitle.value = ((currentPasteData && currentPasteData.title) || "Untitled") + " (Copy)";
    pasteLanguage.value = (currentPasteData && currentPasteData.language) || "plaintext";
    if (window.editor) {
        const model = window.editor.getModel();
        monaco.editor.setModelLanguage(model, pasteLanguage.value);
    }
    pasteExpiration.value = '0';
    pasteEncryption.value = (currentPasteData && currentPasteData.is_encrypted) ? 'auto' : 'none';
    passwordFieldContainer.classList.add('password-hide');
    pastePassword.value = '';
    pasteBurn.value = '0';
    
    window.history.pushState({}, document.title, "/");
    showSection(createSection);
});

shareLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
        .then(() => showToast("Share link copied to clipboard!"))
        .catch(() => showToast("Failed to copy."));
});

logoBtn.addEventListener('click', () => {
    window.location.href = '/';
});

newPasteBtn.addEventListener('click', () => {
    window.location.href = '/';
});

function routePage() {
    const path = window.location.pathname;
    const match = path.match(/^\/p\/([a-zA-Z0-9_\-]+)/);
    
    if (match) {
        const pasteId = match[1];
        showSection(viewSection);
        loadPaste(pasteId);
    } else {
        if (window.editor) {
            window.editor.setValue('');
        }
        showSection(createSection);
    }
}

const savedTheme = localStorage.getItem('theme');
const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const isLight = savedTheme === 'light' || (!savedTheme && systemPrefersLight);
if (isLight) {
    document.body.classList.add('light-theme');
}

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    const currentTheme = document.body.classList.contains('light-theme') ? 'vs' : 'vs-dark';
    initializeEditors(currentTheme);
    updateThemeIcon(document.body.classList.contains('light-theme'));
    routePage();
});

window.addEventListener('popstate', routePage);

// --- NEW FEATURES: Password Entropy, File Attachments, Keybinds, Markdown ---

const passwordStrengthContainer = document.getElementById('password-strength-container');
const passwordStrengthBar = document.getElementById('password-strength-bar');

pastePassword.addEventListener('input', () => {
    const val = pastePassword.value;
    if (!val || typeof zxcvbn === 'undefined') {
        if (passwordStrengthContainer) passwordStrengthContainer.style.display = 'none';
        return;
    }
    if (passwordStrengthContainer) passwordStrengthContainer.style.display = 'block';
    
    const result = zxcvbn(val);
    const score = result.score;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    if (passwordStrengthBar) {
        passwordStrengthBar.style.width = widths[score];
        passwordStrengthBar.style.backgroundColor = colors[score];
    }
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (createSection.classList.contains('active')) submitPasteBtn.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        historyToggleBtn.click();
    }
    if (e.key === 'Escape') {
        closeHistory();
    }
});

const createPreviewBtn = document.getElementById('create-preview-btn');
const createMarkdownPreview = document.getElementById('create-markdown-preview');

if (pasteLanguage) {
    pasteLanguage.addEventListener('change', (e) => {
        if (e.target.value === 'markdown') {
            createPreviewBtn.style.display = 'inline-block';
        } else {
            createPreviewBtn.style.display = 'none';
            if (createMarkdownPreview.style.display === 'block') {
                createPreviewBtn.click(); // revert to code view
            }
        }
        
        if (window.editor) {
            const model = window.editor.getModel();
            monaco.editor.setModelLanguage(model, e.target.value);
        }
    });
}

function updateCreatePreview() {
    if (createMarkdownPreview.style.display === 'block') {
        const text = window.editor ? window.editor.getValue() : '';
        try {
            createMarkdownPreview.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : '<p style="color: red;">marked is undefined</p>';
        } catch (err) {
            createMarkdownPreview.innerHTML = `<p style="color: red;">Error parsing markdown: ${err.message}</p>`;
        }
    }
}

if (createPreviewBtn) {
    createPreviewBtn.addEventListener('click', () => {
        if (createMarkdownPreview.style.display === 'none') {
            createMarkdownPreview.style.display = 'block';
            createPreviewBtn.textContent = 'Hide Preview';
            updateCreatePreview();
        } else {
            createMarkdownPreview.style.display = 'none';
            createPreviewBtn.textContent = 'Preview';
        }
        if (window.editor) {
            setTimeout(() => window.editor.layout(), 10);
        }
    });
}

function updateViewActions(lang, text) {
    const previewToggleBtn = document.getElementById('preview-toggle-btn');
    const markdownPreview = document.getElementById('markdown-preview');
    if (lang === 'markdown') {
        previewToggleBtn.style.display = 'inline-block';
        previewToggleBtn.textContent = 'Preview';
        markdownPreview.style.display = 'none';
        try {
            markdownPreview.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : '<p style="color:red;">marked is undefined</p>';
        } catch(err) {
            markdownPreview.innerHTML = `<p style="color:red;">Error parsing markdown: ${err.message}</p>`;
        }
    } else {
        previewToggleBtn.style.display = 'none';
        if (markdownPreview) markdownPreview.style.display = 'none';
    }
}

const previewToggleBtn = document.getElementById('preview-toggle-btn');
if (previewToggleBtn) {
    previewToggleBtn.addEventListener('click', () => {
        const viewerWidget = document.getElementById('viewer-widget');
        const markdownPreview = document.getElementById('markdown-preview');
        if (markdownPreview.style.display === 'none') {
            viewerWidget.style.display = 'none';
            markdownPreview.style.display = 'block';
            previewToggleBtn.textContent = 'Code';
        } else {
            markdownPreview.style.display = 'none';
            viewerWidget.style.display = 'block';
            previewToggleBtn.textContent = 'Preview';
        }
    });
}

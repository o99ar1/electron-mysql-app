const { ipcRenderer } = require('electron');

// Save and load functionality
document.getElementById('saveBtn').addEventListener('click', (e) => {
  const button = e.currentTarget;
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
    showStatus('لا يمكن حفظ نص فارغ', 'error');
    animateButton(button, 'error');
    return;
  }
  
  // Show loading state
  animateButton(button, 'loading');
  
  // Simulate network delay (remove in production)
  setTimeout(() => {
    ipcRenderer.send('save-data', text);
  }, 800);
});

document.getElementById('loadBtn').addEventListener('click', (e) => {
  const button = e.currentTarget;
  
  // Show loading state
  animateButton(button, 'loading');
  
  // Simulate network delay (remove in production)
  setTimeout(() => {
    ipcRenderer.send('get-data');
  }, 800);
});

ipcRenderer.on('data-saved', (event, message) => {
  const saveBtn = document.getElementById('saveBtn');
  animateButton(saveBtn, 'success');
  showStatus(message, 'success');
});

ipcRenderer.on('load-data', (event, savedText) => {
  const loadBtn = document.getElementById('loadBtn');
  animateButton(loadBtn, 'success');
  document.getElementById('textInput').value = savedText;
  showStatus('تم تحميل البيانات بنجاح', 'success');
});

ipcRenderer.on('file-data', (event, fileContent) => {
  const loadBtn = document.getElementById('loadBtn');
  animateButton(loadBtn, 'success');
  document.getElementById('textInput').value = fileContent;
  showStatus('تم تحميل الملف بنجاح', 'success');
});

// Button animation function
function animateButton(button, state) {
  // Reset classes
  button.classList.remove('loading', 'success', 'error');
  
  if (state === 'loading') {
    button.classList.add('loading');
    button.disabled = true;
  } else if (state === 'success') {
    button.classList.add('success');
    button.disabled = false;
    
    // Reset after delay
    setTimeout(() => {
      button.classList.remove('success');
    }, 2000);
  } else if (state === 'error') {
    button.classList.add('error');
    button.disabled = false;
    
    // Reset after delay
    setTimeout(() => {
      button.classList.remove('error');
    }, 2000);
  } else {
    button.disabled = false;
  }
}

// Status message handling with animation
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  statusElement.innerText = message;
  
  // Reset classes
  statusElement.className = '';
  
  // Set color based on type
  switch(type) {
    case 'success':
      statusElement.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
      statusElement.style.color = 'var(--success-color)';
      break;
    case 'error':
      statusElement.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
      statusElement.style.color = 'var(--error-color)';
      break;
    case 'warning':
      statusElement.style.backgroundColor = 'rgba(243, 156, 18, 0.1)';
      statusElement.style.color = 'var(--warning-color)';
      break;
    default: // info
      statusElement.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
      statusElement.style.color = 'var(--primary-color)';
  }
  
  // Add icon based on type
  let icon = '';
  switch(type) {
    case 'success':
      icon = '<i class="fa-solid fa-circle-check"></i> ';
      break;
    case 'error':
      icon = '<i class="fa-solid fa-circle-exclamation"></i> ';
      break;
    case 'warning':
      icon = '<i class="fa-solid fa-triangle-exclamation"></i> ';
      break;
    default: // info
      icon = '<i class="fa-solid fa-circle-info"></i> ';
  }
  
  statusElement.innerHTML = icon + message;
  statusElement.style.opacity = '0';
  statusElement.style.transform = 'translateY(10px)';
  statusElement.style.display = 'inline-block';
  
  // Add animation class
  setTimeout(() => {
    statusElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    statusElement.style.opacity = '1';
    statusElement.style.transform = 'translateY(0)';
  }, 10);
  
  // Hide status after 3 seconds
  const hideTimeout = setTimeout(() => {
    statusElement.style.opacity = '0';
    statusElement.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 400);
  }, 3000);
  
  // Allow clicking on status to dismiss it early
  statusElement.onclick = () => {
    clearTimeout(hideTimeout);
    statusElement.style.opacity = '0';
    statusElement.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 400);
  };
}

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
let darkMode = false;

themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  themeToggle.querySelector('i').className = darkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

// Share button functionality
document.querySelector('.share-btn').addEventListener('click', (e) => {
  const button = e.currentTarget;
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
    showStatus('لا يوجد محتوى للمشاركة', 'warning');
    return;
  }
  
  // Show loading state
  animateButton(button, 'loading');
  
  // Simulate copying to clipboard
  setTimeout(() => {
    navigator.clipboard.writeText(text).then(() => {
      animateButton(button, 'success');
      showStatus('تم نسخ المحتوى للمشاركة', 'success');
    }).catch(err => {
      animateButton(button, 'error');
      showStatus('فشل في نسخ المحتوى', 'error');
      console.error('Could not copy text: ', err);
    });
  }, 800);
});

// Toolbar buttons functionality
const toolbarButtons = document.querySelectorAll('.toolbar-btn');
const textInput = document.getElementById('textInput');

// Text formatting functions
function applyFormatting(command, value = null) {
  // Focus the textarea
  textInput.focus();
  
  // Get selection
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  const selectedText = textInput.value.substring(start, end);
  const beforeText = textInput.value.substring(0, start);
  const afterText = textInput.value.substring(end);
  
  // Apply formatting based on command
  let formattedText = selectedText;
  
  switch(command) {
    case 'bold':
      formattedText = `**${selectedText}**`;
      break;
    case 'italic':
      formattedText = `*${selectedText}*`;
      break;
    case 'underline':
      formattedText = `_${selectedText}_`;
      break;
    case 'align-right':
      // For demonstration - in real app would need to handle line by line
      formattedText = `[align=right]${selectedText}[/align]`;
      break;
    case 'align-center':
      formattedText = `[align=center]${selectedText}[/align]`;
      break;
    case 'align-left':
      formattedText = `[align=left]${selectedText}[/align]`;
      break;
    case 'expand':
      // Toggle fullscreen for editor
      document.querySelector('.editor-container').classList.toggle('fullscreen');
      return;
  }
  
  // Update textarea value
  textInput.value = beforeText + formattedText + afterText;
  
  // Update selection to include the formatting
  textInput.selectionStart = start;
  textInput.selectionEnd = start + formattedText.length;
}

// Add event listeners to toolbar buttons
toolbarButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the command from the button's icon class
    const icon = button.querySelector('i');
    let command = '';
    
    if (icon.classList.contains('fa-bold')) command = 'bold';
    else if (icon.classList.contains('fa-italic')) command = 'italic';
    else if (icon.classList.contains('fa-underline')) command = 'underline';
    else if (icon.classList.contains('fa-align-right')) command = 'align-right';
    else if (icon.classList.contains('fa-align-center')) command = 'align-center';
    else if (icon.classList.contains('fa-align-left')) command = 'align-left';
    else if (icon.classList.contains('fa-expand')) command = 'expand';
    
    // Apply the formatting
    applyFormatting(command);
    
    // Toggle active state for the button
    if (command !== 'expand') {
      button.classList.toggle('active');
      
      // Reset after a delay
      setTimeout(() => {
        button.classList.remove('active');
      }, 1000);
    }
  });
});

// Navigation functionality for sidebar menu items
const navItems = document.querySelectorAll('nav li');
let currentView = 'editor'; // Default view

// Content views
const views = {
  editor: {
    title: 'محرر النصوص',
    icon: 'fa-pen-to-square',
    content: `
      <div class="editor-container">
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <button class="toolbar-btn"><i class="fa-solid fa-bold"></i></button>
            <button class="toolbar-btn"><i class="fa-solid fa-italic"></i></button>
            <button class="toolbar-btn"><i class="fa-solid fa-underline"></i></button>
            <span class="divider"></span>
            <button class="toolbar-btn"><i class="fa-solid fa-align-right"></i></button>
            <button class="toolbar-btn"><i class="fa-solid fa-align-center"></i></button>
            <button class="toolbar-btn"><i class="fa-solid fa-align-left"></i></button>
          </div>
          <div class="toolbar-right">
            <button class="toolbar-btn"><i class="fa-solid fa-expand"></i></button>
          </div>
        </div>
        <textarea id="textInput" placeholder="اكتب أي نص هنا..."></textarea>
      </div>
      
      <div class="actions-container">
        <button id="saveBtn" class="btn save-btn"><i class="fa-solid fa-floppy-disk"></i> حفظ البيانات</button>
        <button id="loadBtn" class="btn load-btn"><i class="fa-solid fa-folder-open"></i> تحميل البيانات</button>
        <button class="btn share-btn"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>
      </div>
    `
  },
  files: {
    title: 'الملفات',
    icon: 'fa-folder',
    content: `
      <div class="files-container">
        <div class="files-header">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" placeholder="بحث في الملفات..." id="file-search">
          </div>
          <button class="btn create-file-btn"><i class="fa-solid fa-plus"></i> ملف جديد</button>
        </div>
        
        <div class="files-list">
          <div class="file-item">
            <i class="fa-solid fa-file-lines"></i>
            <span class="file-name">ملاحظات.txt</span>
            <div class="file-actions">
              <button class="file-action-btn"><i class="fa-solid fa-pen"></i></button>
              <button class="file-action-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          
          <div class="file-item">
            <i class="fa-solid fa-file-lines"></i>
            <span class="file-name">مهام.txt</span>
            <div class="file-actions">
              <button class="file-action-btn"><i class="fa-solid fa-pen"></i></button>
              <button class="file-action-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          
          <div class="file-item">
            <i class="fa-solid fa-file-lines"></i>
            <span class="file-name">أفكار.txt</span>
            <div class="file-actions">
              <button class="file-action-btn"><i class="fa-solid fa-pen"></i></button>
              <button class="file-action-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `
  },
  settings: {
    title: 'الإعدادات',
    icon: 'fa-gear',
    content: `
      <div class="settings-container">
        <div class="settings-group">
          <h3><i class="fa-solid fa-palette"></i> المظهر</h3>
          <div class="setting-item">
            <span>الوضع المظلم</span>
            <label class="switch">
              <input type="checkbox" id="dark-mode-toggle">
              <span class="slider round"></span>
            </label>
          </div>
          <div class="setting-item">
            <span>حجم الخط</span>
            <div class="font-size-controls">
              <button class="font-size-btn" data-size="small">صغير</button>
              <button class="font-size-btn active" data-size="medium">متوسط</button>
              <button class="font-size-btn" data-size="large">كبير</button>
            </div>
          </div>
        </div>
        
        <div class="settings-group">
          <h3><i class="fa-solid fa-floppy-disk"></i> الحفظ التلقائي</h3>
          <div class="setting-item">
            <span>تفعيل الحفظ التلقائي</span>
            <label class="switch">
              <input type="checkbox" id="auto-save-toggle" checked>
              <span class="slider round"></span>
            </label>
          </div>
          <div class="setting-item">
            <span>الفاصل الزمني للحفظ (بالثواني)</span>
            <input type="number" min="10" max="300" value="60" id="auto-save-interval">
          </div>
        </div>
        
        <div class="settings-group">
          <h3><i class="fa-solid fa-language"></i> اللغة</h3>
          <div class="setting-item">
            <span>لغة التطبيق</span>
            <select id="app-language">
              <option value="ar" selected>العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        <div class="settings-group">
          <h3><i class="fa-solid fa-circle-info"></i> حول التطبيق</h3>
          <div class="about-app">
            <p>إصدار التطبيق: <span>1.0.0</span></p>
            <p>تم تطويره بواسطة: <span class="highlight">Electron</span></p>
            <button class="btn check-updates-btn"><i class="fa-solid fa-rotate"></i> التحقق من التحديثات</button>
          </div>
        </div>
      </div>
    `
  }
};

// Function to switch between views
function switchView(viewName) {
  if (!views[viewName]) return;
  
  // Update active nav item
  navItems.forEach(item => {
    const itemIcon = item.querySelector('i');
    if (itemIcon.classList.contains(`fa-${views[viewName].icon}`)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update header title
  document.querySelector('header h1').innerHTML = `${views[viewName].title} <span class="emoji">✨</span>`;
  
  // Update main content
  const mainElement = document.querySelector('main');
  mainElement.innerHTML = views[viewName].content;
  
  // Add status container if it doesn't exist
  if (!document.querySelector('.status-container')) {
    const statusContainer = document.createElement('div');
    statusContainer.className = 'status-container';
    statusContainer.innerHTML = '<p id="status"></p>';
    mainElement.appendChild(statusContainer);
  }
  
  // Reinitialize event listeners based on the current view
  if (viewName === 'editor') {
    initializeEditorListeners();
  } else if (viewName === 'files') {
    initializeFilesListeners();
  } else if (viewName === 'settings') {
    initializeSettingsListeners();
  }
  
  // Update current view
  currentView = viewName;
  
  // Show view change message
  showStatus(`تم الانتقال إلى ${views[viewName].title}`, 'success');
  
  // Animate new elements
  animateViewElements();
}

// Add click event listeners to nav items
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const icon = item.querySelector('i');
    
    if (icon.classList.contains('fa-pen-to-square')) {
      switchView('editor');
    } else if (icon.classList.contains('fa-folder')) {
      switchView('files');
    } else if (icon.classList.contains('fa-gear')) {
      switchView('settings');
    }
  });
});

// Initialize editor event listeners
function initializeEditorListeners() {
  // Save button
  document.getElementById('saveBtn')?.addEventListener('click', (e) => {
    const button = e.currentTarget;
    const text = document.getElementById('textInput').value;
    
    if (!text.trim()) {
      showStatus('لا يمكن حفظ نص فارغ', 'error');
      animateButton(button, 'error');
      return;
    }
    
    // Show loading state
    animateButton(button, 'loading');
    
    // Simulate network delay (remove in production)
    setTimeout(() => {
      ipcRenderer.send('save-data', text);
    }, 800);
  });

  // Load button
  document.getElementById('loadBtn')?.addEventListener('click', (e) => {
    const button = e.currentTarget;
    
    // Show loading state
    animateButton(button, 'loading');
    
    // Simulate network delay (remove in production)
    setTimeout(() => {
      ipcRenderer.send('get-data');
    }, 800);
  });

  // Share button
  document.querySelector('.share-btn')?.addEventListener('click', (e) => {
    const button = e.currentTarget;
    const text = document.getElementById('textInput').value;
    
    if (!text.trim()) {
      showStatus('لا يوجد محتوى للمشاركة', 'warning');
      return;
    }
    
    // Show loading state
    animateButton(button, 'loading');
    
    // Simulate copying to clipboard
    setTimeout(() => {
      navigator.clipboard.writeText(text).then(() => {
        animateButton(button, 'success');
        showStatus('تم نسخ المحتوى للمشاركة', 'success');
      }).catch(err => {
        animateButton(button, 'error');
        showStatus('فشل في نسخ المحتوى', 'error');
        console.error('Could not copy text: ', err);
      });
    }, 800);
  });

  // Toolbar buttons
  const toolbarButtons = document.querySelectorAll('.toolbar-btn');
  const textInput = document.getElementById('textInput');

  toolbarButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the command from the button's icon class
      const icon = button.querySelector('i');
      let command = '';
      
      if (icon.classList.contains('fa-bold')) command = 'bold';
      else if (icon.classList.contains('fa-italic')) command = 'italic';
      else if (icon.classList.contains('fa-underline')) command = 'underline';
      else if (icon.classList.contains('fa-align-right')) command = 'align-right';
      else if (icon.classList.contains('fa-align-center')) command = 'align-center';
      else if (icon.classList.contains('fa-align-left')) command = 'align-left';
      else if (icon.classList.contains('fa-expand')) command = 'expand';
      
      // Apply the formatting
      applyFormatting(command);
      
      // Toggle active state for the button
      if (command !== 'expand') {
        button.classList.toggle('active');
        
        // Reset after a delay
        setTimeout(() => {
          button.classList.remove('active');
        }, 1000);
      }
    });
  });
}

// Initialize files view event listeners
function initializeFilesListeners() {
  // File search functionality
  const searchInput = document.getElementById('file-search');
  searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
      const fileName = item.querySelector('.file-name').textContent.toLowerCase();
      if (fileName.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
  
  // Create new file button
  const createFileBtn = document.querySelector('.create-file-btn');
  createFileBtn?.addEventListener('click', () => {
    // Animate button
    createFileBtn.classList.add('animate-pulse');
    
    // Create a new file item
    const filesList = document.querySelector('.files-list');
    const newFileName = `ملف_جديد_${Math.floor(Math.random() * 1000)}.txt`;
    
    const newFileItem = document.createElement('div');
    newFileItem.className = 'file-item animate-fadeIn';
    newFileItem.innerHTML = `
      <i class="fa-solid fa-file-lines"></i>
      <span class="file-name">${newFileName}</span>
      <div class="file-actions">
        <button class="file-action-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="file-action-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    
    filesList.prepend(newFileItem);
    
    // Add event listeners to the new file's buttons
    addFileItemListeners(newFileItem);
    
    // Show success message
    showStatus(`تم إنشاء ${newFileName} بنجاح`, 'success');
    
    // Remove animation class after delay
    setTimeout(() => {
      createFileBtn.classList.remove('animate-pulse');
    }, 1000);
  });
  
  // Add event listeners to existing file items
  document.querySelectorAll('.file-item').forEach(item => {
    addFileItemListeners(item);
  });
}

// Add event listeners to file item buttons
function addFileItemListeners(fileItem) {
  const fileName = fileItem.querySelector('.file-name').textContent;
  const actionBtns = fileItem.querySelectorAll('.file-action-btn');
  
  // Edit button
  actionBtns[0].addEventListener('click', () => {
    // Switch to editor view
    switchView('editor');
    
    // Set the file name as the content (simulating loading the file)
    setTimeout(() => {
      document.getElementById('textInput').value = `محتوى ${fileName} هنا...\n\nهذا مجرد محتوى توضيحي للملف.`;
      showStatus(`تم فتح ${fileName} للتحرير`, 'success');
    }, 300);
  });
  
  // Delete button
  actionBtns[1].addEventListener('click', () => {
    // Add delete confirmation animation
    fileItem.classList.add('file-deleting');
    
    // Simulate deletion after delay
    setTimeout(() => {
      fileItem.classList.add('animate-fadeOut');
      
      setTimeout(() => {
        fileItem.remove();
        showStatus(`تم حذف ${fileName} بنجاح`, 'success');
      }, 300);
    }, 500);
  });
  
  // Make the whole file item clickable to open it
  fileItem.addEventListener('click', (e) => {
    // Only trigger if the click was not on an action button
    if (!e.target.closest('.file-actions')) {
      actionBtns[0].click(); // Simulate clicking the edit button
    }
  });
}

// Initialize settings view event listeners
function initializeSettingsListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.checked = document.body.classList.contains('dark-mode');
  
  darkModeToggle?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = darkModeToggle.checked ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    
    showStatus(darkModeToggle.checked ? 'تم تفعيل الوضع المظلم' : 'تم تفعيل الوضع الفاتح', 'success');
  });
  
  // Font size buttons
  const fontSizeBtns = document.querySelectorAll('.font-size-btn');
  fontSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      fontSizeBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Apply font size
      const size = btn.dataset.size;
      let fontSize = '1rem';
      
      switch(size) {
        case 'small':
          fontSize = '0.9rem';
          break;
        case 'medium':
          fontSize = '1rem';
          break;
        case 'large':
          fontSize = '1.2rem';
          break;
      }
      
      // Apply to textarea if it exists
      const textarea = document.getElementById('textInput');
      if (textarea) {
        textarea.style.fontSize = fontSize;
      }
      
      showStatus(`تم تغيير حجم الخط إلى ${btn.textContent}`, 'success');
    });
  });
  
  // Auto-save toggle
  const autoSaveToggle = document.getElementById('auto-save-toggle');
  autoSaveToggle?.addEventListener('change', () => {
    showStatus(autoSaveToggle.checked ? 'تم تفعيل الحفظ التلقائي' : 'تم تعطيل الحفظ التلقائي', 
      autoSaveToggle.checked ? 'success' : 'warning');
  });
  
  // Check for updates button
  const checkUpdatesBtn = document.querySelector('.check-updates-btn');
  checkUpdatesBtn?.addEventListener('click', () => {
    // Show loading animation
    checkUpdatesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';
    checkUpdatesBtn.disabled = true;
    
    // Simulate checking for updates
    setTimeout(() => {
      checkUpdatesBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> التحقق من التحديثات';
      checkUpdatesBtn.disabled = false;
      showStatus('أنت تستخدم أحدث إصدار من التطبيق', 'success');
    }, 2000);
  });
}

// Function to animate elements in the current view
function animateViewElements() {
  // Animate different elements based on current view
  if (currentView === 'editor') {
    // Animate editor container
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
      editorContainer.classList.add('animate-fadeIn');
      editorContainer.style.animationDelay = '100ms';
    }
    
    // Animate toolbar buttons
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    toolbarBtns.forEach((btn, index) => {
      btn.classList.add('animate-fadeIn');
      btn.style.animationDelay = `${(index + 1) * 50}ms`;
    });
    
    // Animate action buttons
    const actionBtns = document.querySelectorAll('.actions-container .btn');
    actionBtns.forEach((btn, index) => {
      btn.classList.add('animate-slideInUp');
      btn.style.animationDelay = `${(index + 1) * 100}ms`;
    });
  } 
  else if (currentView === 'files') {
    // Animate files header
    const filesHeader = document.querySelector('.files-header');
    if (filesHeader) {
      filesHeader.classList.add('animate-slideInLeft');
    }
    
    // Animate file items with staggered delay
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach((item, index) => {
      item.classList.add('animate-slideInRight');
      item.style.animationDelay = `${(index + 1) * 100}ms`;
    });
  } 
  else if (currentView === 'settings') {
    // Animate settings groups with staggered delay
    const settingsGroups = document.querySelectorAll('.settings-group');
    settingsGroups.forEach((group, index) => {
      group.classList.add('animate-slideInUp');
      group.style.animationDelay = `${index * 100}ms`;
    });
  }
  
  // Remove animation classes after they complete
  setTimeout(() => {
    document.querySelectorAll('.animate-fadeIn, .animate-slideInRight, .animate-slideInLeft, .animate-slideInUp').forEach(el => {
      el.style.animationDelay = '';
      el.classList.remove('animate-fadeIn', 'animate-slideInRight', 'animate-slideInLeft', 'animate-slideInUp');
    });
  }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Add dark mode styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .dark-mode {
      --bg-color: #1a1a2e;
      --bg-content: #16213e;
      --text-color: #e6e6e6;
      --text-light: #b8b8b8;
      --border-color: #2a2a4a;
    }
    
    .dark-mode .editor-toolbar {
      background-color: #1e1e30;
      border-color: #2a2a4a;
    }
    
    .dark-mode textarea {
      color: #e6e6e6;
      background-color: #16213e;
    }
    
    .dark-mode .load-btn {
      background-color: #2a2a4a;
      color: #e6e6e6;
      border-color: #3a3a5a;
    }

    .dark-mode #status {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    .dark-mode .toolbar-btn:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .dark-mode .toolbar-btn.active {
      background-color: rgba(76, 201, 240, 0.1);
      color: var(--accent-color);
    }
    
    .dark-mode .file-item {
      background-color: #1e1e30;
      border-color: #2a2a4a;
    }
    
    .dark-mode .file-item:hover {
      background-color: #2a2a4a;
    }
    
    .dark-mode .search-box input {
      background-color: #1e1e30;
      color: #e6e6e6;
      border-color: #2a2a4a;
    }
    
    .dark-mode .settings-group {
      background-color: #1e1e30;
      border-color: #2a2a4a;
    }
    
    .dark-mode .setting-item {
      border-color: rgba(255, 255, 255, 0.05);
    }
    
    .dark-mode .font-size-btn {
      background-color: #2a2a4a;
      color: #e6e6e6;
    }
    
    .dark-mode .font-size-btn.active {
      background-color: var(--primary-color);
    }
    
    .dark-mode select, .dark-mode input[type="number"] {
      background-color: #1e1e30;
      color: #e6e6e6;
      border-color: #2a2a4a;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize the editor view (default)
  initializeEditorListeners();
  
  // Add animations to elements
  animateElementsOnLoad();
  
  // Show welcome message
  setTimeout(() => {
    showStatus('مرحباً بك في محرر النصوص الجديد ✨');
  }, 1000);
});

// Add keyframe for fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  .animate-fadeOut {
    animation: fadeOut 0.3s ease forwards;
  }
  
  .file-deleting {
    background-color: rgba(231, 76, 60, 0.1) !important;
    border-color: var(--error-color) !important;
  }
  
  /* Files view styles */
  .files-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: var(--bg-content);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 20px;
    height: 100%;
  }
  
  .files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    background-color: var(--bg-color);
    border-radius: var(--radius-md);
    padding: 8px 15px;
    flex: 1;
    max-width: 300px;
  }
  
  .search-box i {
    color: var(--text-light);
    margin-left: 10px;
  }
  
  .search-box input {
    border: none;
    background: transparent;
    width: 100%;
    font-family: 'Tajawal', Arial, sans-serif;
    color: var(--text-color);
  }
  
  .search-box input:focus {
    outline: none;
  }
  
  .create-file-btn {
    background-color: var(--accent-color);
    color: white;
  }
  
  .files-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    flex: 1;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    background-color: white;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    transition: var(--transition);
    cursor: pointer;
  }
  
  .file-item:hover {
    background-color: var(--bg-color);
    transform: translateX(-5px);
  }
  
  .file-item i {
    color: var(--primary-color);
    font-size: 1.2rem;
    margin-left: 12px;
  }
  
  .file-name {
    flex: 1;
    font-weight: 500;
  }
  
  .file-actions {
    display: flex;
    gap: 5px;
  }
  
  .file-action-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background-color: transparent;
    color: var(--text-light);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }
  
  .file-action-btn:hover {
    background-color: var(--bg-color);
    color: var(--primary-color);
  }
  
  /* Settings view styles */
  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    padding-bottom: 20px;
  }
  
  .settings-group {
    background-color: var(--bg-content);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }
  
  .settings-group h3 {
    padding: 15px 20px;
    margin: 0;
    background-color: var(--primary-color);
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .setting-item {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  /* Switch toggle */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    right: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
  }
  
  input:checked + .slider {
    background-color: var(--primary-color);
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px var(--primary-color);
  }
  
  input:checked + .slider:before {
    transform: translateX(-26px);
  }
  
  .slider.round {
    border-radius: 34px;
  }
  
  .slider.round:before {
    border-radius: 50%;
  }
  
  .font-size-controls {
    display: flex;
    gap: 5px;
  }
  
  .font-size-btn {
    padding: 5px 10px;
    border: none;
    border-radius: var(--radius-sm);
    background-color: var(--bg-color);
    cursor: pointer;
    transition: var(--transition);
    font-family: 'Tajawal', Arial, sans-serif;
  }
  
  .font-size-btn.active {
    background-color: var(--primary-color);
    color: white;
  }
  
  .about-app {
    padding: 15px 20px;
  }
  
  .about-app p {
    margin: 10px 0;
  }
  
  .check-updates-btn {
    margin-top: 15px;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }
  
  select, input[type="number"] {
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    font-family: 'Tajawal', Arial, sans-serif;
    min-width: 100px;
  }
  
  input[type="number"] {
    width: 80px;
    text-align: center;
  }
`;
document.head.appendChild(fadeOutStyle);

// Function to animate elements when page loads
function animateElementsOnLoad() {
  // Animate logo
  const logo = document.querySelector('.logo');
  logo.classList.add('animate-fadeIn');
  
  // Animate sidebar nav items with delay
  const navItems = document.querySelectorAll('nav li');
  navItems.forEach((item, index) => {
    item.classList.add('animate-slideInRight');
    item.style.animationDelay = `${(index + 1) * 100}ms`;
  });
  
  // Animate header
  const header = document.querySelector('header');
  header.classList.add('animate-slideInLeft');
  
  // Animate editor container
  const editorContainer = document.querySelector('.editor-container');
  editorContainer.classList.add('animate-fadeIn');
  editorContainer.style.animationDelay = '300ms';
  
  // Animate buttons with delay
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((btn, index) => {
    btn.classList.add('animate-slideInUp');
    btn.style.animationDelay = `${(index + 4) * 100}ms`;
  });
  
  // Animate toolbar buttons
  const toolbarBtns = document.querySelectorAll('.toolbar-btn');
  toolbarBtns.forEach((btn, index) => {
    btn.classList.add('animate-fadeIn');
    btn.style.animationDelay = `${(index + 2) * 50}ms`;
  });
  
  // Remove animation classes after they complete
  setTimeout(() => {
    document.querySelectorAll('.animate-fadeIn, .animate-slideInRight, .animate-slideInLeft, .animate-slideInUp').forEach(el => {
      el.style.animationDelay = '';
      el.classList.remove('animate-fadeIn', 'animate-slideInRight', 'animate-slideInLeft', 'animate-slideInUp');
    });
  }, 2000);
}

// Dashboard.js 
document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  const currentUser = {
    name: "Student",
    email: "revizrlearn",
  };
  
  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Welcome!",
      message: "Get started with Revizrlearn to create flashcards.",
      time: "2 hours ago",
      read: false
    },
    {
      id: 3,
      title: "New Feature Available",
      message: "Try out our new 'Spaced Repetition' mode for more effective learning.",
      time: "3 days ago",
      read: false
    }
  ];

  // Initialize the dashboard
  initDashboard();

  // Function to initialize the dashboard
  function initDashboard() {
    updateDateTime();
    loadUserInfo();
    loadFlashcardSets();
    updateNotificationCount();
    setupEventListeners();
  }

  // Update date and time
  function updateDateTime() {
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', options);
  }

  // Load user information
  function loadUserInfo() {
    document.getElementById('username').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
  }

  // Load flashcard sets from localStorage
function loadFlashcardSets() {
  const flashcardSetsContainer = document.getElementById('flashcard-sets');
  flashcardSetsContainer.innerHTML = '';

  // Get flashcard sets from localStorage
  const flashcardSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
  
  if (flashcardSets.length === 0) {
    flashcardSetsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-open fa-3x"></i>
        <p>You don't have any flashcard sets yet.</p>
        <button class="start-btn">Create Your First Set</button>
      </div>
    `;
    
    // Add event listener to the create button
    const createButton = flashcardSetsContainer.querySelector('.start-btn');
    if (createButton) {
      createButton.addEventListener('click', function() {
        window.location.href = 'flashcards_editor.html';
      });
    }
    return;
  }

  // Sort sets by last modified date (most recent first)
  flashcardSets.sort((a, b) => {
    return new Date(b.lastModified) - new Date(a.lastModified);
  });

  // Display only the 4 most recently modified sets
  const recentSets = flashcardSets.slice(0, 4);

  recentSets.forEach(set => {
    const progress = calculateProgress(set);
    const lastStudied = formatLastStudied(set);
    
    const setItem = document.createElement('div');
    setItem.className = 'set-item';
    setItem.innerHTML = `
      <div class="set-icon ${set.category || 'default'}">
        <i class="fas fa-${getCategoryIcon(set.category)}"></i>
      </div>
      <div class="set-info">
        <h3>${set.title}</h3>
        <p>${set.cards.length} cards • Last studied: ${lastStudied}</p>
        <div class="progress-bar">
          <div class="progress" style="width: ${progress}%"></div>
        </div>
      </div>
      <button class="study-btn" data-set-id="${set.id}">
        <i class="fas fa-play"></i>
      </button>
    `;
    flashcardSetsContainer.appendChild(setItem);
  });

  // Add event listeners to study buttons
  document.querySelectorAll('.study-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const setId = this.getAttribute('data-set-id');
      const set = flashcardSets.find(s => s.id === setId);
      if (set) {
        showToast('info', `Opening ${set.title} for study...`);
        // Update the lastStudied time
        updateLastStudied(setId);
        // Redirect to study mode
        window.location.href = `study_mode.html?setId=${setId}`;
      }
    });
  });
}

  // Calculate progress for a flashcard set
  function calculateProgress(set) {
    // Check if we have a stored progress for this set
    const progressData = JSON.parse(localStorage.getItem('flashcardProgress') || '{}');
    
    if (progressData[set.id]) {
      return progressData[set.id];
    }
    
    // If no stored progress, return 0 (no progress yet)
    return 0;
  }

  // Format the last studied date
  function formatLastStudied(set) {
    // Check if we have a stored last studied date
    const studyData = JSON.parse(localStorage.getItem('flashcardStudyDates') || '{}');
    
    if (studyData[set.id]) {
      return getRelativeTimeString(new Date(studyData[set.id]));
    }
    
    // If never studied, return "Never"
    return "Never";
  }

  // Update last studied date for a set
  function updateLastStudied(setId) {
    // Get current study dates
    const studyData = JSON.parse(localStorage.getItem('flashcardStudyDates') || '{}');
    
    // Update the date for this set
    studyData[setId] = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('flashcardStudyDates', JSON.stringify(studyData));
    
    // Refresh the display
    loadFlashcardSets();
  }

  // Get a relative time string 
  function getRelativeTimeString(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 6) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 1) {
      return `${days} days ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Get icon for category
  function getCategoryIcon(category) {
    const icons = {
      biology: 'leaf',
      math: 'calculator',
      history: 'landmark',
      computer: 'laptop-code',
      language: 'language',
      science: 'atom'
    };
    return icons[category] || 'book';
  }

  // Update notification count
  function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-count');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  // Setup event listeners
  function setupEventListeners() {
    // Toggle sidebar
    window.toggleSidebar = function() {
      document.getElementById('sidebar').classList.toggle('collapsed');
    };

    // Profile dropdown
    const profileToggle = document.getElementById('profile-dropdown-toggle');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    profileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      profileDropdown.classList.remove('show');
    });

    // Notification bell
    const notificationBell = document.getElementById('notification-bell');
    const notificationsModal = document.getElementById('notifications-modal');
    const closeNotifications = document.getElementById('close-notifications');
    
    notificationBell.addEventListener('click', function() {
      loadNotifications();
      notificationsModal.classList.add('show');
    });
    
    closeNotifications.addEventListener('click', function() {
      notificationsModal.classList.remove('show');
    });

    // Logout button - Enhanced
    document.getElementById('logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      // Show the logout toast notification with a success type
      showToast('info', 'Logging out...');
      
      // Redirect to index.html after a short delay to allow the toast to be seen
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    });
    
    // Add "View All Sets" button handler if the button exists
    const viewAllSetsBtn = document.getElementById('view-all-sets');
    if (viewAllSetsBtn) {
      viewAllSetsBtn.addEventListener('click', function() {
        window.location.href = 'flashcards.html';
      });
    }

    // Add "Create Your First Set" button handler for empty state
    const createFirstSetBtn = document.querySelector('.empty-state .start-btn');
    if (createFirstSetBtn) {
      createFirstSetBtn.addEventListener('click', function() {
        window.location.href = 'flashcards_editor.html';
      });
    }
  }

  // Load notifications into modal
  function loadNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<p class="empty-state">No notifications at this time.</p>';
      return;
    }
    
    notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = `notification-item ${notification.read ? '' : 'notification-unread'}`;
      notificationItem.innerHTML = `
        <div class="notification-header">
          <span class="notification-title">${notification.title}</span>
          <span class="notification-time">${notification.time}</span>
        </div>
        <p class="notification-message">${notification.message}</p>
      `;
      notificationsList.appendChild(notificationItem);
      
      // Mark notification as read when clicked
      notificationItem.addEventListener('click', function() {
        if (!notification.read) {
          notification.read = true;
          this.classList.remove('notification-unread');
          updateNotificationCount();
        }
      });
    });
  }
  
  // Show toast notification
  function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    // Set toast type
    toast.className = 'toast toast-' + type;
    
    // Set icon based on type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    toastIcon.className = 'fas ' + iconClass;
    toastMessage.textContent = message;
    
    // Reset and restart animation if toast is already showing
    toast.classList.remove('show');
    
    // Force a reflow to ensure the animation restarts properly
    void toast.offsetWidth;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after animation completes
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Add window resize event listener to handle sidebar state
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
      document.getElementById('sidebar').classList.add('collapsed');
    }
  });

  // Initially collapse sidebar on mobile
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.add('collapsed');
  }
});

// Notes.js for Revizrlearn
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const notesListElement = document.getElementById('notes-list');
  const notesEditorContainer = document.getElementById('notes-editor-container');
  const notesEditor = document.getElementById('notes-editor');
  const noteTitle = document.getElementById('note-title');
  const noteContent = document.getElementById('note-content');
  const createNoteBtn = document.getElementById('create-note-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const deleteNoteBtn = document.getElementById('delete-note-btn');
  const confirmDeleteModal = document.getElementById('confirm-delete-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const closeConfirmDelete = document.getElementById('close-confirm-delete');
  const colorPickerBtn = document.getElementById('note-color-btn');
  const colorPicker = document.getElementById('color-picker');
  const notesSearchInput = document.getElementById('notes-search');
  const formatButtons = document.querySelectorAll('.format-btn');

  // State variables
  let notes = [];
  let activeNoteId = null;
  let isEditing = false;

  // Initialize notes feature
  init();

  function init() {
    // Load notes from local storage
    loadNotes();
    // Setup event listeners
    setupEventListeners();
    // Initialize formatting toolbar
    initFormatToolbar();
  }

  // Load notes from localStorage
  function loadNotes() {
    const savedNotes = localStorage.getItem('revizrNotes');
    notes = savedNotes ? JSON.parse(savedNotes) : [];
    renderNotesList();
  }

  // Save notes to localStorage
  function saveNotesToStorage() {
    localStorage.setItem('revizrNotes', JSON.stringify(notes));
  }

  // Render the notes list
  function renderNotesList(searchQuery = '') {
    notesListElement.innerHTML = '';
    
    let filteredNotes = notes;
    
    // Filter notes if search query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Sort notes by last modified date (newest first)
    filteredNotes.sort((a, b) => b.lastModified - a.lastModified);

    if (filteredNotes.length === 0) {
      notesListElement.innerHTML = `
        <div class="empty-notes-message">
          <i class="fas fa-sticky-note"></i>
          <p>${searchQuery ? 'No notes match your search.' : 'No notes yet. Create your first note!'}</p>
        </div>
      `;
      return;
    }

    // Create note items
    filteredNotes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = `note-item${note.id === activeNoteId ? ' active' : ''}`;
      noteItem.dataset.noteId = note.id;
      
      // Get plain text from HTML content for preview
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = note.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Format the date
      const date = new Date(note.lastModified);
      const formattedDate = formatDate(date);

      noteItem.innerHTML = `
        <div class="note-item-title">${note.title || 'Untitled Note'}</div>
        <div class="note-item-preview">${textContent.substring(0, 100)}</div>
        <div class="note-item-date">${formattedDate}</div>
      `;

      // Set background color from note if it exists
      if (note.color) {
        noteItem.style.backgroundColor = note.color;
      }

      notesListElement.appendChild(noteItem);

      // Add event listener to note item
      noteItem.addEventListener('click', () => openNote(note.id));
    });
  }

  // Format date helper function
  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 6) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Open a note for editing
  function openNote(noteId) {
    const note = notes.find(note => note.id === noteId);
    if (!note) return;

    activeNoteId = noteId;
    isEditing = true;

    // Update UI
    document.querySelectorAll('.note-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.noteId === noteId) {
        item.classList.add('active');
      }
    });

    // Set note content
    noteTitle.value = note.title;
    noteContent.innerHTML = note.content;
    
    // Set note background color if it exists
    if (note.color) {
      noteContent.style.backgroundColor = note.color;
      noteTitle.style.backgroundColor = note.color;
    } else {
      noteContent.style.backgroundColor = '';
      noteTitle.style.backgroundColor = '';
    }

    // Show editor
    notesEditorContainer.querySelector('.notes-editor-placeholder').style.display = 'none';
    notesEditor.style.display = 'flex';
    
    // Reset formatting button states
    resetFormatButtonStates();
  }

  // Create a new note
  function createNewNote() {
    const newNote = {
      id: generateId(),
      title: '',
      content: '',
      color: '#ffffff',
      created: Date.now(),
      lastModified: Date.now()
    };

    notes.unshift(newNote);
    saveNotesToStorage();
    renderNotesList();
    openNote(newNote.id);
    
    // Show toast notification
    window.showToast('success', 'New note created');
    
    // Set focus to the title field
    noteTitle.focus();
  }

  // Save the current note
  function saveCurrentNote() {
    if (!isEditing || activeNoteId === null) return;

    const noteIndex = notes.findIndex(note => note.id === activeNoteId);
    if (noteIndex === -1) return;

    notes[noteIndex].title = noteTitle.value;
    notes[noteIndex].content = noteContent.innerHTML;
    notes[noteIndex].lastModified = Date.now();

    saveNotesToStorage();
    renderNotesList();
    
    // Show toast notification
    window.showToast('success', 'Note saved successfully');
  }

  // Delete the current note
  function deleteCurrentNote() {
    if (activeNoteId === null) return;

    const noteIndex = notes.findIndex(note => note.id === activeNoteId);
    if (noteIndex === -1) return;

    notes.splice(noteIndex, 1);
    saveNotesToStorage();
    
    // Reset editor state
    resetEditor();
    renderNotesList();
    
    // Close modal
    confirmDeleteModal.classList.remove('show');
    
    // Show toast notification
    window.showToast('info', 'Note deleted');
  }

  // Show delete confirmation modal
  function showDeleteConfirmation() {
    if (activeNoteId === null) return;
    confirmDeleteModal.classList.add('show');
  }

  // Reset editor state
  function resetEditor() {
    activeNoteId = null;
    isEditing = false;
    noteTitle.value = '';
    noteContent.innerHTML = '';
    noteContent.style.backgroundColor = '';
    noteTitle.style.backgroundColor = '';
    notesEditor.style.display = 'none';
    notesEditorContainer.querySelector('.notes-editor-placeholder').style.display = 'flex';
    resetFormatButtonStates();
  }

  // Initialize formatting toolbar
  function initFormatToolbar() {
    // Format buttons
    formatButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const format = this.getAttribute('data-format');
        document.execCommand(format, false, null);
        noteContent.focus();
        updateFormatButtonStates();
      });
    });

    // Add selection change listener to update button states
    noteContent.addEventListener('mouseup', updateFormatButtonStates);
    noteContent.addEventListener('keyup', updateFormatButtonStates);
    
    // Initialize button states
    updateFormatButtonStates();

    // Color picker toggle
    colorPickerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      colorPicker.classList.toggle('show');
    });

    // Close color picker when clicking outside
    document.addEventListener('click', function() {
      colorPicker.classList.remove('show');
    });

    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const color = this.getAttribute('data-color');
        
        if (activeNoteId !== null) {
          const noteIndex = notes.findIndex(note => note.id === activeNoteId);
          if (noteIndex !== -1) {
            notes[noteIndex].color = color;
            noteContent.style.backgroundColor = color;
            noteTitle.style.backgroundColor = color;
            saveNotesToStorage();
            renderNotesList();
          }
        }
        
        colorPicker.classList.remove('show');
      });
    });
  }
  
  // Update format button states based on current selection
  function updateFormatButtonStates() {
    if (!isEditing) return;
    
    formatButtons.forEach(btn => {
      const format = btn.getAttribute('data-format');
      
      // Check if the format is currently active
      if (document.queryCommandState(format)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Reset all format button states
  function resetFormatButtonStates() {
    formatButtons.forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // Helper function to generate a unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Create new note
    createNoteBtn.addEventListener('click', createNewNote);
    
    // Save note
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    
    // Auto-save when editor loses focus
    noteContent.addEventListener('blur', saveCurrentNote);
    noteTitle.addEventListener('blur', saveCurrentNote);
    
    // Delete note
    deleteNoteBtn.addEventListener('click', showDeleteConfirmation);
    
    // Confirm delete
    confirmDeleteBtn.addEventListener('click', deleteCurrentNote);
    
    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
      confirmDeleteModal.classList.remove('show');
    });
    
    // Close delete confirmation modal
    closeConfirmDelete.addEventListener('click', () => {
      confirmDeleteModal.classList.remove('show');
    });
    
    // Search notes
    notesSearchInput.addEventListener('input', function() {
      renderNotesList(this.value);
    });
    
    // Handle keyboard shortcuts for formatting
    noteContent.addEventListener('keydown', function(e) {
      // Check if ctrl or cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        let formatCommand = null;
        
        // Handle common formatting shortcuts
        switch(e.key.toLowerCase()) {
          case 'b':
            formatCommand = 'bold';
            break;
          case 'i':
            formatCommand = 'italic';
            break;
          case 'u':
            formatCommand = 'underline';
            break;
        }
        
        if (formatCommand) {
          e.preventDefault();
          document.execCommand(formatCommand, false, null);
          updateFormatButtonStates();
        }
      }
    });
  }
});

// Make showToast function available to notes.js
// This is needed because the function is defined in dashboard.js
if (typeof window.showToast !== 'function') {
  window.showToast = function(type, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    // Set toast type
    toast.className = 'toast toast-' + type;
    
    // Set icon based on type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    toastIcon.className = 'fas ' + iconClass;
    toastMessage.textContent = message;
    
    // Reset and restart animation if toast is already showing
    toast.classList.remove('show');
    
    // Force a reflow to ensure the animation restarts properly
    void toast.offsetWidth;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after animation completes
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Revizrlearn/service-worker.js');
  });
}

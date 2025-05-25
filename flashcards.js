// Flashcards.js
// Sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

// Global variables
let flashcardSets = [];
let currentCategory = 'all';
let currentSetId = null;
let currentCardIndex = 0;
let currentCards = [];
let nextAvailableId = 1; 
let setToDelete = null; 

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Load flashcard sets
  loadFromLocalStorage();
  
  // Load categories and populate filter buttons
  loadCategoriesAndPopulateFilters();
  
  // Render flashcard sets
  renderFlashcardSets();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check URL for any parameters
  checkUrlParameters();
});

// Load categories from localStorage and populate filter buttons
function loadCategoriesAndPopulateFilters() {
  // Load categories from localStorage
  const categories = JSON.parse(localStorage.getItem('flashcardCategories') || '[]');
  
  // Get the filter buttons container
  const filterButtons = document.getElementById('category-filters');
  
  // Add event listener to the "All" button which is already in the HTML
  const allButton = document.querySelector('.filter-btn[data-category="all"]');
  if (allButton) {
    allButton.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter flashcards
      currentCategory = this.getAttribute('data-category');
      renderFlashcardSets();
    });
  }
  
  // Add a button for each category
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.setAttribute('data-category', category);
    button.textContent = capitalizeFirstLetter(category);
    
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter flashcards
      currentCategory = this.getAttribute('data-category');
      renderFlashcardSets();
    });
    
    filterButtons.appendChild(button);
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Filter buttons - now handled in loadCategoriesAndPopulateFilters

  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  // Search on button click
  searchBtn.addEventListener('click', function() {
    searchFlashcards(searchInput.value);
  });
  
  // Search on Enter key
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchFlashcards(this.value);
    }
  });
  
  // Back button
  document.getElementById('back-to-sets').addEventListener('click', function() {
    showFlashcardSets();
  });
  
  // Flip card button
  document.getElementById('flip-card').addEventListener('click', function() {
    flipCard();
  });
  
  // Clicking on the card also flips it
  document.getElementById('current-card').addEventListener('click', function() {
    flipCard();
  });
  
  // Previous card button
  document.getElementById('prev-card').addEventListener('click', function() {
    navigateCards(-1);
  });
  
  // Next card button
  document.getElementById('next-card').addEventListener('click', function() {
    navigateCards(1);
  });
  
  // Shuffle button
  document.getElementById('shuffle-btn').addEventListener('click', function() {
    shuffleCards();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (document.getElementById('flashcard-study-container').style.display === 'flex') {
      if (e.key === 'ArrowLeft') {
        navigateCards(-1);
      } else if (e.key === 'ArrowRight') {
        navigateCards(1);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scrolling
        flipCard();
      }
    }
  });
  
  // Delete modal buttons
  document.getElementById('cancel-delete').addEventListener('click', function() {
    closeDeleteModal();
  });
  
  document.getElementById('confirm-delete').addEventListener('click', function() {
    executeDelete();
  });
}

// Show delete confirmation modal
function showDeleteModal(setId) {
  // Store the setId for later use
  setToDelete = setId;
  
  // Get the set name
  const set = getFlashcardSet(setId);
  if (!set) return;
  
  // Update the modal with the set name
  document.getElementById('delete-set-name').textContent = set.title;
  document.getElementById('deleting-set-name').textContent = set.title;
  
  // Show the modal
  const modal = document.getElementById('delete-modal');
  modal.style.display = 'flex';
}

// Close the delete modal
function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  modal.style.display = 'none';
  
  // Hide the loading screen if visible
  document.getElementById('delete-loading').style.display = 'none';
  
  // Clear the set to delete
  setToDelete = null;
}

// Execute the delete operation with loading indicator
function executeDelete() {
  if (!setToDelete) return;
  
  // Show loading indicator
  document.getElementById('delete-loading').style.display = 'flex';
  
  // Add a small delay to show the loading indicator (for demo purposes)
  setTimeout(() => {
    // Delete the flashcard set
    deleteFlashcardSet(setToDelete);
    
    // Close the modal
    closeDeleteModal();
    
    // Re-render the flashcard sets
    renderFlashcardSets();
    
    // Show a success notification
    showNotification('Flashcard set deleted successfully!');
  }, 800); // 800ms delay to show the loading indicator
}

// Check URL for parameters (e.g., when returning from editor)
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const fromEditor = urlParams.get('from');
  
  if (fromEditor === 'editor') {
    // Show a success message
    showNotification('Flashcard set saved successfully!');
    
    // Clean up the URL
    window.history.replaceState({}, document.title, 'flashcards.html');
  }
}

// Show a temporary notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  // Add the notification to the page
  document.body.appendChild(notification);
  
  // Style it with CSS (add these styles to your CSS file)
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-20px)';
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  
  // Show the notification with animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Render flashcard sets based on current filter and search term
function renderFlashcardSets(searchTerm = '') {
  const flashcardGrid = document.getElementById('flashcard-grid');
  flashcardGrid.innerHTML = '';
  
  // Filter sets based on selected category and search term
  let filteredSets = currentCategory === 'all' 
    ? flashcardSets 
    : flashcardSets.filter(set => set.category === currentCategory);
  
  // Apply search filter if provided
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredSets = filteredSets.filter(set => {
      // Search in title
      if (set.title.toLowerCase().includes(term)) return true;
      
      // Search in cards content - handle both formats (term/definition and front/back)
      return set.cards.some(card => {
        const front = card.front || card.term;
        const back = card.back || card.definition;
        return (front && front.toLowerCase().includes(term)) || 
               (back && back.toLowerCase().includes(term));
      });
    });
  }
  
  // Check if there are any flashcard sets
  if (filteredSets.length === 0) {
    let message = searchTerm ? 
      'No flashcard sets found matching your search.' : 
      'No flashcard sets available.';
    
    const emptyStateMessage = (flashcardSets.length === 0) ? 
      displayEmptyState() : 
      `
      <div class="empty-state">
        <i class="fas fa-layer-group"></i>
        <h3>${message}</h3>
        <p>Create a new flashcard set to start studying!</p>
        <a href="flashcards_editor.html" class="start-creating-btn">Create Flashcards</a>
      </div>
      `;
    
    flashcardGrid.innerHTML = emptyStateMessage;
    return;
  }
  
  // Render each set
  filteredSets.forEach(set => {
    // Use the category directly from the set
    const category = set.category || 'uncategorized';
    
    const setElement = document.createElement('div');
    setElement.className = `flashcard-set category-${category.toLowerCase().replace(/\s+/g, '-')}`;
    setElement.innerHTML = `
      <div class="set-header">
        <h3 class="set-title">${set.title}</h3>
        <span class="set-category">${capitalizeFirstLetter(category)}</span>
      </div>
      <div class="set-body">
        <div class="set-info">
          <span class="card-count"><i class="fas fa-clone"></i> ${set.cards.length} cards</span>
        </div>
        <div class="set-actions">
          <button class="study-btn" data-set-id="${set.id}">Study</button>
          <button class="edit-btn" data-set-id="${set.id}">Edit</button>
          <button class="delete-btn" data-set-id="${set.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    flashcardGrid.appendChild(setElement);
    
    // Add event listeners to the buttons
    setElement.querySelector('.study-btn').addEventListener('click', function() {
      const setId = this.getAttribute('data-set-id');
      openFlashcardSet(setId);
    });
    
    setElement.querySelector('.edit-btn').addEventListener('click', function() {
      const setId = this.getAttribute('data-set-id');
      window.location.href = `flashcards_editor.html?id=${setId}`;
    });
    
    setElement.querySelector('.delete-btn').addEventListener('click', function() {
      const setId = this.getAttribute('data-set-id');
      // Use our custom modal instead of confirm()
      showDeleteModal(setId);
    });
  });
}

// Create an enhanced empty state when no flashcards exist
function displayEmptyState() {
  return `
    <div class="empty-state-centered">
      <div class="empty-state-icon">
        <i class="fas fa-brain"></i>
      </div>
      <h2>Get Started with Flashcards!</h2>
      <p>Create your first set of flashcards to begin studying effectively.</p>
      <div class="features-grid">
        <div class="feature">
          <i class="fas fa-plus-circle"></i>
          <span>Create custom flashcards</span>
        </div>
        <div class="feature">
          <i class="fas fa-sync-alt"></i>
          <span>Practice with spaced repetition</span>
        </div>
        <div class="feature">
          <i class="fas fa-chart-line"></i>
          <span>Track your progress</span>
        </div>
      </div>
      <a href="flashcards_editor.html" class="get-started-btn">Create Your First Flashcard Set</a>
    </div>
  `;
}

// Search flashcards
function searchFlashcards(term) {
  renderFlashcardSets(term);
}

// Open a flashcard set for studying
function openFlashcardSet(setId) {
  const set = flashcardSets.find(s => s.id === setId || s.id.toString() === setId.toString());
  if (!set) return;
  
  currentSetId = setId;
  
  // Convert cards format if needed (term/definition -> front/back)
  currentCards = set.cards.map(card => {
    return {
      front: card.front || card.term,
      back: card.back || card.definition
    };
  });
  
  currentCardIndex = 0;
  
  // Update the UI
  document.getElementById('set-title').textContent = set.title;
  updateCardCounter();
  updateCardContent();
  
  // Show the study container and hide the sets grid
  document.getElementById('flashcard-grid').style.display = 'none';
  document.querySelector('.filter-section').style.display = 'none';
  document.getElementById('flashcard-study-container').style.display = 'flex';
  
  // Ensure card is not flipped initially
  document.getElementById('current-card').classList.remove('flipped');
}

// Show flashcard sets and hide study container
function showFlashcardSets() {
  document.getElementById('flashcard-grid').style.display = 'grid';
  document.querySelector('.filter-section').style.display = 'block';
  document.getElementById('flashcard-study-container').style.display = 'none';
}

// Update the content of the current card
function updateCardContent() {
  const card = currentCards[currentCardIndex];
  const cardElement = document.getElementById('current-card');
  
  // Update front and back content
  cardElement.querySelector('.card-front .card-content').textContent = card.front;
  cardElement.querySelector('.card-back .card-content').textContent = card.back;
  
  // Ensure card is not flipped when changing cards
  cardElement.classList.remove('flipped');
}

// Update the card counter
function updateCardCounter() {
  const counter = document.getElementById('card-counter');
  counter.textContent = `Card ${currentCardIndex + 1} of ${currentCards.length}`;
}

// Navigate between cards
function navigateCards(direction) {
  // Calculate new index
  currentCardIndex = (currentCardIndex + direction + currentCards.length) % currentCards.length;
  
  // Update the UI
  updateCardCounter();
  updateCardContent();
}

// Flip the current card
function flipCard() {
  const cardElement = document.getElementById('current-card');
  cardElement.classList.toggle('flipped');
}

// Shuffle the cards
function shuffleCards() {
  // Fisher-Yates shuffle algorithm
  for (let i = currentCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
  }
  
  // Reset to the first card
  currentCardIndex = 0;
  updateCardCounter();
  updateCardContent();
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  if (!string) return 'Uncategorized';
  return string.charAt(0).toUpperCase() + string.replace('-', ' ').slice(1);
}

// Save flashcards to localStorage
function saveToLocalStorage() {
  localStorage.setItem('flashcardSets', JSON.stringify(flashcardSets));
  localStorage.setItem('nextAvailableId', nextAvailableId.toString());
}

// Load flashcards from localStorage
function loadFromLocalStorage() {
  const savedSets = localStorage.getItem('flashcardSets');
  const savedId = localStorage.getItem('nextAvailableId');
  
  if (savedSets) {
    flashcardSets = JSON.parse(savedSets);
  } else {
    // Initialize with empty array, no default sets
    flashcardSets = [];
    saveToLocalStorage();
  }
  
  if (savedId) {
    nextAvailableId = parseInt(savedId);
  }
}

// Add a new flashcard set
function addFlashcardSet(newSet) {
  // Set the ID
  newSet.id = nextAvailableId++;
  
  // Add to array
  flashcardSets.push(newSet);
  
  // Save to localStorage
  saveToLocalStorage();
  
  return newSet.id;
}

// Update an existing flashcard set
function updateFlashcardSet(setId, updatedSet) {
  const index = flashcardSets.findIndex(set => 
    set.id === setId || set.id.toString() === setId.toString()
  );
  
  if (index !== -1) {
    // Keep the ID the same
    updatedSet.id = flashcardSets[index].id;
    
    // Update the set
    flashcardSets[index] = updatedSet;
    
    // Save to localStorage
    saveToLocalStorage();
    
    return true;
  }
  
  return false;
}

// Delete a flashcard set
function deleteFlashcardSet(setId) {
  const index = flashcardSets.findIndex(set => 
    set.id === setId || set.id.toString() === setId.toString()
  );
  
  if (index !== -1) {
    // Remove the set
    flashcardSets.splice(index, 1);
    
    // Save to localStorage
    saveToLocalStorage();
    
    return true;
  }
  
  return false;
}

// Get a flashcard set by ID
function getFlashcardSet(setId) {
  return flashcardSets.find(set => 
    set.id === setId || set.id.toString() === setId.toString()
  );
}

// Export functions to be used by other scripts (like the editor)
window.flashcardManager = {
  addFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  getFlashcardSet,
  getNextId: () => nextAvailableId
};
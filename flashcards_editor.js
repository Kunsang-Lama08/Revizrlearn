// Flashcards_editor.js
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the editor
  const flashcardsEditor = {
    nextId: 1,
    flashcards: [],
    categories: [],
    
    init() {
      // Add event listeners
      document.getElementById('add-card').addEventListener('click', () => this.addCard());
      document.getElementById('save-set').addEventListener('click', () => this.saveSet());
      document.getElementById('toggle-advanced').addEventListener('click', () => this.toggleAdvancedOptions());
      document.getElementById('auto-flip').addEventListener('change', (e) => {
        document.getElementById('flip-time').disabled = !e.target.checked;
      });
      document.getElementById('import-cards').addEventListener('change', (e) => this.handleImport(e));
      
      // Add click outside modal to close it
      document.getElementById('delete-confirmation-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('delete-confirmation-modal')) {
          this.closeDeleteConfirmation();
        }
      });
      
      // Load saved categories
      this.loadCategories();
      
      // Setup the category dropdown
      this.setupCategoryDropdown();
      
      // Add category management in advanced options
      this.setupCategoryManagement();
      
      // Add initial card
      this.addCard();
    },
    
    loadCategories() {
      // Load categories from localStorage
      this.categories = JSON.parse(localStorage.getItem('flashcardCategories') || '[]');
    },
    
    saveCategory(category) {
      // Add new category if it doesn't exist already
      if (category && !this.categories.includes(category)) {
        this.categories.push(category);
        
        // Sort categories alphabetically
        this.categories.sort();
        
        // Save to localStorage
        localStorage.setItem('flashcardCategories', JSON.stringify(this.categories));
        
        // Update dropdown
        this.populateCategoryDropdown();
        
        // Update category management list
        this.updateCategoryManagementList();
        
        return true;
      }
      return false;
    },
    
    deleteCategory(category) {
      // Find the category index
      const categoryIndex = this.categories.indexOf(category);
      
      if (categoryIndex !== -1) {
        // Remove from array
        this.categories.splice(categoryIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('flashcardCategories', JSON.stringify(this.categories));
        
        // Update dropdown
        this.populateCategoryDropdown();
        
        // Update category management list
        this.updateCategoryManagementList();
        
        // If the currently selected category is the one being deleted, reset selection
        const currentCategory = document.getElementById('set-category').value;
        if (currentCategory === category) {
          this.selectCategory('');
        }
        
        return true;
      }
      return false;
    },
    
    setupCategoryManagement() {
      // Create category management section in advanced panel
      const advancedPanel = document.getElementById('advanced-panel');
      
      // Create the category management container
      const categoryManagement = document.createElement('div');
      categoryManagement.className = 'form-group';
      categoryManagement.innerHTML = `
        <label>Manage Categories</label>
        <div id="category-management-list" class="category-management-list">
          <!-- Categories will be added here dynamically -->
        </div>
      `;
      
      // Append to advanced panel
      advancedPanel.appendChild(categoryManagement);
      
      // Initialize the category list
      this.updateCategoryManagementList();
    },
    
    // Changed to use modal instead of confirm()
    updateCategoryManagementList() {
      const categoryList = document.getElementById('category-management-list');
      if (!categoryList) return;
      
      // Clear current list
      categoryList.innerHTML = '';
      
      if (this.categories.length === 0) {
        categoryList.innerHTML = '<p>No categories available</p>';
        return;
      }
      
      // Add each category with a delete button
      this.categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
          <span class="category-name">${category}</span>
          <button class="icon-button delete-category" title="Delete Category">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        // Add event listener to delete button
        const deleteBtn = categoryItem.querySelector('.delete-category');
        deleteBtn.addEventListener('click', () => {
          // Show custom confirmation dialog instead of browser confirm
          this.showDeleteConfirmation(category);
        });
        
        categoryList.appendChild(categoryItem);
      });
    },
    
    // Method to show the custom delete confirmation
    showDeleteConfirmation(category) {
      // Get modal elements
      const modal = document.getElementById('delete-confirmation-modal');
      const categoryNameSpan = document.getElementById('delete-category-name');
      const confirmBtn = document.getElementById('confirm-delete');
      const cancelBtn = document.getElementById('cancel-delete');
      const closeBtn = document.getElementById('modal-close');
      
      // Set category name in the modal
      categoryNameSpan.textContent = `"${category}"`;
      
      // Show the modal
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.add('show'), 10);
      
      // Setup event listeners for confirmation
      const confirmHandler = () => {
        // Delete the category
        this.deleteCategory(category);
        
        // Show notification
        this.showNotification(`Category "${category}" deleted`);
        
        // Close the modal
        this.closeDeleteConfirmation();
        
        // Remove event listeners
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
        closeBtn.removeEventListener('click', cancelHandler);
      };
      
      const cancelHandler = () => {
        // Close the modal
        this.closeDeleteConfirmation();
        
        // Remove event listeners
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
        closeBtn.removeEventListener('click', cancelHandler);
      };
      
      // Add event listeners
      confirmBtn.addEventListener('click', confirmHandler);
      cancelBtn.addEventListener('click', cancelHandler);
      closeBtn.addEventListener('click', cancelHandler);
    },
    
    // Method to close the delete confirmation modal
    closeDeleteConfirmation() {
      const modal = document.getElementById('delete-confirmation-modal');
      modal.classList.remove('show');
      setTimeout(() => modal.classList.add('hidden'), 300);
    },
    
    setupCategoryDropdown() {
      const categorySelect = document.getElementById('set-category');
      
      // Populate with existing categories
      this.populateCategoryDropdown();
      
      // Create new category input container (initially hidden)
      const newCategoryContainer = document.createElement('div');
      newCategoryContainer.id = 'new-category-container';
      newCategoryContainer.className = 'form-group hidden';
      newCategoryContainer.innerHTML = `
        <label for="new-category-input">New Category Name</label>
        <div class="new-category-input-group">
          <input type="text" id="new-category-input" placeholder="Enter category name">
          <button type="button" id="save-new-category" class="primary-button">Save</button>
          <button type="button" id="cancel-new-category" class="secondary-button">Cancel</button>
        </div>
      `;
      
      // Insert the new category container after the category select
      categorySelect.parentNode.insertBefore(newCategoryContainer, categorySelect.nextSibling);
      
      // Add event listeners for the new category buttons
      document.getElementById('save-new-category').addEventListener('click', () => {
        const newCategoryInput = document.getElementById('new-category-input');
        const newCategory = newCategoryInput.value.trim();
        
        if (newCategory) {
          // Save the new category
          if (this.saveCategory(newCategory)) {
            // Select the new category
            this.selectCategory(newCategory);
          } else {
            // If category already exists, just select it
            this.selectCategory(newCategory);
          }
          
          // Hide the new category input
          document.getElementById('new-category-container').classList.add('hidden');
          document.getElementById('set-category').classList.remove('hidden');
          
          // Clear the input
          newCategoryInput.value = '';
        }
      });
      
      document.getElementById('cancel-new-category').addEventListener('click', () => {
        // Hide the new category input and show the dropdown
        document.getElementById('new-category-container').classList.add('hidden');
        document.getElementById('set-category').classList.remove('hidden');
        
        // Reset the dropdown selection
        this.selectCategory('');
        
        // Clear the input
        document.getElementById('new-category-input').value = '';
      });
      
      // Add change event listener to handle "Create new category" option
      categorySelect.addEventListener('change', (e) => {
        if (e.target.value === 'new') {
          // Show the new category input and hide the dropdown
          document.getElementById('new-category-container').classList.remove('hidden');
          document.getElementById('set-category').classList.add('hidden');
          
          // Focus on the input
          document.getElementById('new-category-input').focus();
        }
      });
    },
    
    populateCategoryDropdown() {
      const categorySelect = document.getElementById('set-category');
      
      // Clear current options
      categorySelect.innerHTML = '';
      
      // Add empty option
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = 'Select a category';
      categorySelect.appendChild(emptyOption);
      
      // Add categories
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
      
      // Add "Create new category" option
      const newOption = document.createElement('option');
      newOption.value = 'new';
      newOption.textContent = '+ Create new category';
      categorySelect.appendChild(newOption);
    },
    
    selectCategory(category) {
      const categorySelect = document.getElementById('set-category');
      
      // Find and select the option with the matching value
      for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].value === category) {
          categorySelect.selectedIndex = i;
          break;
        }
      }
    },
    
    addCard() {
      const template = document.getElementById('flashcard-template');
      const clone = document.importNode(template.content, true);
      const flashcardItem = clone.querySelector('.flashcard-item');
      
      // Set card ID and number
      const cardId = this.nextId++;
      flashcardItem.dataset.id = cardId;
      flashcardItem.querySelector('.card-number').textContent = this.flashcards.length + 1;
      
      // Add event listeners to card actions
      flashcardItem.querySelector('.delete-card').addEventListener('click', () => this.deleteCard(cardId));
      flashcardItem.querySelector('.move-up').addEventListener('click', () => this.moveCard(cardId, 'up'));
      flashcardItem.querySelector('.move-down').addEventListener('click', () => this.moveCard(cardId, 'down'));
      
      // Add to DOM and update flashcards array
      document.getElementById('flashcards-list').appendChild(clone);
      this.flashcards.push({
        id: cardId,
        term: '',
        definition: ''
      });
      
      // Update card count and focus on new term input
      this.updateCardCount();
      const newCard = document.querySelector(`.flashcard-item[data-id="${cardId}"]`);
      newCard.querySelector('.card-term').focus();
      
      // Update move buttons visibility
      this.updateMoveButtons();
    },
    
    deleteCard(cardId) {
      // Find the card DOM element and array index
      const cardElement = document.querySelector(`.flashcard-item[data-id="${cardId}"]`);
      const cardIndex = this.flashcards.findIndex(card => card.id === cardId);
      
      // Remove from DOM and array
      if (cardElement && cardIndex !== -1) {
        cardElement.remove();
        this.flashcards.splice(cardIndex, 1);
        
        // Update card numbers
        this.updateCardNumbers();
        
        // Update card count
        this.updateCardCount();
        
        // Update move buttons visibility
        this.updateMoveButtons();
        
        // If no cards left, add one
        if (this.flashcards.length === 0) {
          this.addCard();
        }
      }
    },
    
    moveCard(cardId, direction) {
      const cardIndex = this.flashcards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return;
      
      // Determine new index based on direction
      let newIndex;
      if (direction === 'up' && cardIndex > 0) {
        newIndex = cardIndex - 1;
      } else if (direction === 'down' && cardIndex < this.flashcards.length - 1) {
        newIndex = cardIndex + 1;
      } else {
        return; 
      }
      
      // Save current card values
      const currentCard = document.querySelector(`.flashcard-item[data-id="${cardId}"]`);
      const term = currentCard.querySelector('.card-term').value;
      const definition = currentCard.querySelector('.card-definition').value;
      
      // Update flashcards array
      [this.flashcards[cardIndex], this.flashcards[newIndex]] = 
      [this.flashcards[newIndex], this.flashcards[cardIndex]];
      
      // Refresh the entire list to reflect new order
      this.refreshCardsList();
      
      // Restore values and focus
      const movedCard = document.querySelector(`.flashcard-item[data-id="${cardId}"]`);
      movedCard.querySelector('.card-term').value = term;
      movedCard.querySelector('.card-definition').value = definition;
      movedCard.querySelector('.card-term').focus();
    },
    
    updateCardNumbers() {
      const cardElements = document.querySelectorAll('.flashcard-item');
      cardElements.forEach((card, index) => {
        card.querySelector('.card-number').textContent = index + 1;
      });
    },
    
    updateCardCount() {
      document.getElementById('card-count').textContent = `(${this.flashcards.length})`;
    },
    
    updateMoveButtons() {
      const cardElements = document.querySelectorAll('.flashcard-item');
      
      cardElements.forEach((card, index) => {
        const moveUpBtn = card.querySelector('.move-up');
        const moveDownBtn = card.querySelector('.move-down');
        
        // First card can't move up
        if (index === 0) {
          moveUpBtn.disabled = true;
          moveUpBtn.style.opacity = 0.3;
        } else {
          moveUpBtn.disabled = false;
          moveUpBtn.style.opacity = 1;
        }
        
        // Last card can't move down
        if (index === cardElements.length - 1) {
          moveDownBtn.disabled = true;
          moveDownBtn.style.opacity = 0.3;
        } else {
          moveDownBtn.disabled = false;
          moveDownBtn.style.opacity = 1;
        }
      });
    },
    
    refreshCardsList() {
      // Clear current list
      const container = document.getElementById('flashcards-list');
      container.innerHTML = '';
      
      // Add all cards in new order
      this.flashcards.forEach((flashcard, index) => {
        const template = document.getElementById('flashcard-template');
        const clone = document.importNode(template.content, true);
        const flashcardItem = clone.querySelector('.flashcard-item');
        
        // Set card ID and number
        flashcardItem.dataset.id = flashcard.id;
        flashcardItem.querySelector('.card-number').textContent = index + 1;
        
        // Add event listeners to card actions
        flashcardItem.querySelector('.delete-card').addEventListener('click', () => this.deleteCard(flashcard.id));
        flashcardItem.querySelector('.move-up').addEventListener('click', () => this.moveCard(flashcard.id, 'up'));
        flashcardItem.querySelector('.move-down').addEventListener('click', () => this.moveCard(flashcard.id, 'down'));
        
        // Add to DOM
        container.appendChild(clone);
      });
      
      // Update move buttons visibility
      this.updateMoveButtons();
    },
    
    toggleAdvancedOptions() {
      const advancedPanel = document.getElementById('advanced-panel');
      advancedPanel.classList.toggle('hidden');
      
      const toggleButton = document.getElementById('toggle-advanced');
      if (advancedPanel.classList.contains('hidden')) {
        toggleButton.innerHTML = '<i class="fas fa-cog"></i> Advanced Options';
      } else {
        toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Advanced Options';
      }
    },
    
    collectFormData() {
      // Collect set info
      const title = document.getElementById('set-title').value.trim();
      const description = document.getElementById('set-description').value.trim();
      const category = document.getElementById('set-category').value;
      
      // Study options
      const shuffleCards = document.getElementById('shuffle-cards').checked;
      const autoFlip = document.getElementById('auto-flip').checked;
      const flipTime = autoFlip ? parseInt(document.getElementById('flip-time').value) : 0;
      
      // Collect card data
      const cardElements = document.querySelectorAll('.flashcard-item');
      const cards = [];
      
      cardElements.forEach(card => {
        const id = parseInt(card.dataset.id);
        const term = card.querySelector('.card-term').value.trim();
        const definition = card.querySelector('.card-definition').value.trim();
        
        cards.push({ id, term, definition });
      });
      
      return {
        title,
        description,
        category,
        studyOptions: {
          shuffleCards,
          autoFlip,
          flipTime
        },
        cards
      };
    },
    
    validateForm(data) {
      if (!data.title) {
        this.showNotification('Please enter a title for your flashcard set', true);
        return false;
      }
      
      if (data.cards.length === 0) {
        this.showNotification('Please add at least one flashcard', true);
        return false;
      }
      
      const emptyCards = data.cards.filter(card => !card.term || !card.definition);
      if (emptyCards.length > 0) {
        this.showNotification('Please fill in all terms and definitions', true);
        return false;
      }
      
      return true;
    },
    
    saveSet() {
      const data = this.collectFormData();
      
      if (!this.validateForm(data)) {
        return;
      }
      
      // If a category was selected (and it's not the "new" option), ensure it's saved
      if (data.category && data.category !== 'new') {
        this.saveCategory(data.category);
      }
      
      // Update flashcards array with current values
      this.flashcards = data.cards;
      
      // Create a unique set ID
      const setId = Date.now().toString();
      
      // Create the flashcard set object
      const flashcardSet = {
        id: setId,
        title: data.title,
        description: data.description,
        category: data.category,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        studyOptions: data.studyOptions,
        cards: data.cards
      };
      
      // Save to localStorage
      this.saveToStorage(flashcardSet);
      
      // Show success notification
      this.showNotification('Flashcard set saved successfully!');
      
      // Redirect to flashcards page after a short delay
      setTimeout(() => {
        window.location.href = 'flashcards.html';
      }, 1500);
    },
    
    saveToStorage(flashcardSet) {
      // Get existing sets or initialize empty array
      let flashcardSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
      
      // Add new set
      flashcardSets.push(flashcardSet);
      
      // Save back to localStorage
      localStorage.setItem('flashcardSets', JSON.stringify(flashcardSets));
    },
    
    showNotification(message, isError = false) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.classList.remove('hidden', 'error');
      
      if (isError) {
        notification.classList.add('error');
      }
      
      notification.classList.add('show');
      
      // Hide after 3 seconds
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    },
    
    handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content.split('\n');
          let importedCards = 0;
          
          lines.forEach(line => {
            // Skip empty lines
            if (!line.trim()) return;
            
            // Split by comma or tab
            let parts;
            if (line.includes(',')) {
              parts = line.split(',');
            } else if (line.includes('\t')) {
              parts = line.split('\t');
            } else {
              // Try to split at first significant whitespace gap
              const match = line.match(/^(.+?)\s{2,}(.+)$/);
              if (match) {
                parts = [match[1], match[2]];
              } else {
                return; // Skip invalid lines
              }
            }
            
            if (parts.length >= 2) {
              const term = parts[0].trim();
              const definition = parts[1].trim();
              
              if (term && definition) {
                // Create a new card with the imported data
                const template = document.getElementById('flashcard-template');
                const clone = document.importNode(template.content, true);
                const flashcardItem = clone.querySelector('.flashcard-item');
                
                // Set card ID and number
                const cardId = this.nextId++;
                flashcardItem.dataset.id = cardId;
                flashcardItem.querySelector('.card-number').textContent = this.flashcards.length + 1;
                
                // Set term and definition
                flashcardItem.querySelector('.card-term').value = term;
                flashcardItem.querySelector('.card-definition').value = definition;
                
                // Add event listeners to card actions
                flashcardItem.querySelector('.delete-card').addEventListener('click', () => this.deleteCard(cardId));
                flashcardItem.querySelector('.move-up').addEventListener('click', () => this.moveCard(cardId, 'up'));
                flashcardItem.querySelector('.move-down').addEventListener('click', () => this.moveCard(cardId, 'down'));
                
                // Add to DOM and update flashcards array
                document.getElementById('flashcards-list').appendChild(clone);
                this.flashcards.push({
                  id: cardId,
                  term,
                  definition
                });
                
                importedCards++;
              }
            }
          });
          
          // Update UI
          this.updateCardCount();
          this.updateMoveButtons();
          
          // Show notification
          if (importedCards > 0) {
            this.showNotification(`Successfully imported ${importedCards} flashcards`);
          } else {
            this.showNotification(`No valid flashcards found in the file`, true);
          }
        } catch (error) {
          console.error('Error importing file:', error);
          this.showNotification('Error importing file. Please check the format.', true);
        }
        
        // Reset file input
        event.target.value = '';
      };
      
      reader.onerror = () => {
        this.showNotification('Error reading file', true);
        event.target.value = '';
      };
      
      reader.readAsText(file);
    }
  };
  
  // Toggle sidebar function (required for sidebar)
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
  };
  
  // Initialize the editor
  flashcardsEditor.init();
});
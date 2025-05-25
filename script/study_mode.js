// Study_mode.js
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle functionality
  window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  };

  // DOM elements
  const deckSelect = document.getElementById('deckSelect');
  const studyOptions = document.getElementById('studyOptions');
  const studySession = document.getElementById('studySession');
  const studySessionResults = document.getElementById('studySessionResults');
  const flashcard = document.getElementById('flashcard');
  const cardFront = document.getElementById('cardFront');
  const cardBack = document.getElementById('cardBack');
  const progressBar = document.getElementById('progressBar');
  const currentCardElement = document.getElementById('currentCard');
  const totalCardsElement = document.getElementById('totalCards');
  const multipleChoiceContainer = document.getElementById('multipleChoiceContainer');
  const multipleChoiceOptions = document.getElementById('multipleChoiceOptions');
  const typeAnswerContainer = document.getElementById('typeAnswerContainer');
  const userAnswerInput = document.getElementById('userAnswer');
  const checkAnswerButton = document.getElementById('checkAnswer');
  const answerFeedback = document.getElementById('answerFeedback');
  const statTotalCards = document.getElementById('statTotalCards');
  const statCorrect = document.getElementById('statCorrect');
  const statAccuracy = document.getElementById('statAccuracy');

  // Study session state
  let currentDeck = null;
  let currentMode = null;
  let cards = [];
  let currentCardIndex = 0;
  let correctAnswers = 0;

  // Load available decks from localStorage
  loadDecks();

  // Event listeners for study mode buttons
  document.querySelectorAll('.study-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (!deckSelect.value) {
        showToast('error', 'Please select a flashcard deck first');
        return;
      }
      
      const mode = this.getAttribute('data-mode');
      // Show toast notification when starting a study session
      const modeNames = {
        'flashcard': 'Classic Mode',
        'spaced': 'Spaced Repetition Mode',
        'multiple': 'Multiple Choice Mode',
        'typing': 'Typing Mode'
      };
      
      const selectedDeckName = deckSelect.options[deckSelect.selectedIndex].text;
      showToast('info', `Starting ${modeNames[mode]} with "${selectedDeckName}"...`);
      
      startStudySession(mode);
    });
  });

  // Navigation buttons
  document.getElementById('backToOptions').addEventListener('click', backToStudyOptions);
  document.getElementById('prevCard').addEventListener('click', showPreviousCard);
  document.getElementById('nextCard').addEventListener('click', showNextCard);
  document.getElementById('flipCard').addEventListener('click', flipCard);

  // Results page buttons
  document.getElementById('restartSession').addEventListener('click', () => {
    showToast('info', 'Restarting study session...');
    startStudySession(currentMode);
  });
  document.getElementById('backToStudyOptions').addEventListener('click', backToStudyOptions);

  // Multiple choice answer selection
  multipleChoiceOptions.addEventListener('click', function(e) {
    const option = e.target.closest('.multiple-choice-option');
    if (!option) return;
    
    // If an answer has already been selected, don't allow another selection
    if (multipleChoiceOptions.querySelector('.selected')) return;
    
    option.classList.add('selected');

    const isCorrect = option.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      option.classList.add('correct');
      correctAnswers++;
      showToast('success', 'Correct answer!');
    } else {
      option.classList.add('incorrect');
      showToast('error', 'Incorrect answer');
      // Show the correct answer
      multipleChoiceOptions.querySelectorAll('.multiple-choice-option').forEach(opt => {
        if (opt.getAttribute('data-correct') === 'true') {
          opt.classList.add('correct');
        }
      });
    }
    
    // Enable next card button after selection
    setTimeout(() => {
      document.getElementById('nextCard').disabled = false;
    }, 500);
  });

  // Check typed answer
  checkAnswerButton.addEventListener('click', checkTypedAnswer);

  // Allow pressing Enter to check answer
  userAnswerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkTypedAnswer();
    }
  });

  // Functions
  function loadDecks() {
    // Clear existing options except the default one
    Array.from(deckSelect.options).forEach((option, index) => {
      if (index !== 0) { // Keep the first default option
        deckSelect.removeChild(option);
      }
    });
    
    // Make sure the default option text is correct
    deckSelect.options[0].text = "Select a flashcard deck";
    
    // Load flashcard sets from localStorage
    let flashcardSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    
    if (flashcardSets.length === 0) {
      // Show a notification that no flashcards are made
      const noDecksOption = document.createElement('option');
      noDecksOption.value = "";
      noDecksOption.textContent = "No flashcards have been made";
      noDecksOption.disabled = true;
      deckSelect.appendChild(noDecksOption);
      
      // Select the first option (Select a flashcard deck)
      deckSelect.selectedIndex = 0;
    } else {
      // Add user-created flashcard sets
      flashcardSets.forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.title;
        deckSelect.appendChild(option);
      });
    }
  }

  function loadDeckCards(deckId) {
    // Only load user-created flashcard sets
    let flashcardSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    const userSet = flashcardSets.find(set => set.id === deckId);
    
    if (userSet) {
      // Convert user flashcards to the format used by the study mode
      return userSet.cards.map(card => ({
        front: card.term,
        back: card.definition
      }));
    }
    
    // Return empty array if no user set found
    return [];
  }

  function startStudySession(mode) {
    currentMode = mode;
    currentDeck = deckSelect.value;
    cards = loadDeckCards(currentDeck);
    currentCardIndex = 0;
    correctAnswers = 0;
    
    // Check if we have cards to study
    if (cards.length === 0) {
      showToast('error', 'This deck has no cards to study!');
      return;
    }
    
    // Reset UI
    flashcard.classList.remove('flipped');
    progressBar.style.width = '0%';
    currentCardElement.textContent = '1';
    totalCardsElement.textContent = cards.length;
    
    // Show study session
    studyOptions.style.display = 'none';
    studySession.style.display = 'block';
    studySessionResults.style.display = 'none';
    
    // Mode-specific setup
    setupModeSpecificUI(mode);
    
    // Initialize cards based on mode
    if (mode === 'spaced') {
      // Initialize spaced repetition queue
      spacedRepetitionQueue = [...cards].map((card, index) => ({ 
        cardIndex: index, 
        nextReview: Date.now() 
      }));
      shuffleArray(spacedRepetitionQueue);
      showCurrentSpacedCard();
    } else {
      // For other modes, shuffle cards if needed
      if (mode === 'multiple' || mode === 'typing') {
        shuffleArray(cards);
      }
      showCurrentCard();
    }
  }

  function setupModeSpecificUI(mode) {
    // Reset all mode-specific UI elements
    flashcard.style.display = 'block';
    multipleChoiceContainer.style.display = 'none';
    typeAnswerContainer.style.display = 'none';
    document.getElementById('flipCard').style.display = 'block';
    document.getElementById('nextCard').disabled = false;
    
    // Set up mode-specific UI
    switch (mode) {
      case 'multiple':
        document.getElementById('flipCard').style.display = 'none';
        multipleChoiceContainer.style.display = 'block';
        document.getElementById('nextCard').disabled = true;
        break;
      case 'typing':
        document.getElementById('flipCard').style.display = 'none';
        typeAnswerContainer.style.display = 'block';
        userAnswerInput.value = '';
        answerFeedback.textContent = '';
        answerFeedback.className = '';
        break;
    }
  }

  function showCurrentCard() {
    // Update progress tracking
    currentCardElement.textContent = currentCardIndex + 1;
    progressBar.style.width = `${((currentCardIndex + 1) / cards.length) * 100}%`;
    
    // Reset card state
    flashcard.classList.remove('flipped');
    
    // Set card content
    const card = cards[currentCardIndex];
    cardFront.textContent = card.front;
    cardBack.textContent = card.back;
    
    // Mode-specific handling
    if (currentMode === 'multiple') {
      setupMultipleChoiceQuestion(card);
    } else if (currentMode === 'typing') {
      setupTypingQuestion(card);
    }
  }

  function showNextCard() {
    if (currentMode === 'spaced') {
      // For spaced repetition, move to next card in queue
      if (spacedRepetitionQueue.length <= 1) {
        endStudySession();
        return;
      }
      
      // Count the reviewed card as correct
      correctAnswers++;
      
      // Move the card to the end of the queue for later review
      const currentCard = spacedRepetitionQueue.shift();
      spacedRepetitionQueue.push(currentCard);
      
      showCurrentSpacedCard();
    } else {
      // For other modes, move to next card index
      currentCardIndex++;
      
      if (currentCardIndex >= cards.length) {
        endStudySession();
        return;
      }
      
      showCurrentCard();
    }
  }

  function showPreviousCard() {
    if (currentMode === 'spaced') {
      return;
    }
    
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showCurrentCard();
    }
  }

  function flipCard() {
    flashcard.classList.toggle('flipped');
  }

  function setupMultipleChoiceQuestion(currentCard) {
    // Clear previous options
    multipleChoiceOptions.innerHTML = '';
    
    // Create array with correct answer and distractors
    const options = [currentCard.back];
    
    // Add distractors from other cards
    const otherCards = [...cards].filter(card => card !== currentCard);
    shuffleArray(otherCards);
    
    // Take up to 3 distractors
    for (let i = 0; i < Math.min(3, otherCards.length); i++) {
      options.push(otherCards[i].back);
    }
    
    // Shuffle options
    shuffleArray(options);
    
    // Create option elements
    options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'multiple-choice-option';
      optionElement.textContent = option;
      optionElement.setAttribute('data-correct', option === currentCard.back);
      multipleChoiceOptions.appendChild(optionElement);
    });
    
    // Update question text
    cardFront.textContent = currentCard.front;
  }

  function setupTypingQuestion(currentCard) {
    // Reset input and feedback
    userAnswerInput.value = '';
    answerFeedback.textContent = '';
    answerFeedback.className = '';
    
    // Set question
    cardFront.textContent = currentCard.front;
  }

  function checkTypedAnswer() {
    const userAnswer = userAnswerInput.value.trim();
    const correctAnswer = cards[currentCardIndex].back;
    
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    if (isCorrect) {
      answerFeedback.textContent = 'Correct!';
      answerFeedback.className = 'correct';
      correctAnswers++;
      showToast('success', 'Correct answer!');
    } else {
      answerFeedback.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
      answerFeedback.className = 'incorrect';
      showToast('error', 'Incorrect answer');
    }
    
    // Enable next card button
    document.getElementById('nextCard').disabled = false;
  }

  function endStudySession() {
    // Update results
    statTotalCards.textContent = cards.length;
    statCorrect.textContent = correctAnswers;
    const accuracy = Math.round((correctAnswers / cards.length) * 100);
    statAccuracy.textContent = accuracy + '%';
    
    // Show toast based on performance
    if (accuracy >= 80) {
      showToast('success', `Study session complete! You got ${accuracy}% correct`);
    } else if (accuracy >= 60) {
      showToast('info', `Study session complete. You got ${accuracy}% correct`);
    } else {
      showToast('warning', `Study session complete. You got ${accuracy}% correct. Keep practicing!`);
    }
    
    // Show results screen
    studySession.style.display = 'none';
    studySessionResults.style.display = 'block';
  }

  function backToStudyOptions() {
    showToast('info', 'Returning to study options');
    studySession.style.display = 'none';
    studySessionResults.style.display = 'none';
    studyOptions.style.display = 'grid';
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
});

// Show toast notification function
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Revizrlearn/service-worker.js');
  });
}

// Game data
const moneyLevels = [
  100,
  200,
  300,
  500,
  1000, // First safe level
  2000,
  4000,
  8000,
  16000,
  32000, // Second safe level
  64000,
  125000,
  250000,
  500000,
  1000000, // Final level
]

// Default questions
const coralineQuestions = [
  {
    question: "What is the true identity of the 'Other Mother'?",
    answers: ["The ghost of the house", "The Beldam", "A lonely witch", "Miss Spink's sister"],
    correctAnswer: 1,
  },
  {
    question: "According to the source, how does Coraline feel at the start of the story?",
    answers: ["Angry at her parents for moving", "Scared and nervous in a new place", "Lonely and bored", "Happy and excited about the new house"],
    correctAnswer: 2,
  },
  {
    question: "What is unique about the cat when it is in the Other World?",
    answers: ["It can talk", "It can become invisible", "It can fly", "It gets button eyes like the others"],
    correctAnswer: 0,
  },
  {
    question: "Which character was created for the movie and is not in the original book?",
    answers: ["Miss Forcible", "The Cat", "Wybie", "Mr. Bobo"],
    correctAnswer: 2,
  },
  {
    question: "What does the Other Mother want to do to Coraline so she can stay in the Other World forever?",
    answers: ["Sew buttons into her eyes", "Make her forget her real parents", "Turn her into a doll", "Lock her in a room"],
    correctAnswer: 0,
  },
  {
    question: "What happens to Coraline's real parents when she refuses the Other Mother's offer?",
    answers: ["They sell the house and decide to move", "They are kidnapped by the Other Mother", "They go on a long business trip", "They get lost in the overgrown garden"],
    correctAnswer: 1,
  },
  {
    question: "How is the atmosphere of the Other World described at the very end?",
    answers: ["Magical and friendly", "Scary and broken", "Dull and still", "Exactly like the real world"],
    correctAnswer: 1,
  },
  {
    question: "What was Neil Gaiman's main reason for writing the book *Coraline*?",
    answers: ["It was based on a famous fairy-tale", "He wanted to create a comic book series", "He wanted to write a scary story for his daughter", "It was an idea for a movie screenplay"],
    correctAnswer: 2,
  },
  {
    question: "Who lives in the ground flat of Coraline's house?",
    answers: ["The Other Mother", "Her grandmother", "Mr. Bobo", "Miss Spink and Miss Forcible"],
    correctAnswer: 3,
  },
  {
    question: "What is beyond the house and garden in the Other World?",
    answers: ["Mist and emptiness", "A dark and scary forest", "A circus run by the Other Mr. Bobo", "A copy of Coraline's old town"],
    correctAnswer: 0,
  },
  {
    question: "How does Coraline's adventure change her?",
    answers: ["She wishes she could return to the Other World", "She becomes more mature and confident", "She becomes scared of exploring", "She decides she wants to live alone"],
    correctAnswer: 1,
  },
  {
    question: "What is the final action Coraline takes to defeat the Beldam for good?",
    answers: ["She tells her parents and they call the police", "She destroys the little door", "She traps the Beldam's hand in a well", "She asks the ghost children for help"],
    correctAnswer: 2,
  },
  {
    question: "Which of these is listed as a major theme of the story?",
    answers: ["The future", "Technology", "Family", "Friendship"],
    correctAnswer: 2,
  },
  {
    question: "How is Coraline's real mother different from the Other Mother?",
    answers: ["Her real mother secretly has button eyes", "Her real mother is a better cook", "Her real mother wants Coraline to stay a child forever", "Her real mother shows real but imperfect love"],
    correctAnswer: 3,
  },
  {
    question: "According to the source, what is a key difference in atmosphere between the book and the movie?",
    answers: ["The movie is for adults, the book is for young children", "The movie's atmosphere is bright, the book's is dark", "The movie is more serious, the book is more comedic", "The movie has a more American feel, the book has a more British feel"],
    correctAnswer: 3,
  },
]

// Helper functions
function verifyLocalStorage() {
  try {
    localStorage.setItem("wwm_test", "test")
    localStorage.removeItem("wwm_test")
    return true
  } catch (e) {
    console.error("localStorage ist nicht verfügbar:", e)
    return false
  }
}

function showToast(title, message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class="toast-header">${title}</div>
    <div class="toast-body">${message}</div>
  `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add("show")
  }, 100)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// Initialize question sets
function initializeQuestionSets() {
  if (!verifyLocalStorage()) {
    showToast(
      "Warnung",
      "Ihr Browser unterstützt keine lokale Speicherung. Ihre Änderungen werden nicht gespeichert.",
      "error",
    )
    return
  }

  const savedSets = localStorage.getItem("wwm_question_sets")

  if (!savedSets) {
    // Create default question set if none exists
    const defaultSet = {
      id: "default",
      name: "Coraline Quiz",
      questions: coralineQuestions,
    }

    localStorage.setItem("wwm_question_sets", JSON.stringify([defaultSet]))
    localStorage.setItem("wwm_active_set", "default")
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeQuestionSets()

  // Add toast styles
  const style = document.createElement("style")
  style.textContent = `
    .toast {
      position: fixed;
      top: 1rem;
      right: 1rem;
      max-width: 350px;
      background-color: var(--blue-900);
      border: 1px solid var(--blue-700);
      border-radius: var(--radius);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 0;
      z-index: 1100;
      transform: translateY(-20px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
    }
    
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .toast-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--blue-800);
      font-weight: 600;
    }
    
    .toast-body {
      padding: 0.75rem 1rem;
    }
    
    .toast-success .toast-header {
      color: #16a34a;
    }
    
    .toast-error .toast-header {
      color: #dc2626;
    }
  `
  document.head.appendChild(style)
})

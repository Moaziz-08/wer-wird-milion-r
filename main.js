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
const defaultQuestions = [
  {
    question: "Welches dieser Tiere ist ein Säugetier?",
    answers: ["Krokodil", "Delfin", "Schildkröte", "Hai"],
    correctAnswer: 1,
  },
  {
    question: "Welche Farbe hat der Himmel bei klarem Wetter?",
    answers: ["Grün", "Rot", "Blau", "Gelb"],
    correctAnswer: 2,
  },
  {
    question: "Wie viele Bundesländer hat Deutschland?",
    answers: ["14", "15", "16", "17"],
    correctAnswer: 2,
  },
  {
    question: "Wer schrieb 'Romeo und Julia'?",
    answers: ["Charles Dickens", "William Shakespeare", "Friedrich Schiller", "Johann Wolfgang von Goethe"],
    correctAnswer: 1,
  },
  {
    question: "Welches ist das größte Organ des menschlichen Körpers?",
    answers: ["Leber", "Gehirn", "Haut", "Lunge"],
    correctAnswer: 2,
  },
  {
    question: "Welches chemische Element hat das Symbol 'O'?",
    answers: ["Osmium", "Sauerstoff", "Gold", "Silber"],
    correctAnswer: 1,
  },
  {
    question: "Welcher Planet ist der Sonne am nächsten?",
    answers: ["Venus", "Mars", "Merkur", "Erde"],
    correctAnswer: 2,
  },
  {
    question: "Wer malte die 'Mona Lisa'?",
    answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
  },
  {
    question: "Welches Land hat die meisten Einwohner?",
    answers: ["Indien", "USA", "China", "Russland"],
    correctAnswer: 2,
  },
  {
    question: "Welches dieser Instrumente ist ein Blasinstrument?",
    answers: ["Geige", "Klavier", "Trompete", "Gitarre"],
    correctAnswer: 2,
  },
  {
    question: "Welcher Ozean liegt zwischen Amerika und Europa?",
    answers: ["Indischer Ozean", "Pazifischer Ozean", "Atlantischer Ozean", "Arktischer Ozean"],
    correctAnswer: 2,
  },
  {
    question: "Welches dieser Tiere kann fliegen?",
    answers: ["Pinguin", "Strauß", "Kiwi", "Fledermaus"],
    correctAnswer: 3,
  },
  {
    question: "Wer war der erste Mensch auf dem Mond?",
    answers: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"],
    correctAnswer: 2,
  },
  {
    question: "Welches dieser Elemente ist ein Edelgas?",
    answers: ["Helium", "Wasserstoff", "Sauerstoff", "Stickstoff"],
    correctAnswer: 0,
  },
  {
    question: "Welche ist die größte Wüste der Welt?",
    answers: ["Sahara", "Gobi", "Antarktis", "Kalahari"],
    correctAnswer: 2,
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
      name: "Standard Fragen",
      questions: defaultQuestions,
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


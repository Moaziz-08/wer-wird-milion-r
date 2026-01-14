document.addEventListener("DOMContentLoaded", () => {
  // Game state
  let currentQuestion = 0
  let selectedAnswer = null
  let isAnswerConfirmed = false
  let isAnswerCorrect = null
  let gameOver = false
  let currentMoney = 0
  let usedLifelines = {
    fifty: false,
    audience: false,
    phone: false,
  }
  let fiftyFiftyRemoved = []
  let audienceHelp = []
  let phoneAdvice = ""
  let gameState = "playing" // playing, won, lost
  let questions = []
  let backgroundAudio = null

  // DOM elements
  const moneyDisplay = document.getElementById("money-display")
  const ladderLevels = document.getElementById("ladder-levels")
  const gameContent = document.getElementById("game-content")
  const fiftyFiftyBtn = document.getElementById("fifty-fifty")
  const audienceHelpBtn = document.getElementById("audience-help")
  const phoneFriendBtn = document.getElementById("phone-friend")
  const audienceModal = document.getElementById("audience-modal")
  const phoneModal = document.getElementById("phone-modal")
  const audienceChart = document.getElementById("audience-chart")
  const phoneAdviceElement = document.getElementById("phone-advice")

  // Default questions (if no set is loaded)
  const defaultQuestions = [
    {
      question: "Was ist die Hauptstadt von Deutschland?",
      answers: ["Berlin", "Hamburg", "München", "Köln"],
      correctAnswer: 0,
    },
    {
      question: "Wie viele Planeten hat unser Sonnensystem?",
      answers: ["7", "8", "9", "10"],
      correctAnswer: 1,
    },
    {
      question: "Wer schrieb 'Romeo und Julia'?",
      answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: 1,
    },
    {
      question: "Was ist die chemische Formel für Wasser?",
      answers: ["CO2", "H2O", "NaCl", "O2"],
      correctAnswer: 1,
    },
    {
      question: "Welches Tier ist das größte?",
      answers: ["Elefant", "Blauwal", "Giraffe", "Nashorn"],
      correctAnswer: 1,
    },
    {
      question: "In welchem Jahr begann der Zweite Weltkrieg?",
      answers: ["1935", "1937", "1939", "1941"],
      correctAnswer: 2,
    },
    {
      question: "Wer malte die Mona Lisa?",
      answers: ["Vincent van Gogh", "Leonardo da Vinci", "Michelangelo", "Raffael"],
      correctAnswer: 1,
    },
    {
      question: "Was ist die Quadratwurzel von 144?",
      answers: ["10", "12", "14", "16"],
      correctAnswer: 1,
    },
    {
      question: "Welches Land ist für das Känguru bekannt?",
      answers: ["Brasilien", "Australien", "Indien", "Kanada"],
      correctAnswer: 1,
    },
    {
      question: "Wer war der erste Mensch im Weltraum?",
      answers: ["Neil Armstrong", "Juri Gagarin", "Alan Shepard", "John Glenn"],
      correctAnswer: 1,
    },
    {
      question: "Welches ist das höchste Gebäude der Welt?",
      answers: ["Eiffelturm", "Burj Khalifa", "Empire State Building", "Shanghai Tower"],
      correctAnswer: 1,
    },
    {
      question: "Wer schrieb 'Die Göttliche Komödie'?",
      answers: ["Giovanni Boccaccio", "Dante Alighieri", "Francesco Petrarca", "Niccolò Machiavelli"],
      correctAnswer: 1,
    },
    {
      question: "Welches Element hat das Symbol 'Au'?",
      answers: ["Silber", "Eisen", "Gold", "Kupfer"],
      correctAnswer: 2,
    },
    {
      question: "Welcher Planet ist der Erde am nächsten?",
      answers: ["Mars", "Venus", "Jupiter", "Merkur"],
      correctAnswer: 1,
    },
    {
      question: "Wer entdeckte die Relativitätstheorie?",
      answers: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
      correctAnswer: 1,
    },
  ]

  // Money levels
  const moneyLevels = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

  // Initialize the game
  initGame()

  function initGame() {
    // Load questions from active set
    loadActiveQuestionSet()

    // Initialize money ladder
    renderMoneyLadder()

    // Initialize lifeline buttons
    fiftyFiftyBtn.addEventListener("click", handleFiftyFifty)
    audienceHelpBtn.addEventListener("click", handleAudienceHelp)
    phoneFriendBtn.addEventListener("click", handlePhoneAFriend)

    // Initialize modal close buttons
    document.querySelectorAll(".modal-close").forEach((button) => {
      button.addEventListener("click", () => {
        audienceModal.classList.remove("active")
        phoneModal.classList.remove("active")
      })
    })

    // Play background music
    playBackgroundMusic()
  }

  function loadActiveQuestionSet() {
    const activeSetId = localStorage.getItem("wwm_active_set")
    const savedSets = localStorage.getItem("wwm_question_sets")

    if (activeSetId && savedSets) {
      const parsedSets = JSON.parse(savedSets)
      const activeSet = parsedSets.find((set) => set.id === activeSetId)

      if (activeSet && activeSet.questions && activeSet.questions.length > 0) {
        questions = activeSet.questions
      } else {
        questions = defaultQuestions
      }
    } else {
      questions = defaultQuestions
    }

    // Render the first question
    renderQuestion()
  }

  function renderMoneyLadder() {
    ladderLevels.innerHTML = ""

    moneyLevels.forEach((money, index) => {
      const levelElement = document.createElement("div")
      levelElement.className = `ladder-level ${index === currentQuestion ? "current" : ""} ${index < currentQuestion ? "completed" : ""} ${[4, 9, 14].includes(index) ? "milestone" : ""}`
      levelElement.innerHTML = `
        <span>${index + 1}</span>
        <span>€${money.toLocaleString()}</span>
      `
      ladderLevels.appendChild(levelElement)
    })
  }

  function renderQuestion() {
    if (gameOver) {
      renderGameOver()
      return
    }

    const question = questions[currentQuestion]

    gameContent.innerHTML = `
      <div class="question-card">
        <h2>Frage ${currentQuestion + 1} für €${moneyLevels[currentQuestion].toLocaleString()}</h2>
        <p>${question.question}</p>
      </div>
      
      <div class="answers-grid">
        ${question.answers
          .map((answer, index) => {
            const letters = ["A", "B", "C", "D"]
            const isRemoved = fiftyFiftyRemoved.includes(index)

            let classes = "answer-button btn"
            if (isRemoved) classes += " hidden"
            if (selectedAnswer === index) classes += " selected"
            if (isAnswerConfirmed && selectedAnswer === index) {
              classes += isAnswerCorrect ? " correct" : " incorrect"
            }
            if (isAnswerConfirmed && index === question.correctAnswer && !isAnswerCorrect) {
              classes += " correct"
            }

            return `
            <button class="${classes}" data-index="${index}" ${isRemoved ? "disabled" : ""}>
              <span class="letter">${letters[index]}</span>
              <span>${answer}</span>
            </button>
          `
          })
          .join("")}
      </div>
      
      <div class="confirm-button">
        <button class="btn btn-primary" id="confirm-answer" ${selectedAnswer === null || isAnswerConfirmed ? "disabled" : ""}>
          Endgültige Antwort
        </button>
      </div>
    `

    // Add event listeners to answer buttons
    document.querySelectorAll(".answer-button:not(.hidden)").forEach((button) => {
      button.addEventListener("click", () => {
        if (isAnswerConfirmed) return

        const index = Number.parseInt(button.dataset.index)
        handleAnswerSelect(index)
      })
    })

    // Add event listener to confirm button
    document.getElementById("confirm-answer").addEventListener("click", confirmAnswer)

    // Update money ladder
    renderMoneyLadder()
  }

  function renderGameOver() {
    gameContent.innerHTML = `
      <div class="game-over-card">
        <div class="game-over-content">
          <h2>${gameState === "won" ? "Herzlichen Glückwunsch!" : "Spiel beendet!"}</h2>
          <p>${
            gameState === "won"
              ? `Sie haben €${currentMoney.toLocaleString()} gewonnen!`
              : `Sie gehen mit €${currentMoney.toLocaleString()} nach Hause.`
          }</p>
          <div class="game-over-buttons">
            <a href="index.html" class="btn btn-primary">Zurück zum Hauptmenü</a>
            <button id="restart-game" class="btn btn-outline">Neues Spiel</button>
          </div>
        </div>
      </div>
    `

    document.getElementById("restart-game").addEventListener("click", restartGame)
  }

  function handleAnswerSelect(index) {
    if (isAnswerConfirmed || gameOver) return

    playSound("select")
    selectedAnswer = index
    renderQuestion()
  }

  function confirmAnswer() {
    if (selectedAnswer === null || isAnswerConfirmed || gameOver) return

    isAnswerConfirmed = true
    playSound("final_answer")

    // Disable confirm button
    document.getElementById("confirm-answer").disabled = true

    // Check if answer is correct after a delay
    setTimeout(() => {
      const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
      isAnswerCorrect = isCorrect

      if (isCorrect) {
        playSound("correct")
        currentMoney = moneyLevels[currentQuestion]
        moneyDisplay.textContent = `€${currentMoney.toLocaleString()}`

        // Check if player won the game
        if (currentQuestion === questions.length - 1 || currentQuestion === moneyLevels.length - 1) {
          gameState = "won"
          gameOver = true
          playSound("win")
          renderGameOver()
        } else {
          // Move to next question after delay
          setTimeout(() => {
            currentQuestion++
            selectedAnswer = null
            isAnswerConfirmed = false
            isAnswerCorrect = null
            fiftyFiftyRemoved = []
            renderQuestion()
          }, 1000)
        }
      } else {
        playSound("wrong")

        // Determine final money based on milestones
        if (currentQuestion > 9) {
          currentMoney = 32000
        } else if (currentQuestion > 4) {
          currentMoney = 1000
        } else {
          currentMoney = 0
        }

        moneyDisplay.textContent = `€${currentMoney.toLocaleString()}`
        gameState = "lost"
        gameOver = true

        // Render game over after showing correct answer
        setTimeout(() => {
          renderGameOver()
        }, 1000)
      }

      renderQuestion()
    }, 1000)
  }

  function handleFiftyFifty() {
    if (usedLifelines.fifty || gameOver) return

    playSound("lifeline")
    usedLifelines.fifty = true
    fiftyFiftyBtn.disabled = true
    fiftyFiftyBtn.classList.add("used")

    // Remove two wrong answers
    const correctAnswer = questions[currentQuestion].correctAnswer
    const wrongAnswers = [0, 1, 2, 3].filter((i) => i !== correctAnswer)
    const shuffled = wrongAnswers.sort(() => 0.5 - Math.random())
    fiftyFiftyRemoved = shuffled.slice(0, 2)

    renderQuestion()
  }

  function handleAudienceHelp() {
    if (usedLifelines.audience || gameOver) return

    playSound("lifeline")
    usedLifelines.audience = true
    audienceHelpBtn.disabled = true
    audienceHelpBtn.classList.add("used")

    // Generate audience poll results
    const correctAnswer = questions[currentQuestion].correctAnswer
    audienceHelp = [15, 15, 15, 15]

    // Give the correct answer a higher percentage
    audienceHelp[correctAnswer] = 55

    // Distribute remaining percentage among other answers
    const remainingAnswers = [0, 1, 2, 3].filter((i) => i !== correctAnswer)
    remainingAnswers.forEach((index, i) => {
      audienceHelp[index] = i === 0 ? 20 : i === 1 ? 15 : 10
    })

    // If 50:50 was used, set removed answers to 0
    if (fiftyFiftyRemoved.length > 0) {
      fiftyFiftyRemoved.forEach((index) => {
        audienceHelp[index] = 0
      })

      // Redistribute those percentages to remaining answers
      const totalToRedistribute = fiftyFiftyRemoved.length * 15
      const availableAnswers = [0, 1, 2, 3].filter((i) => !fiftyFiftyRemoved.includes(i))
      const extraPerAnswer = totalToRedistribute / availableAnswers.length
      availableAnswers.forEach((index) => {
        audienceHelp[index] += extraPerAnswer
      })
    }

    // Render audience chart
    audienceChart.innerHTML = audienceHelp
      .map((percentage, index) => {
        const isRemoved = fiftyFiftyRemoved.includes(index)
        return `
        <div class="audience-bar">
          <div class="audience-percentage">${Math.round(percentage)}%</div>
          <div class="audience-bar-visual ${isRemoved ? "disabled" : ""}" style="height: ${percentage * 2}px"></div>
          <div class="audience-letter">${["A", "B", "C", "D"][index]}</div>
        </div>
      `
      })
      .join("")

    // Show modal
    audienceModal.classList.add("active")
  }

  function handlePhoneAFriend() {
    if (usedLifelines.phone || gameOver) return

    playSound("lifeline")
    usedLifelines.phone = true
    phoneFriendBtn.disabled = true
    phoneFriendBtn.classList.add("used")

    // Generate phone-a-friend advice
    const correctAnswer = questions[currentQuestion].correctAnswer
    const letters = ["A", "B", "C", "D"]

    // 80% chance the friend gives the correct answer
    const isCorrect = Math.random() < 0.8

    if (isCorrect) {
      phoneAdvice = `Ich bin mir ziemlich sicher, dass es ${letters[correctAnswer]} ist. Etwa 80% sicher.`
    } else {
      // Pick a random wrong answer
      const wrongAnswers = [0, 1, 2, 3].filter((i) => i !== correctAnswer && !fiftyFiftyRemoved.includes(i))
      const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
      phoneAdvice = `Ich bin nicht ganz sicher, aber ich denke es könnte ${letters[randomWrong]} sein. Vielleicht 60% sicher.`
    }

    // Show advice in modal
    phoneAdviceElement.textContent = `"${phoneAdvice}"`
    phoneModal.classList.add("active")
  }

  function restartGame() {
    // Reset all game state
    currentQuestion = 0
    selectedAnswer = null
    isAnswerConfirmed = false
    isAnswerCorrect = null
    gameOver = false
    currentMoney = 0
    usedLifelines = {
      fifty: false,
      audience: false,
      phone: false,
    }
    fiftyFiftyRemoved = []
    audienceHelp = []
    phoneAdvice = ""
    gameState = "playing"

    // Reset UI
    moneyDisplay.textContent = "€0"
    fiftyFiftyBtn.disabled = false
    fiftyFiftyBtn.classList.remove("used")
    audienceHelpBtn.disabled = false
    audienceHelpBtn.classList.remove("used")
    phoneFriendBtn.disabled = false
    phoneFriendBtn.classList.remove("used")

    // Reload the active question set
    loadActiveQuestionSet()

    // Play a sound to indicate restart
    playSound("select")

    // Show toast notification
    showToast("Neues Spiel gestartet", "Viel Glück!")
  }

  function playBackgroundMusic() {
    if (typeof Audio !== "undefined") {
      backgroundAudio = new Audio()
      backgroundAudio.src = "sounds/background.mp3"
      backgroundAudio.volume = 0.3
      backgroundAudio.loop = true
      backgroundAudio.play().catch((e) => console.log("Audio autoplay prevented:", e))
    }
  }

  function playSound(sound) {
    if (typeof Audio !== "undefined") {
      const audio = new Audio(`sounds/${sound}.mp3`)
      audio.volume = 0.5
      audio.play().catch((e) => console.log("Audio play prevented:", e))
    }
  }

  // Clean up on page unload
  window.addEventListener("beforeunload", () => {
    if (backgroundAudio) {
      backgroundAudio.pause()
      backgroundAudio = null
    }
  })

  function showToast(message, subMessage) {
    const toastContainer = document.getElementById("toast-container")

    // Create toast element
    const toast = document.createElement("div")
    toast.classList.add("toast")

    // Toast content
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="toast-title">${message}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${subMessage}
        </div>
    `

    // Append toast to container
    toastContainer.appendChild(toast)

    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast)
    bsToast.show()

    // Remove toast after it's hidden
    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove()
    })
  }

  // Initialize Bootstrap's toast component
  const toastElList = [].slice.call(document.querySelectorAll(".toast"))
  const toastList = toastElList.map((toastEl) => new bootstrap.Toast(toastEl))
})

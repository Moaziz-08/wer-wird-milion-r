document.addEventListener("DOMContentLoaded", () => {
  // State
  let questionSets = []
  let activeSet = null
  let editingQuestion = null
  let editingIndex = null
  let isSaving = false

  // DOM elements
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")
  const setSelector = document.getElementById("set-selector")
  const questionsCount = document.getElementById("questions-count")
  const questionsTableContainer = document.getElementById("questions-table-container")
  const newQuestionBtn = document.getElementById("new-question-btn")
  const questionModal = document.getElementById("question-modal")
  const questionModalTitle = document.getElementById("question-modal-title")
  const questionText = document.getElementById("question-text")
  const answerInputs = [
    document.getElementById("answer-0"),
    document.getElementById("answer-1"),
    document.getElementById("answer-2"),
    document.getElementById("answer-3"),
  ]
  const answerLabels = [
    document.getElementById("answer-label-0"),
    document.getElementById("answer-label-1"),
    document.getElementById("answer-label-2"),
    document.getElementById("answer-label-3"),
  ]
  const correctAnswerRadios = document.querySelectorAll('input[name="correct-answer"]')
  const saveQuestionBtn = document.getElementById("save-question-btn")
  const cancelQuestionBtn = document.getElementById("cancel-question-btn")
  const newSetName = document.getElementById("new-set-name")
  const createSetBtn = document.getElementById("create-set-btn")
  const setsContainer = document.getElementById("sets-container")

  // Declare undeclared variables
  const verifyLocalStorage = () => {
    try {
      return typeof window !== "undefined" && window.localStorage !== null
    } catch (e) {
      return false
    }
  }

  const showToast = (title, message, type = "success") => {
    alert(`${title}: ${message}`) // Replace with your actual toast implementation
  }

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
  ]

  // Initialize
  init()

  function init() {
    // Load question sets
    loadQuestionSets()

    // Set up tab switching
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab
        switchTab(tabName)
      })
    })

    // Set up set selector
    setSelector.addEventListener("change", () => {
      saveActiveSet(setSelector.value)
    })

    // Set up new question button
    newQuestionBtn.addEventListener("click", handleCreateQuestion)

    // Set up question modal buttons
    saveQuestionBtn.addEventListener("click", handleSaveQuestion)
    cancelQuestionBtn.addEventListener("click", () => {
      questionModal.classList.remove("active")
    })

    // Set up answer inputs to update labels
    answerInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        answerLabels[index].textContent = input.value || `Antwort ${index + 1}`
      })
    })

    // Set up new set creation
    createSetBtn.addEventListener("click", handleCreateSet)
  }

  function loadQuestionSets() {
    if (!verifyLocalStorage()) {
      showToast(
        "Warnung",
        "Ihr Browser unterstützt keine lokale Speicherung. Ihre Änderungen werden nicht gespeichert.",
        "error",
      )
      return
    }

    try {
      const savedSets = localStorage.getItem("wwm_question_sets")
      const savedActiveSet = localStorage.getItem("wwm_active_set")

      if (savedSets) {
        questionSets = JSON.parse(savedSets)

        if (savedActiveSet && questionSets.some((set) => set.id === savedActiveSet)) {
          activeSet = savedActiveSet
        } else if (questionSets.length > 0) {
          activeSet = questionSets[0].id
          localStorage.setItem("wwm_active_set", activeSet)
        }
      } else {
        // Create default question set if none exists
        const defaultSet = {
          id: "default",
          name: "Standard Fragen",
          questions: defaultQuestions,
        }

        questionSets = [defaultSet]
        activeSet = "default"
        localStorage.setItem("wwm_question_sets", JSON.stringify(questionSets))
        localStorage.setItem("wwm_active_set", "default")
      }

      // Update UI
      updateSetSelector()
      updateQuestionsTable()
      updateSetsList()
    } catch (error) {
      console.error("Fehler beim Laden der Frage-Sets:", error)
      showToast("Fehler", "Frage-Sets konnten nicht geladen werden.", "error")

      // Fallback to default set
      const defaultSet = {
        id: "default",
        name: "Standard Fragen",
        questions: defaultQuestions,
      }

      questionSets = [defaultSet]
      activeSet = "default"
    }
  }

  function updateSetSelector() {
    setSelector.innerHTML = ""

    questionSets.forEach((set) => {
      const option = document.createElement("option")
      option.value = set.id
      option.textContent = set.name
      option.selected = set.id === activeSet
      setSelector.appendChild(option)
    })
  }

  function updateQuestionsTable() {
    const activeQuestions = getActiveQuestions()
    questionsCount.textContent = `Fragen (${activeQuestions.length})`

    if (activeQuestions.length === 0) {
      questionsTableContainer.innerHTML = `
        <div class="empty-questions">
          Keine Fragen vorhanden. Erstellen Sie eine neue Frage.
        </div>
      `
      return
    }

    questionsTableContainer.innerHTML = `
      <table class="questions-table">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Frage</th>
            <th>Richtige Antwort</th>
            <th class="actions">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          ${activeQuestions
            .map(
              (question, index) => `
            <tr>
              <td class="number">${index + 1}</td>
              <td class="question">${question.question}</td>
              <td class="correct-answer">
                ${["A", "B", "C", "D"][question.correctAnswer]}: ${question.answers[question.correctAnswer]}
              </td>
              <td class="actions">
                <div class="action-buttons">
                  <button class="btn btn-ghost edit-question" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn btn-ghost delete-question" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-question").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number.parseInt(button.dataset.index)
        handleEditQuestion(getActiveQuestions()[index], index)
      })
    })

    document.querySelectorAll(".delete-question").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number.parseInt(button.dataset.index)
        handleDeleteQuestion(index)
      })
    })
  }

  function updateSetsList() {
    setsContainer.innerHTML = ""

    questionSets.forEach((set) => {
      const setElement = document.createElement("div")
      setElement.className = `set-item ${set.id === activeSet ? "active" : ""}`
      setElement.innerHTML = `
        <div class="set-info">
          <div class="set-name">${set.name}</div>
          <div class="set-count">${set.questions.length} Fragen</div>
        </div>
        <div class="set-actions">
          <button class="btn btn-outline btn-sm activate-set" data-id="${set.id}" ${set.id === activeSet ? "disabled" : ""}>
            Aktivieren
          </button>
          <button class="btn btn-ghost btn-sm delete-set" data-id="${set.id}" ${questionSets.length <= 1 ? "disabled" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `
      setsContainer.appendChild(setElement)
    })

    // Add event listeners
    document.querySelectorAll(".activate-set").forEach((button) => {
      button.addEventListener("click", () => {
        const setId = button.dataset.id
        saveActiveSet(setId)
      })
    })

    document.querySelectorAll(".delete-set").forEach((button) => {
      button.addEventListener("click", () => {
        const setId = button.dataset.id
        handleDeleteSet(setId)
      })
    })
  }

  function getActiveQuestions() {
    const activeSetData = questionSets.find((set) => set.id === activeSet)
    return activeSetData ? activeSetData.questions : []
  }

  function switchTab(tabName) {
    tabButtons.forEach((button) => {
      if (button.dataset.tab === tabName) {
        button.classList.add("active")
      } else {
        button.classList.remove("active")
      }
    })

    tabContents.forEach((content) => {
      if (content.id === `${tabName}-tab`) {
        content.classList.add("active")
      } else {
        content.classList.remove("active")
      }
    })
  }

  function handleCreateQuestion() {
    editingQuestion = {
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
    }
    editingIndex = null

    // Update modal
    questionModalTitle.textContent = "Neue Frage erstellen"
    questionText.value = ""
    answerInputs.forEach((input, index) => {
      input.value = ""
      answerLabels[index].textContent = `Antwort ${index + 1}`
    })
    correctAnswerRadios[0].checked = true

    // Show modal
    questionModal.classList.add("active")
  }

  function handleEditQuestion(question, index) {
    editingQuestion = { ...question }
    editingIndex = index

    // Update modal
    questionModalTitle.textContent = "Frage bearbeiten"
    questionText.value = question.question
    answerInputs.forEach((input, i) => {
      input.value = question.answers[i]
      answerLabels[i].textContent = question.answers[i] || `Antwort ${i + 1}`
    })
    correctAnswerRadios[question.correctAnswer].checked = true

    // Show modal
    questionModal.classList.add("active")
  }

  async function handleSaveQuestion() {
    if (!editingQuestion) return

    setIsSaving(true)

    try {
      // Validate question
      if (!questionText.value.trim()) {
        showToast("Fehler", "Die Frage darf nicht leer sein.", "error")
        setIsSaving(false)
        return
      }

      // Validate answers
      const answers = answerInputs.map((input) => input.value)
      if (answers.some((answer) => !answer.trim())) {
        showToast("Fehler", "Alle Antwortmöglichkeiten müssen ausgefüllt sein.", "error")
        setIsSaving(false)
        return
      }

      // Get correct answer
      const correctAnswer = Number.parseInt([...correctAnswerRadios].find((radio) => radio.checked).value)

      // Update editing question
      editingQuestion.question = questionText.value
      editingQuestion.answers = answers
      editingQuestion.correctAnswer = correctAnswer

      // Create a deep copy of the question sets
      const updatedSets = JSON.parse(JSON.stringify(questionSets))

      // Find the active set and update it
      const activeSetIndex = updatedSets.findIndex((set) => set.id === activeSet)

      if (activeSetIndex === -1) {
        throw new Error("Aktives Fragen-Set nicht gefunden")
      }

      if (editingIndex !== null && editingIndex >= 0) {
        // Edit existing question
        updatedSets[activeSetIndex].questions[editingIndex] = editingQuestion
      } else {
        // Add new question
        updatedSets[activeSetIndex].questions.push(editingQuestion)
      }

      // Save to localStorage first
      localStorage.setItem("wwm_question_sets", JSON.stringify(updatedSets))

      // Then update state
      questionSets = updatedSets

      // Add a small delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Close modal
      questionModal.classList.remove("active")

      // Update UI
      updateQuestionsTable()
      updateSetsList()

      showToast(
        "Erfolg",
        editingIndex !== null
          ? "Frage wurde erfolgreich aktualisiert und gesichert."
          : "Neue Frage wurde erfolgreich hinzugefügt und gesichert.",
      )
    } catch (error) {
      console.error("Fehler beim Speichern:", error)
      showToast("Fehler beim Speichern", "Bitte versuchen Sie es erneut.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteQuestion(index) {
    if (confirm("Sind Sie sicher, dass Sie diese Frage löschen möchten?")) {
      setIsSaving(true)

      try {
        // Create a deep copy of the question sets
        const updatedSets = JSON.parse(JSON.stringify(questionSets))

        // Find the active set
        const activeSetIndex = updatedSets.findIndex((set) => set.id === activeSet)

        if (activeSetIndex === -1) {
          throw new Error("Aktives Fragen-Set nicht gefunden")
        }

        // Remove the question
        updatedSets[activeSetIndex].questions.splice(index, 1)

        // Save to localStorage first
        localStorage.setItem("wwm_question_sets", JSON.stringify(updatedSets))

        // Then update state
        questionSets = updatedSets

        // Add a small delay to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Update UI
        updateQuestionsTable()
        updateSetsList()

        showToast("Erfolg", "Frage wurde gelöscht und Änderungen wurden gespeichert.")
      } catch (error) {
        console.error("Fehler beim Löschen der Frage:", error)
        showToast("Fehler", "Die Frage konnte nicht gelöscht werden.", "error")
      } finally {
        setIsSaving(false)
      }
    }
  }

  async function handleCreateSet() {
    const name = newSetName.value.trim()

    if (!name) {
      showToast("Fehler", "Bitte geben Sie einen Namen für das Fragen-Set ein.", "error")
      return
    }

    setIsSaving(true)

    try {
      const newSetId = `set_${Date.now()}`
      const newSet = {
        id: newSetId,
        name: name,
        questions: [],
      }

      // Create a new array with the new set
      const updatedSets = [...questionSets, newSet]

      // Save to localStorage first
      localStorage.setItem("wwm_question_sets", JSON.stringify(updatedSets))

      // Then update state
      questionSets = updatedSets
      activeSet = newSetId
      localStorage.setItem("wwm_active_set", newSetId)

      // Clear the input
      newSetName.value = ""

      // Add a small delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Update UI
      updateSetSelector()
      updateQuestionsTable()
      updateSetsList()

      showToast("Erfolg", `Fragen-Set "${name}" wurde erstellt und gespeichert.`)
    } catch (error) {
      console.error("Fehler beim Erstellen des Frage-Sets:", error)
      showToast("Fehler", "Das Fragen-Set konnte nicht erstellt werden.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  function saveActiveSet(setId) {
    try {
      activeSet = setId
      localStorage.setItem("wwm_active_set", setId)

      // Update UI
      updateSetSelector()
      updateQuestionsTable()
      updateSetsList()

      showToast("Erfolg", "Fragen-Set wurde aktiviert und gespeichert.")
    } catch (error) {
      console.error("Fehler beim Aktivieren des Sets:", error)
      showToast("Fehler", "Das Fragen-Set konnte nicht aktiviert werden.", "error")
    }
  }

  async function handleDeleteSet(setId) {
    if (questionSets.length <= 1) {
      showToast("Fehler", "Sie müssen mindestens ein Fragen-Set behalten.", "error")
      return
    }

    if (confirm("Sind Sie sicher, dass Sie dieses Fragen-Set löschen möchten?")) {
      setIsSaving(true)

      try {
        const updatedSets = questionSets.filter((set) => set.id !== setId)

        // Save to localStorage first
        localStorage.setItem("wwm_question_sets", JSON.stringify(updatedSets))

        // Then update state
        questionSets = updatedSets

        if (activeSet === setId) {
          const newActiveSet = updatedSets[0].id
          activeSet = newActiveSet
          localStorage.setItem("wwm_active_set", newActiveSet)
        }

        // Add a small delay to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Update UI
        updateSetSelector()
        updateQuestionsTable()
        updateSetsList()

        showToast("Erfolg", "Fragen-Set wurde gelöscht.")
      } catch (error) {
        console.error("Fehler beim Löschen des Frage-Sets:", error)
        showToast("Fehler", "Das Fragen-Set konnte nicht gelöscht werden.", "error")
      } finally {
        setIsSaving(false)
      }
    }
  }

  function setIsSaving(saving) {
    isSaving = saving

    if (saving) {
      saveQuestionBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon loading">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        Speichern...
      `
      saveQuestionBtn.disabled = true
      createSetBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon loading">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      `
      createSetBtn.disabled = true
    } else {
      saveQuestionBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Speichern
      `
      saveQuestionBtn.disabled = false
      createSetBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Erstellen
      `
      createSetBtn.disabled = false
    }
  }
})


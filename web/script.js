class WineQualityPredictor {
  constructor() {
    this.inputs = {
      fixedAcidity: document.getElementById("fixedAcidity"),
      volatileAcidity: document.getElementById("volatileAcidity"),
      citricAcid: document.getElementById("citricAcid"),
      residualSugar: document.getElementById("residualSugar"),
      chlorides: document.getElementById("chlorides"),
      freeSulfurDioxide: document.getElementById("freeSulfurDioxide"),
      pH: document.getElementById("pH"),
      sulphates: document.getElementById("sulphates"),
      alcohol: document.getElementById("alcohol"),
    }

    this.predictBtn = document.getElementById("predictBtn")
    this.predictionResult = document.getElementById("predictionResult")
    this.scoreValue = document.getElementById("scoreValue")
    this.qualityBadge = document.getElementById("qualityBadge")
    this.progressPercent = document.getElementById("progressPercent")
    this.progressFill = document.getElementById("progressFill")
    this.buttonText = document.querySelector(".button-text")
    this.loadingSpinner = document.querySelector(".loading-spinner")

    this.init()
  }

  init() {
    // Add event listeners to all inputs
    Object.values(this.inputs).forEach((input) => {
      input.addEventListener("input", () => this.validateForm())
    })

    // Add event listener to predict button
    this.predictBtn.addEventListener("click", () => this.predictQuality())

    // Initial form validation
    this.validateForm()
  }

  validateForm() {
    const allFilled = Object.values(this.inputs).every((input) => input.value.trim() !== "")

    this.predictBtn.disabled = !allFilled
  }

  async predictQuality() {
    // Show loading state
    this.setLoadingState(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Get input values
    const values = {}
    Object.keys(this.inputs).forEach((key) => {
      values[key] = Number.parseFloat(this.inputs[key].value) || 0
    })

    // Calculate prediction using simplified algorithm
    const prediction = this.calculateQuality(values)

    // Show results
    this.displayResults(prediction)

    // Hide loading state
    this.setLoadingState(false)
  }

  calculateQuality(values) {
    let score = 5 // Base score

    // Adjustments based on optimal ranges
    if (values.fixedAcidity >= 6 && values.fixedAcidity <= 9) score += 0.5
    if (values.volatileAcidity <= 0.6) score += 0.5
    if (values.citricAcid >= 0.2 && values.citricAcid <= 0.5) score += 0.3
    if (values.pH >= 3.0 && values.pH <= 3.5) score += 0.4
    if (values.alcohol >= 10 && values.alcohol <= 14) score += 0.8
    if (values.sulphates >= 0.4 && values.sulphates <= 0.8) score += 0.3
    if (values.freeSulfurDioxide >= 10 && values.freeSulfurDioxide <= 50) score += 0.2

    // Penalties
    if (values.volatileAcidity > 1.0) score -= 1.0
    if (values.chlorides > 0.1) score -= 0.5

    // Ensure score is between 1 and 10
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10))
  }

  getQualityInfo(score) {
    if (score >= 8) return { label: "Excelente", className: "quality-excellent" }
    if (score >= 7) return { label: "Muy Bueno", className: "quality-very-good" }
    if (score >= 6) return { label: "Bueno", className: "quality-good" }
    if (score >= 5) return { label: "Regular", className: "quality-regular" }
    return { label: "Deficiente", className: "quality-poor" }
  }

  displayResults(score) {
    const qualityInfo = this.getQualityInfo(score)
    const percentage = Math.round((score / 10) * 100)

    // Update score display
    this.scoreValue.textContent = `${score}/10`

    // Update quality badge
    this.qualityBadge.textContent = qualityInfo.label
    this.qualityBadge.className = `quality-badge ${qualityInfo.className}`

    // Update progress bar
    this.progressPercent.textContent = `${percentage}%`
    this.progressFill.style.width = `${percentage}%`
    this.progressFill.className = `progress-fill ${qualityInfo.className}`

    // Show results
    this.predictionResult.style.display = "block"
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.buttonText.style.display = "none"
      this.loadingSpinner.style.display = "block"
      this.predictBtn.disabled = true
    } else {
      this.buttonText.style.display = "block"
      this.loadingSpinner.style.display = "none"
      this.predictBtn.disabled = false
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WineQualityPredictor()
})


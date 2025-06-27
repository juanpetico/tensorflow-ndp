class WineQualityPredictor {
  constructor() {
    // Mapeo de inputs
    this.inputs = {
      fixedAcidity: document.getElementById("fixedAcidity"),
      volatileAcidity: document.getElementById("volatileAcidity"),
      citricAcid: document.getElementById("citricAcid"),
      residualSugar: document.getElementById("residualSugar"),
      chlorides: document.getElementById("chlorides"),
      freeSulfurDioxide: document.getElementById("freeSulfurDioxide"),
      pH: document.getElementById("pH"),
      sulphates: document.getElementById("sulphates"),
      alcohol: document.getElementById("alcohol")
    };

    // Elementos UI
    this.predictBtn = document.getElementById("predictBtn");
    this.predictionResult = document.getElementById("predictionResult");
    this.scoreValue = document.getElementById("scoreValue");
    this.qualityBadge = document.getElementById("qualityBadge");
    this.progressPercent = document.getElementById("progressPercent");
    this.progressFill = document.getElementById("progressFill");
    this.buttonText = document.querySelector(".button-text");
    this.loadingSpinner = document.querySelector(".loading-spinner");

    this.model = null;
    this.scaler = null;
    this.labels = null;

    this.init();
  }

  async init() {
    try {
      // Cargar modelo y datos
      [this.model, this.scaler, this.labels] = await Promise.all([
        tf.loadLayersModel('model/model.json'),
        fetch('scaler.json').then(r => r.json()),
        fetch('labels.json').then(r => r.json())
      ]);
      
      // Configurar eventos
      Object.values(this.inputs).forEach(input => {
        input.addEventListener("input", () => this.validateForm());
      });
      this.predictBtn.addEventListener("click", () => this.predictQuality());
      this.validateForm();
      
    } catch (error) {
      console.error("Error loading model:", error);
      alert("Error al cargar el modelo. Verifica la consola para más detalles.");
    }
  }

  validateForm() {
    const allFilled = Object.values(this.inputs).every(input => 
      input.value.trim() !== "" && !isNaN(input.value)
    );
    this.predictBtn.disabled = !allFilled;
  }

  async predictQuality() {
    this.setLoadingState(true);
    
    try {
      // Obtener valores en el orden correcto
      const inputValues = [
        this.inputs.fixedAcidity.value,
        this.inputs.volatileAcidity.value,
        this.inputs.citricAcid.value,
        this.inputs.residualSugar.value,
        this.inputs.chlorides.value,
        this.inputs.freeSulfurDioxide.value,
        this.inputs.pH.value,
        this.inputs.sulphates.value,
        this.inputs.alcohol.value
      ].map(Number);

      // Normalizar
      const normalized = this.normalize(inputValues);
      const tensor = tf.tensor2d([normalized], [1, normalized.length]);
      
      // Predecir
      const prediction = await this.model.predict(tensor).data();
      tensor.dispose();
      
      const predictedClass = this.getPredictedClass(prediction);
      this.displayResults({
        score: predictedClass.score,
        confidence: predictedClass.confidence
      });
      
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error al realizar la predicción");
    } finally {
      this.setLoadingState(false);
    }
  }

  normalize(values) {
    return values.map((val, i) => 
      (val - this.scaler.min[i]) / (this.scaler.max[i] - this.scaler.min[i])
    );
  }

  getPredictedClass(prediction) {
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    return {
      score: this.labels[maxIndex] + 3,
      confidence: prediction[maxIndex]
    };
  }

  getQualityInfo(score) {
    if (score >= 7) return { 
      label: "Excelente", 
      className: "quality-excellent",
      minScore: 7,
      maxScore: 8
    };
    if (score >= 6) return { 
      label: "Bueno", 
      className: "quality-good",
      minScore: 6,
      maxScore: 6.9
    };
    return { 
      label: "Regular", 
      className: "quality-regular",
      minScore: 3,
      maxScore: 5.9
    };
  }

  displayResults({score, confidence}) {
    const qualityInfo = this.getQualityInfo(score);
    const percentage = Math.round(confidence * 100);

    // Actualizar UI
    this.scoreValue.textContent = `${score}/8`;
    this.qualityBadge.textContent = qualityInfo.label;
    this.qualityBadge.className = `quality-badge ${qualityInfo.className}`;
    
    this.progressPercent.textContent = `${percentage}%`;
    this.progressFill.style.width = `${percentage}%`;
    this.progressFill.className = `progress-fill ${qualityInfo.className}`;
    this.progressFill.title = `Puntaje real: ${score} (${qualityInfo.label})`;
    
    this.predictionResult.style.display = "block";
  }

  setLoadingState(isLoading) {
    this.buttonText.style.display = isLoading ? "none" : "block";
    this.loadingSpinner.style.display = isLoading ? "block" : "none";
    this.predictBtn.disabled = isLoading;
  }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  new WineQualityPredictor();
});
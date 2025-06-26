class WineQualityPredictor {
  constructor() {
    // Mapeo de IDs de inputs (nuevos nombres)
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

    // Elementos de la UI
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
    // Cargar modelo y datos
    try {
      [this.model, this.scaler, this.labels] = await Promise.all([
        tf.loadLayersModel('model/model.json'),
        fetch('scaler.json').then(r => r.json()),
        fetch('labels.json').then(r => r.json())
      ]);
      
      // Habilitar eventos
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
      // Obtener valores en el orden correcto (como en el entrenamiento)
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
      const tensor = tf.tensor([normalized]);
      
      // Predecir
      const prediction = await this.model.predict(tensor).data();
      tensor.dispose();
      
      // Mostrar resultados
      const predictedClass = this.getPredictedClass(prediction);
      this.displayResults(predictedClass);
      
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
      score: this.labels[maxIndex] + 3, // Ajustar si restaste 3 durante el entrenamiento
      confidence: prediction[maxIndex]
    };
  }

  getQualityInfo(score) {
    if (score >= 8) return { label: "Excelente", className: "quality-excellent" };
    if (score >= 7) return { label: "Muy Bueno", className: "quality-very-good" };
    if (score >= 6) return { label: "Bueno", className: "quality-good" };
    if (score >= 5) return { label: "Regular", className: "quality-regular" };
    return { label: "Deficiente", className: "quality-poor" };
  }

  displayResults({score, confidence}) {
    const qualityInfo = this.getQualityInfo(score);
    const percentage = Math.round(confidence * 100);

    this.scoreValue.textContent = `${score}/10`;
    this.qualityBadge.textContent = qualityInfo.label;
    this.qualityBadge.className = `quality-badge ${qualityInfo.className}`;
    
    this.progressPercent.textContent = `${percentage}%`;
    this.progressFill.style.width = `${percentage}%`;
    this.progressFill.className = `progress-fill ${qualityInfo.className}`;
    
    this.predictionResult.style.display = "block";
  }

  setLoadingState(isLoading) {
    this.buttonText.style.display = isLoading ? "none" : "block";
    this.loadingSpinner.style.display = isLoading ? "block" : "none";
    this.predictBtn.disabled = isLoading;
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  new WineQualityPredictor();
});
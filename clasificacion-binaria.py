import os
import numpy as np
import pandas as pd
import tensorflow as tf
#https://www.kaggle.com/datasets/akshaydattatraykhare/diabetes-dataset

# 1. Cargar el dataset.
file_path = os.path.join(os.path.dirname(__file__), "diabetes.csv")
df = pd.read_csv(file_path)
df['Age'] = df['Age'].astype(np.int32)

# 2. Entradas y salidas.
X = df.drop(['Outcome', 'SkinThickness', 'DiabetesPedigreeFunction'], axis=1).to_numpy().astype(np.float32)
y = df['Outcome'].to_numpy().astype(np.float32)

# 3. Normalizar datos.
X_min = X.min(axis=0)
X_max = X.max(axis=0)
X = (X - X_min) / (X_max - X_min)

# 4. Mezclar índices
rng = np.random.default_rng(seed=14)
indices = rng.permutation(len(X))
X = X[indices]
y = y[indices]

# 5. 80/20 en entrenamiento y prueba.
split_idx = int(len(X) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

# 6. Estructura de la red neuronal usando sigmoide.
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid') 
])

#7. Compilar la red neuronal.
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# 7. Entrenar el modelo.
model.fit(
    X_train, y_train,
    epochs=500,
    validation_split=0.2
)

# 8. Evaluar el modelo.
loss, acc = model.evaluate(X_test, y_test)
print(f"\nPrecision en test: {acc:.4f} | Perdida: {loss:.4f}")

def leer_float(prompt):
    return float(input(prompt).strip())

while True:
    pregnancies   = leer_float("N° de Embarazos: ")
    glucose       = leer_float("Nivel de Glucosa: ")
    bloodpressure = leer_float("Presion arterial: ")
    #skinthickness = leer_float("Grosor de piel: ")
    insulin       = leer_float("Nivel de Insulina: ")
    bmi           = leer_float("BMI: ")
    #dpf           = leer_float("DiabetesPedigreeFunction: ")
    age           = leer_float("Edad: ")

    # Vector de entrada
    entrada = np.array([[pregnancies, glucose, bloodpressure, insulin, bmi, age]], dtype=np.float32)

    # Normalizar con los mismos parámetros que el entrenamiento
    entrada_norm = (entrada - X_min) / (X_max - X_min)

    # Predicción
    prob = model.predict(entrada_norm)[0][0]
    resultado = "SÍ (1)" if prob >= 0.5 else "NO (0)"
    print(f"\n¿Diabetes?: {resultado}  –  Probabilidad: {prob:.2%}")


# Glucosa Normal: 70-99 mg/dL < 140 post comida
# Presión arterial normal: 80/120 mmHg < 130 hipertensión
# Insulina normal: 2-25 µU/mL
# BMI normal: 18.5-24.9 kg/m²
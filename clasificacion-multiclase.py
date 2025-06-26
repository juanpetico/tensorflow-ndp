import pandas as pd
import numpy as np
import os
import tensorflow as tf
import time
import json, pathlib

# 1. Cargar el dataset.
file_path = os.path.join(os.path.dirname(__file__), "WineQT.csv")
df = pd.read_csv(file_path)

# 2. Entradas y salidas.
X = df.drop(['quality', 'density', 'Id', 'total sulfur dioxide'], axis=1).to_numpy().astype(np.float32)
y = df['quality'].to_numpy().astype(np.float32) - 3 # Quality va de 3 a 8, tensorflow espera que las clases comiencen en 0, así que restamos 3.

# Guardar clases posibles (por si acaso)
classes = sorted(np.unique(y).tolist())
pathlib.Path("./web/labels.json").write_text(json.dumps(classes))

# 3. Normalizar datos.
X_min = X.min(axis=0)
X_max = X.max(axis=0)
X = (X - X_min) / (X_max - X_min)

# Guardar el escalador para la web
scaler = {'min': X_min.tolist(), 'max': X_max.tolist()}
pathlib.Path("./web/scaler.json").write_text(json.dumps(scaler))

# 4. Mezclar índices
rng = np.random.default_rng(seed=14)
indices = rng.permutation(len(X))
X = X[indices]

# 5. 80/20 en entrenamiento y prueba.
split_idx = int(len(X) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

start_time = time.time()

# 6. Estructura de la red neuronal usando softmax.
num_clases = len(y)  # Número de clases de calidad del vino
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(num_clases, activation='softmax')
])

# 7. Compilar la red neuronal.
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 8. Entrenar el modelo.
model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=256,
    validation_split=0.2
)

# 9. Evaluar el modelo.
loss, acc = model.evaluate(X_test, y_test)

total_time = time.time() - start_time
#model.save("wine_model.h5")

print(f"\nTiempo total de entrenamiento: {total_time:.2f} segundos")
print(f"\nPrecision en test: {acc:.4f} | Perdida: {loss:.4f}")

# 10. Predecir la calidad del vino.
# def leer_float(prompt):
#     return float(input(prompt).strip())

# while True:
#     try:
#         input_data = np.array([
#             leer_float("Fijo de acidez: "),
#             leer_float("Volatile acidity: "),
#             leer_float("Citric acid: "),
#             leer_float("Residual sugar: "),
#             leer_float("Chlorides: "),
#             leer_float("Free sulfur dioxide: "),
#             leer_float("pH: "),
#             leer_float("Sulphates: "),
#             leer_float("Alcohol: ")
#         ], dtype=np.float32).reshape(1, -1)

#         # Normalizar la entrada
#         input_data = (input_data - X_min) / (X_max - X_min)

#         prediction = model.predict(input_data)
#         predicted_quality = np.argmax(prediction, axis=1)[0] + 3  # Ajustar el índice a la calidad real

#         print(f"La calidad del vino es aproximadamente {predicted_quality}.")
#     except ValueError:
#         print("Entrada no válida. Por favor, ingrese números válidos.")
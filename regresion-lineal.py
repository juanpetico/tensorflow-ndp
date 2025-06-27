import os
import numpy as np
import pandas as pd
import tensorflow as tf

# 1. Cargar el dataset
file_path = os.path.join(os.path.dirname(__file__), "automobile.csv")
df = pd.read_csv(file_path)

# 2. Limpiar datos.
for column in ['horsepower', 'curb-weight', 'engine-size', 'highway-mpg', 'price']:
    df[column] = pd.to_numeric(df[column], errors='coerce') 
    #print(f"Columna '{column}': {df[column].isna().sum()} valores convertidos a NaN")
    
df_clean = df[['horsepower', 'curb-weight', 'engine-size', 'highway-mpg', 'price']].dropna()

# 3. Entradas y salidas
X = df_clean[['horsepower', 'curb-weight', 'engine-size', 'highway-mpg']].to_numpy().astype(np.float32)
y = df_clean['price'].to_numpy().astype(np.float32)

# 4. Normalizar los datos
X_min = X.min(axis=0)
X_max = X.max(axis=0)
X_norm = (X - X_min) / (X_max - X_min)

# 5. Dividir en entrenamiento y prueba (70/30)
split_idx = int(len(X_norm) * 0.7)
X_train, X_test = X_norm[:split_idx], X_norm[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

# 6. Estructura de la red neuronal
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1)
])

# 7. Compilar la red neuronal
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# 8. Entrenar el modelo
model.fit(X_train, y_train, epochs=500, validation_split=0.2)

# 9. Evaluar el modelo
loss, mae = model.evaluate(X_test, y_test)

print(f"Loss: {loss:.4f}, MAE: {mae:.4f}")

# 10. Interacción
def leer_float(prompt):
    return float(input(prompt).strip())

while True:
    try:
        input_data = np.array([
            leer_float("Caballos de fuerza: "),
            leer_float("Peso del vehículo: "),
            leer_float("Tamaño del motor: "),
            leer_float("Millas por galón en carretera: ")
        ], dtype=np.float32).reshape(1, -1)

        input_data = (input_data - X_min) / (X_max - X_min)

        pred = model.predict(input_data)
        print(f"\nPrecio estimado: ${pred[0][0]:,.0f} CLP")
    except ValueError:
        print("Entrada no válida. Por favor, ingrese valores numéricos.")
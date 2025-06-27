## Requisitos
Python 3.10+

## Clonar el repositorio:
   git clone https://github.com/juanpetico/tensorflow-ndp.git

## Ejecutar en entorno virtual para su uso: 

1. pip install virtualenv
2. python -m venv mi_entorno 
3. mi_entorno\Scripts\activate
4. python -m pip install --upgrade pip
6. pip install -r requirements.txt

## Indicaciones para el de multiclase:

1. Ejecutar el script con python clasificacion-multiclase.py (descomentar el model.save())
2. Crear carpeta para web/model para el model.json 
    mkdir -p web/model
3. Comando para generar el wine_model.h5
    "tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model wine_model.h5 web/model"
4. cd model
5. python -m http.server 8000
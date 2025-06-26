## Requisitos
Python 3.10+

## Clonar el repositorio:
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo

## Ejecutar entorno virtual: 

1. pip install virtualenv
2. python -m venv mi_entorno 
3. mi_entorno\Scripts\activate
4. python -m pip install --upgrade pip
6. pip install -r requirements.txt

Ejecutar:

1. Ejecutar el script con python clasificacion-multiclase.py
2. Repo web/model 
    mkdir -p web/model
3. Comando para generar el wine_model.h5
    "tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model wine_model.h5 web/model"
4. cd model
5. python -m http.server 8000
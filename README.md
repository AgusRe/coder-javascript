# Proyecto 2 de JavaScript

Este proyecto fue creado como parte de la cursada de JavaScript en [Coderhouse](https://www.coderhouse.com/). El objetivo principal es comprender y practicar la lógica de programación con JavaScript, en este caso, a través de un de juego RPG de decisiones, donde el jugador interactuará con personajes, elegirá una clase, administra un inventario y explora diferentes rutas narrativas. Posteriormente, se añadirá un sistema de combate.

---

## Descripción General

El proyecto consiste en un **simulador de decisiones** ambientado en un mundo de fantasía. El jugador despierta sin recuerdos en la aldea del reino de Aurora y, a partir de ahí, va a tener que interactuar con aldeanos, un alcalde y un gremio de aventureros para descubrir pistas sobre su pasado. Ir descubriendo pistas, matar mounstros y ser buena persona va a ir sumando puntos a medida que el juego pasa.

1. **Elección de clase**: El jugador puede ser Mago, Ladrón, Arquero o Guerrero.  
2. **Interacción con personajes**: Diálogos con aldeanos y el Alcalde para avanzar en la historia.  
3. **Exploración**: Opciones para ir al Gremio de Aventureros, explorar la aldea o cazar monstruos en las afueras.  
4. **Sistema de Inventario**: Manejo de ítems (objetos) con nombre, tipo, valor y cantidad.  
5. **Ramas narrativas**: Las decisiones influyen en el puntaje y la progresión de la historia.

---

## Rama de Diálogo Más Larga

La ruta más extensa en el árbol de diálogos (según la lógica actual) es la siguiente:

1. **Comienzo**: Confirmar que se desea iniciar la historia (`storyTime`).  
2. **Elección de Nombre y Clase** (`nombreYClase`).  
3. **Interacción con el aldeano**: Opción **1** (Hablar con él).  
4. **Respuesta al aldeano**: Opción **1** (Presentarte amablemente) → hablas con el Alcalde.  
5. **Hablar con el Alcalde** (`hablarConElAlcalde`).  
6. **Siguiente Paso** (`siguientePasoAldea`): Opción **1** (Ir al gremio de aventureros).  
7. **En el gremio** (`irAlGremio`): Opción **3** (Ir a cazar monstruos).  


Este recorrido es el más largo en cuanto a cantidad de eventos y diálogos en la historia actual.

---

## Estructura de Archivos

- **index.html**  
  Contiene la estructura base del proyecto y hace referencia al archivo JavaScript.

- **programacion.js**  
  Archivo JavaScript con toda la lógica del proyecto:
  - Declaración del objeto `player` y funciones de inventario.
  - Funciones que controlan el flujo de la historia y los diálogos.

- **README.md**  
  Explica la idea del proyecto, su estructura y cómo ejecutarlo.

---

## Agradecimientos

- [Coderhouse](https://www.coderhouse.com/ar/)  
- [Página de creación de README](https://readme.so/es)  

---

## Autor

- [@AgusRe](https://github.com/AgusRe)

Este proyecto se desarrolla como práctica para la cursada de JavaScript en Coderhouse.  
¡Cualquier sugerencia o mejora será bienvenida!

# Proyecto 2 de JavaScript

Este proyecto fue creado como parte de la cursada de JavaScript en [Coderhouse](https://www.coderhouse.com/). El objetivo principal es comprender y practicar la lógica de programación con JavaScript a través de un juego RPG de decisiones, donde el jugador:
- Elige una clase.
- Administra un inventario (con un kit de bienvenida).
- Explora distintas rutas narrativas.
- Participa en combates por turnos con distintos enemigos.

Posteriormente, se van a ir añadiendo mejoras al **sistema de combate**, la **lógica de vida limitada** (no puede exceder la vida base + 5), y la **creación progresiva de enemigos**.

---

## Descripción General

El proyecto consiste en un **simulador de decisiones** ambientado en un mundo de fantasía. El jugador despierta sin recuerdos en la aldea del reino de **Aurora** y, a partir de ahí, debe interactuar con aldeanos, un alcalde y un gremio de aventureros para descubrir pistas sobre su pasado. Además, existe la posibilidad de cazar monstruos en las afueras del pueblo y **pelear** en un sistema de combate por turnos.

1. **Elección de clase**: El jugador puede ser **Mago**, **Ladrón**, **Arquero** o **Guerrero**. Cada clase tiene una vida base distinta (100, 80, 90, 120, respectivamente) y **no puede exceder su vida base + 5**.
2. **Interacción con personajes**: Diálogos con aldeanos y el Alcalde para avanzar en la historia y obtener información.
3. **Exploración**: Opciones para ir al **Gremio de Aventureros**, explorar la aldea o cazar monstruos en las afueras.
4. **Sistema de Inventario**: Manejo de ítems (objetos) con nombre, tipo, valor y cantidad, además de un **kit de bienvenida** inicial.
5. **Sistema de Combate por Turnos**: El jugador y el enemigo se alternan ataques. El jugador puede usar pociones para curarse (sin superar su vida máxima) o huir del combate.
6. **Creación de Enemigos**: Primero se enfrentan enemigos fijos (Slime, Lobo, Hada Maligna). Luego, se generan enemigos aleatorios (Orco, Zombi, Esqueleto, etc.) con mayor dificultad.
7. **LocalStorage**: Se guardan datos relevantes (como el `player` y su inventario) para persistir entre recargas de página.
8. **Ramas Narrativas**: Las decisiones influyen en el **puntaje** y en la **progresión** de la historia, aunque todavía no se creó un *scoreboard* para guardar los resultados.

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

Este recorrido abarca la mayor cantidad de diálogos y eventos de la historia actual.
Para probar el 'sistema de combate', en el **(1) Comienzo** se debe tocar rechazar y se irá directamente a un playground para probar los diferentes cambios nuevos.

---

## Estructura de Archivos

- **index.html**  
  Contiene la estructura base del proyecto y hace referencia al archivo JavaScript.

- **programacion.js**  
  Archivo JavaScript con toda la lógica del proyecto:
  - **Clases** (`Player`, `Enemigo`) con propiedades de vida (`pv`, `maxPv`), inventario, etc.
  - **Funciones** que controlan el flujo de la historia, los diálogos, la creación de enemigos y el combate por turnos.
  - **LocalStorage** para persistir datos (como `player` y su inventario).
  - **Kit de bienvenida** que se entrega al jugador solo una vez.

- **README.md**  
  Explica la idea del proyecto, su estructura, cómo ejecutarlo y las últimas novedades agregadas.

---

## Cómo Ejecutar el Proyecto

1. **Descargar o clonar** este repositorio.  
2. **Abrir** el archivo `index.html` en un navegador web.  
3. **Seguir** las instrucciones que aparecen en pantalla y en los cuadros de diálogo dentro del DOM.

> **Nota**: Al tratarse de un proyecto enfocado en la lógica de JavaScript, la interacción ocurre principalmente en el **DOM** y se apoya en **LocalStorage** para persistir datos.

---

## Agradecimientos

- [Coderhouse](https://www.coderhouse.com/ar/)  
- [Página de creación de README](https://readme.so/es)  

---

## Autor

- [@AgusRe](https://github.com/AgusRe)

Este proyecto se desarrolla como práctica para la cursada de JavaScript en Coderhouse.  
¡Cualquier sugerencia o mejora será bienvenida!

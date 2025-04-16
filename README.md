# Proyecto 2 de JavaScript

Este proyecto se desarrolla como parte de la cursada de JavaScript en [Coderhouse](https://www.coderhouse.com/). El objetivo es profundizar la lógica de programación a través de un **juego RPG de decisiones**, en el que el jugador:

1. **Selecciona** una clase (Mago, Ladrón, Arquero o Guerrero).  
2. **Administra** un inventario (incluyendo un kit de bienvenida).  
3. **Explora** diferentes rutas narrativas en un mundo de fantasía.  
4. **Participa** en combates por turnos contra diversos enemigos.

Con el tiempo, se agregaron y se van a seguir añadiendo mejoras al **sistema de combate**, la **lógica de vida limitada** (PV base + 5), la **creación progresiva de enemigos**, y ahora un **menú de habilidades** según la clase.

---

## Descripción General

El juego inicia cuando el personaje despierta sin recuerdos en la aldea del reino de **Aurora**, debiendo interactuar con aldeanos, un alcalde y el gremio de aventureros para descubrir su pasado. A su vez, puede cazar monstruos en las afueras y combatir en un sistema de **turnos**, donde cada clase posee habilidades especiales.

- **Vida y Clase**: Cada clase (Mago, Ladrón, Arquero, Guerrero) tiene vida base distinta, no excedible más de 5 puntos.  
- **Inventario**: Se maneja a través de objetos (ítems) que se muestran en el DOM y se almacenan en LocalStorage.  
- **Combate por Turnos**: El jugador ataca, el enemigo contraataca, y hay opciones de usar pociones, habilidades o escapar.  
- **Enemigos**: Se enfrentan enemigos fijos (Slime, Lobo, Hada Maligna) y luego se generan aleatoriamente (Orco, Zombi, etc.) con dificultad creciente.  
- **LocalStorage**: Se guardan datos relevantes (`player`, inventario) para persistir entre recargas.

---

## Ruta de Diálogo Más Larga

1. **Comienzo**: Se elige iniciar o cancelar la historia.  
2. **Elección de Nombre y Clase**: El jugador ingresa un nombre y una clase.  
3. **Interacción con Aldeano**: Opción de hablar con él.  
4. **Hablar con el Alcalde**: Se obtiene información adicional.  
5. **Ir al Gremio**: El jugador puede explorar, recibir misiones o cazar monstruos.  
6. **Enemigos**: Se presentan los combates por turnos y se prueba el nuevo sistema de habilidades.  

Si se rechaza al principio, se salta la historia y se va directamente a cazar monstruos (modo playground) para probar cambios recientes.

---

## Estructura de Archivos

- **index.html**  
  Contiene la estructura base y referencia al JavaScript principal.

- **programacion.js**  
  - **Clases**: `Player` y `Enemigo`, con propiedades como PV, ataque, inventario y métodos para combate.  
  - **Funciones DOM**: Para mostrar la historia (`actualizarHistoria`), botones (`mostrarOpciones`), e inventario.  
  - **Sistema de Combate**: Incluye la función `peleaPorTurnos` con opciones de ataque, uso de pociones, habilidades y escape.  
  - **LocalStorage**: Para persistir datos (`player`) entre recargas.  
  - **Kit de Bienvenida**: Solo se agrega la primera vez.  
  - **Habilidades**: Cada clase tiene su menú de habilidades especiales.

- **README.md**  
  Explica el objetivo del proyecto, su estructura, instrucciones de ejecución y últimas novedades.

---

## Cómo Ejecutar el Proyecto

1. **Clonar o descargar** este repositorio.  
2. **Abrir** `index.html` en un navegador.  
3. **Seguir** las instrucciones en pantalla, usando los botones para interactuar con la historia y el combate.

> **Nota**: La experiencia se basa en **eventos del DOM** y se apoya en **LocalStorage** para guardar el progreso.

---

## Agradecimientos

- [Coderhouse](https://www.coderhouse.com/ar/)  
- [Página de creación de README](https://readme.so/es)  

---

## Autor

- [@AgusRe](https://github.com/AgusRe)

Este proyecto evoluciona con cada entrega y se perfecciona con la práctica de la cursada de JavaScript en Coderhouse.  
¡Las sugerencias y mejoras son siempre bienvenidas!

import { obtenerMision } from './misiones.js';

/*******************************************
 * 1) Clases y Variables Globales 
 *******************************************/

/**
 * Clase que representa al jugador.
 */
class Player {
  /**
   * Crea una instancia de Player.
   * @param {string} nombre - Nombre del jugador.
   * @param {string} clase - Clase del jugador.
   */
  constructor(nombre, clase) {
    this.nombre = nombre;
    this.clase = clase;
    this.armadura = 0;
    this.ataque = 0;
    this.nivel = 1;
    this.puntaje = 0;
    this.inventario = [];

    switch (clase) {
      case "Mago":
        this.pv = 100;
        break;
      case "Ladron":
        this.pv = 80;
        break;
      case "Arquero":
        this.pv = 90;
        break;
      case "Guerrero":
        this.pv = 120;
        break;
      default:
        this.pv = 80;
    }
    this.maxPv = this.pv + 5;
  }

  /**
   * Devuelve la descripción del jugador.
   * @returns {string} Información del jugador.
   */
  mostrarJugador() {
    return (
      `Jugador: ${this.nombre}\n` +
      `PV: ${this.pv} / ${this.maxPv}\n` +
      `Clase: ${this.clase}\n` +
      `Inventario: ${this.inventario.map(obj => obj.nombre).join(", ")}\n` +
      `Puntaje: ${this.puntaje}`
    );
  }
}

/**
 * Clase que representa a un enemigo.
 */
class Enemigo {
  /**
   * Crea una instancia de Enemigo.
   * @param {string} nombre - Nombre del enemigo.
   * @param {string} tipo - Tipo del enemigo.
   * @param {string} clase - Clase o categoría.
   * @param {number} dificultad - Dificultad del enemigo.
   * @param {Array} habilidades - Habilidades del enemigo.
   * @param {number} pv - Puntos de vida del enemigo.
   */
  constructor(nombre, tipo, clase, dificultad, habilidades = [], pv) {
    this.nombre = nombre;
    this.tipo = tipo;
    this.clase = clase;
    this.dificultad = dificultad;
    this.habilidades = habilidades;
    this.pv = pv;
  }
}

// Variable global para almacenar la instancia del jugador
let player;

// Array para almacenar múltiples enemigos creados
let enemigos = [];

/*******************************************
 * 2) Funciones para el DOM
 *******************************************/

// Referencias al DOM
const storyText = document.getElementById("story-text");
const choicesDiv = document.getElementById("choices");
const statsDiv = document.getElementById("stats");

/**
 * Actualiza (acumula) el contenido de la historia en el DOM.
 * Al comenzar una nueva sesión se puede limpiar el área (clear = true).
 * En cada actualización, todos los mensajes previos se marcan como "past" (texto gris) y el mensaje actual se agrega con la clase "current" (texto en negro) para dejar simbolizado un poco mejor cuál es el cuadro de texto con el que está hablando el usuario en el momento.
 * @param {string} text - Texto a mostrar.
 * @param {boolean} clear - Si es true, se limpia el contenido previo.
 */
function actualizarHistoria(text, clear = false) {
  if (clear) {
    storyText.innerHTML = "";
  } else {
    // Transformar todos los párrafos existentes a historial (clase "past")
    Array.from(storyText.getElementsByTagName("p")).forEach(p => {
      p.classList.remove("current");
      p.classList.add("past");
    });
  }
  const p = document.createElement("p");
  p.innerHTML = text;
  p.classList.add("current"); // Mensaje actual (negrita en negro)
  storyText.appendChild(p);
  storyText.scrollTop = storyText.scrollHeight;

  // Efecto de tipeo letra por letra usando anime.js
  let i = 0;

  anime({
    targets: {},
    duration: text.length * 200,
    easing: 'linear',
    update: function() {
      if (i <= text.length) {
        p.innerHTML = text.substring(0, i);
        storyText.scrollTop = storyText.scrollHeight;
        i++;
      }
    }
  });
}

/**
 * Actualiza la pestaña de estadísticas con los datos actuales del jugador, incluyendo el inventario en forma de lista vertical y muestra un botón de reiniciar que usa SweetAlert2.
 */
function actualizarStats() {
  if (player && statsDiv) {
    // Acá se crea una lista de elementos <li> con el inventario del jugador
    let inventarioHTML = "<ul>";
    if (player.inventario.length > 0) {
      player.inventario.forEach(item => {
        inventarioHTML += `<li>${item.nombre} (x${item.cantidad})</li>`;
      });
    } else {
      inventarioHTML += "<li>Vacío</li>";
    }
    inventarioHTML += "</ul>";

    statsDiv.innerHTML = `
      <strong>${player.nombre}</strong><br>
      PV: ${player.pv} / ${player.maxPv}<br>
      Clase: ${player.clase}<br>
      Puntaje: ${player.puntaje}<br>
      <strong>Inventario:</strong> ${inventarioHTML}
      <br>
      <button id="reiniciarBtn" class="btn btn-secondary">Reiniciar</button>
    `;
    document.getElementById("reiniciarBtn").addEventListener("click", reiniciarJuego);
  }
}

/**
 * Muestra opciones como botones en el contenedor de choices.
 * Se utiliza DocumentFragment para minimizar repintados.
 * @param {Array} choices - Array de objetos con propiedades label y handler.
 * @param {boolean} fullWidth - Indica si se muestra un botón ancho.
 */
function mostrarOpciones(choices, fullWidth = false) {
  choicesDiv.classList.remove("two-rows");
  if (fullWidth) {
    choicesDiv.classList.add("single-button");
  } else {
    choicesDiv.classList.remove("single-button");
  }
  
  // Limpiar opciones anteriores
  choicesDiv.innerHTML = "";

  const fragment = document.createDocumentFragment();
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.classList.add("btn", "btn-primary", "m-1");
    btn.addEventListener("click", choice.handler);
    fragment.appendChild(btn);
  });
  choicesDiv.appendChild(fragment);
}

/**
 * Deshabilita temporalmente los botones de opciones.
 */
function disableOpciones() {
  document.querySelectorAll("#choices button").forEach(btn => btn.disabled = true);
}

/**
 * Habilita los botones de opciones.
 */
function enableOpciones() {
  document.querySelectorAll("#choices button").forEach(btn => btn.disabled = false);
}

/**
 * Guarda datos en LocalStorage y actualiza las estadísticas.
 * @param {string} key - Clave de almacenamiento.
 * @param {any} data - Datos a almacenar.
 */
function guardarDatos(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  if (key === "player") {
    actualizarStats();
  }
}

/**
 * Carga datos desde LocalStorage.
 * @param {string} key - Clave del dato.
 * @returns {any} Datos cargados o null.
 */
function cargarDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    Swal.fire({
      title: 'Error al cargar datos',
      text: 'Hubo un problema al leer los datos del almacenamiento local.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
    return null;
  }
}

/*******************************************
 * 3) Funciones útiles y de Creación de Enemigos
 *******************************************/

/**
 * Ejecuta la habilidad correspondiente según la clase del jugador.
 * Se deshabilitan las opciones mientras se muestra el mensaje con delay.
 * @param {number} habilidadIndex - Índice de la habilidad (0 a 3).
 * @param {Enemigo} enemigo - Enemigo actual del combate.
 */
function usarHabilidad(habilidadIndex, enemigo) {
  disableOpciones();
  switch (player.clase) {
    case "Mago":
      switch (habilidadIndex) {
        case 0: {
          const dmg = 20 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Lanzas una Bola de Fuego causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          const bonus = 10;
          player.armadura += bonus;
          actualizarHistoria(`Activas un Escudo Arcano y aumentas tu armadura en ${bonus}.`);
          break;
        }
        case 2: {
          const dmg = 15 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Lanzas un Rayo Congelante causando ${dmg} de daño y congelas al enemigo.`);
          break;
        }
        case 3: {
          actualizarHistoria(`Te teletransportas, esquivando el próximo ataque enemigo.`);
          break;
        }
      }
      break;
    case "Guerrero":
      switch (habilidadIndex) {
        case 0: {
          const dmg = 25 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Golpe Poderoso causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          player.armadura += 15;
          actualizarHistoria(`Activaste Defensa de Acero y aumentas tu armadura en 15.`);
          break;
        }
        case 2: {
          const dmg = 20 + enteroRandom(0, 10);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas una Carga Brutal causando ${dmg} de daño.`);
          break;
        }
        case 3: {
          player.puntaje += 10;
          actualizarHistoria(`Emites un Grito de Batalla y ganas 10 puntos de puntaje.`);
          break;
        }
      }
      break;
    case "Arquero":
      switch (habilidadIndex) {
        case 0: {
          const dmg = 18 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Disparas con precisión causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          const dmg = 12 + enteroRandom(0, 8);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas una Lluvia de Flechas causando ${dmg} de daño.`);
          break;
        }
        case 2: {
          const dmg = 30;
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Tiro al Corazón causando ${dmg} de daño crítico.`);
          break;
        }
        case 3: {
          actualizarHistoria(`Te preparas para esquivar, aumentando tu probabilidad de evadir el próximo ataque.`);
          break;
        }
      }
      break;
    case "Ladron":
      switch (habilidadIndex) {
        case 0: {
          const dmg = 20 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Ataque Sorpresa causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          actualizarHistoria(`Activas tu habilidad de Esquivar, incrementando tu evasión.`);
          break;
        }
        case 2: {
          actualizarHistoria(`Intentas robar al enemigo. Si tienes éxito, podrías obtener un objeto.`);
          break;
        }
        case 3: {
          actualizarHistoria(`Realizas una Finta para confundir al enemigo, reduciendo su precisión.`);
          break;
        }
      }
      break;
  }
  guardarDatos("player", player);
  setTimeout(() => { enableOpciones(); }, 1200);
}

/**
 * Muestra un menú de habilidades según la clase del jugador durante el combate.
 * @param {Enemigo} enemigo - Enemigo actual del combate.
 * @param {Function} volverHandler - Callback para regresar al menú principal de combate.
 */
function mostrarHabilidades(enemigo, volverHandler) {
  let habilidades = [];
  switch (player.clase) {
    case "Mago":
      habilidades = [
        { label: "Bola de Fuego", handler: () => { usarHabilidad(0, enemigo); volverHandler(); } },
        { label: "Escudo Arcano", handler: () => { usarHabilidad(1, enemigo); volverHandler(); } },
        { label: "Rayo Congelante", handler: () => { usarHabilidad(2, enemigo); volverHandler(); } },
        { label: "Teletransporte", handler: () => { usarHabilidad(3, enemigo); volverHandler(); } }
      ];
      break;
    case "Guerrero":
      habilidades = [
        { label: "Golpe Poderoso", handler: () => { usarHabilidad(0, enemigo); volverHandler(); } },
        { label: "Defensa de Acero", handler: () => { usarHabilidad(1, enemigo); volverHandler(); } },
        { label: "Carga Brutal", handler: () => { usarHabilidad(2, enemigo); volverHandler(); } },
        { label: "Grito de Batalla", handler: () => { usarHabilidad(3, enemigo); volverHandler(); } }
      ];
      break;
    case "Arquero":
      habilidades = [
        { label: "Disparo Preciso", handler: () => { usarHabilidad(0, enemigo); volverHandler(); } },
        { label: "Lluvia de Flechas", handler: () => { usarHabilidad(1, enemigo); volverHandler(); } },
        { label: "Tiro al Corazón", handler: () => { usarHabilidad(2, enemigo); volverHandler(); } },
        { label: "Esquivar", handler: () => { usarHabilidad(3, enemigo); volverHandler(); } }
      ];
      break;
    case "Ladron":
      habilidades = [
        { label: "Ataque Sorpresa", handler: () => { usarHabilidad(0, enemigo); volverHandler(); } },
        { label: "Esquivar", handler: () => { usarHabilidad(1, enemigo); volverHandler(); } },
        { label: "Robo", handler: () => { usarHabilidad(2, enemigo); volverHandler(); } },
        { label: "Finta", handler: () => { usarHabilidad(3, enemigo); volverHandler(); } }
      ];
      break;
  }
  mostrarOpciones(habilidades);
}

/**
 * Genera un número entero aleatorio en el rango [min, max).
 * @param {number} min - Valor mínimo.
 * @param {number} max - Valor máximo.
 * @returns {number} Número aleatorio.
 */
function enteroRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Función que maneja la pelea por turnos entre el jugador y un enemigo.
 * Se utiliza setTimeout para evitar recursión profunda.
 * @param {Enemigo} enemigo - Enemigo a combatir.
 * @param {Function} volverHandler - Callback para continuar la historia.
 */
function peleaPorTurnos(enemigo, volverHandler) {
  actualizarHistoria(
    `¡Combate contra ${enemigo.nombre}!<br>Tus PV: ${player.pv}<br>PV Enemigo: ${enemigo.pv}`,
    false
  );

  mostrarOpciones([
    {
      label: "Atacar",
      handler: () => {
        disableOpciones();
        const dmgJugador = 10 + enteroRandom(0, 3);
        enemigo.pv -= dmgJugador;
        actualizarHistoria(`Atacas y causas ${dmgJugador} de daño.`);

        if (enemigo.pv <= 0) {
          actualizarHistoria(`¡Venciste a ${enemigo.nombre}! Ganás experiencia.`);
          player.puntaje += enemigo.dificultad * 10;
          guardarDatos("player", player);
          enemigos.shift();
          setTimeout(() => {
            mostrarOpciones([{ label: "Continuar", handler: volverHandler }]);
          }, 1200);
          return;
        }

        const dmgEnemigo = calcularDmgEnemigo(enemigo);
        player.pv -= dmgEnemigo;
        actualizarHistoria(`El ${enemigo.nombre} ataca y te inflige ${dmgEnemigo} de daño.<br>Tu PV: ${Math.max(player.pv, 0)}`);
        if (player.pv <= 0) {
          actualizarHistoria(`¡El ataque de ${enemigo.nombre} fue mortal! Fin de la aventura.`);
          Swal.fire({
            title: '¡Has perdido!',
            text: 'El enemigo te ha derrotado.',
            icon: 'error',
            confirmButtonText: 'Continuar'
          }).then(() => {
            finalizarJuego();
          });
          return;
        }

        setTimeout(() => {
          peleaPorTurnos(enemigo, volverHandler);
        }, 1500);
      }
    },
    {
      label: "Usar poción (si tenés)",
      handler: () => {
        disableOpciones();
        const pocion = player.inventario.find(i => i.nombre.includes("Poción"));
        if (!pocion) {
          actualizarHistoria("No tenés ninguna poción de vida.");
          setTimeout(() => {
            mostrarOpciones([{ label: "Volver", handler: () => setTimeout(() => peleaPorTurnos(enemigo, volverHandler), 0) }]);
          }, 1200);
          return;
        }
        pocion.cantidad -= 1;
        if (pocion.cantidad <= 0) {
          player.inventario = player.inventario.filter(i => i !== pocion);
        }
        player.pv += 50;
        if (player.pv > player.maxPv) {
          player.pv = player.maxPv;
        }
        guardarDatos("player", player);

        const dmgEnemigo = calcularDmgEnemigo(enemigo);
        player.pv -= dmgEnemigo;
        actualizarHistoria(`Mientras tomabas la poción, ${enemigo.nombre} te ataca por ${dmgEnemigo} de daño.<br>Tu PV: ${Math.max(player.pv, 0)}`);

        if (player.pv <= 0) {
          actualizarHistoria(`La poción no fue suficiente y caes en combate.<br>Fin de la aventura.`);
          Swal.fire({
            title: '¡Has perdido!',
            text: 'Te derrotó el enemigo.',
            icon: 'error',
            confirmButtonText: 'Continuar'
          }).then(() => {
            finalizarJuego();
          });
          return;
        }

        setTimeout(() => {
          peleaPorTurnos(enemigo, volverHandler);
        }, 1500);
      }
    },
    {
      label: "Usar habilidad",
      handler: () => {
        mostrarHabilidades(enemigo, () => {
          if (enemigo.pv <= 0) {
            actualizarHistoria(`¡Venciste a ${enemigo.nombre}! Ganás experiencia.`);
            player.puntaje += enemigo.dificultad * 10;
            guardarDatos("player", player);
            enemigos.shift();
            mostrarOpciones([{ label: "Continuar", handler: volverHandler }]);
            return;
          }
          const dmgEnemigo = calcularDmgEnemigo(enemigo);
          player.pv -= dmgEnemigo;
          actualizarHistoria(`El ${enemigo.nombre} aprovecha y te ataca por ${dmgEnemigo} de daño.<br>Tu PV: ${Math.max(player.pv, 0)}`);
          if (player.pv <= 0) {
            actualizarHistoria(`El ataque fue demasiado fuerte. Fin de la aventura.`);
            Swal.fire({
              title: '¡Has perdido!',
              text: 'El enemigo te derrotó.',
              icon: 'error',
              confirmButtonText: 'Continuar'
            }).then(() => {
              finalizarJuego();
            });
            return;
          }
          setTimeout(() => {
            peleaPorTurnos(enemigo, volverHandler);
          }, 1500);
        });
      }
    },
    {
      label: "Escapar",
      handler: () => {
        actualizarHistoria("Escapas del combate. ¿Qué harás ahora?");
        mostrarOpciones([{ label: "Volver", handler: volverHandler }]);
      }
    }
  ]);
}

/**
 * Calcula el daño que inflige un enemigo según su dificultad.
 * Puedes ajustar los coeficientes para equilibrar la curva de dificultad.
 * @param {Enemigo} enemigo        — Instancia del enemigo
 * @param {number} variacionPct    — Variación máxima porcentual (0–1) sobre el daño base
 * @returns {number}               — Daño final redondeado al entero
 */
function calcularDmgEnemigo(enemigo, variacionPct = 0.3) {
  // 1) Daño base proporcional a la dificultad
  const dmgBase = enemigo.dificultad * 3;
  // 2) Componente aleatorio: hasta ±variacionPct del dmgBase
  const maxVariacion = Math.floor(dmgBase * variacionPct);
  const variacion = enteroRandom(-maxVariacion, maxVariacion + 1);
  // 3) Bonus fijo de margen de error
  const bonusFijo = 5;

  const total = dmgBase + variacion + bonusFijo;
  // Asegurarse de que al menos haga 1 de daño
  return Math.max(1, total);
}

/**
 * Carga los enemigos de la historia principal desde un archivo JSON.
 * Solo se ejecuta una vez al inicio de la aventura.
 * @returns {Promise<void>}
 */
async function crearEnemigosHistoria() {
  // Si ya fueron creados, no se vuelven a cargar
  if (enemigos.length > 0) return;

  // Cargar todos los enemigos desde el JSON
  const todos = await cargarEnemigosJSON();

  // Filtrar solo los tres enemigos de la historia principal
  enemigos = todos.filter(e =>
    ["Slime", "Lobo", "Hada Maligna"].includes(e.nombre)
  );
}

/**
 * Carga enemigos adicionales desde el JSON y agrega uno aleatorio al array de enemigos.
 * Se utiliza una vez que se derrotaron los tres enemigos de la historia principal.
 * @returns {Promise<void>}
 */
async function crearEnemigoRandom() {
  const todos = await cargarEnemigosJSON();

  // Filtrar enemigos que no son los tres principales
  const pool = todos.filter(e =>
    !["Slime", "Lobo", "Hada Maligna"].includes(e.nombre)
  );

  if (pool.length === 0) return;

  // Seleccionar uno aleatorio y agregarlo al array de enemigos
  const idx = enteroRandom(0, pool.length);
  const elegido = pool[idx];
  enemigos.push(elegido);
}

/*******************************************
 * 4) Inventario
 *******************************************/

/**
 * Crea un objeto item.
 * @param {string} nombre - Nombre del item.
 * @param {string} tipo - Tipo del item.
 * @param {number} valor - Valor del item.
 * @param {number} cantidad - Cantidad (default 1).
 * @returns {Object} Objeto item.
 */
function crearItem(nombre, tipo, valor, cantidad = 1) {
  return { nombre, tipo, valor, cantidad };
}

/**
 * Crea un objeto arma.
 * @param {string} nombre - Nombre del arma.
 * @param {string} tipo - Tipo del arma.
 * @param {number} valor - Valor del arma.
 * @param {number} dmg - Daño del arma.
 * @param {number} atkps - Ataques por segundo.
 * @param {number} cantidad - Cantidad (default 1).
 * @returns {Object} Objeto arma.
 */
function crearArma(nombre, tipo, valor, dmg, atkps, cantidad = 1) {
  return { nombre, tipo, valor, dmg, atkps, cantidad };
}

/**
 * Agrega un item al inventario del jugador.
 * Si el item ya existe, incrementa su cantidad.
 * @param {Object} item - Item a agregar.
 */
function agregarItem(item) {
  const itemExistente = player.inventario.find(i => i.nombre === item.nombre);
  if (itemExistente) {
    itemExistente.cantidad += item.cantidad;
  } else {
    player.inventario.push(item);
  }
  guardarDatos("player", player);
}

/**
 * Muestra el inventario del jugador en el DOM.
 * @param {Function|null} volverHandler - Callback para volver.
 */
function mostrarInventario(volverHandler = null) {
  if (player.inventario.length === 0) {
    actualizarHistoria("No tenés nada en el inventario.", false);
    if (volverHandler) {
      mostrarOpciones([{ label: "Volver", handler: volverHandler }]);
    } else {
      mostrarOpciones([]);
    }
    return;
  }

  let mensaje = "Tu inventario:";
  player.inventario.forEach(obj => {
    mensaje += `<br> - ${obj.nombre} (Tipo: ${obj.tipo}, Cantidad: ${obj.cantidad})`;
  });
  actualizarHistoria(mensaje, false);

  if (volverHandler) {
    mostrarOpciones([{ label: "Volver", handler: volverHandler }]);
  } else {
    mostrarOpciones([]);
  }
}

/*******************************************
 * 5) Historia y Lógica del Juego
 *******************************************/

/**
 * Descarga la historia completa del usuario en un archivo de texto.
 */
function descargarHistoria() {
  const historiaCompleta = storyText.innerText;
  const blob = new Blob([historiaCompleta], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "historia.txt";
  a.click();
}

/**
 * Muestra una alerta al finalizar el juego para preguntar si se desea descargar la historia, y reinicia el juego.
 */
function finalizarJuego() {
  Swal.fire({
    title: 'Fin de la aventura',
    text: '¿Deseas descargar la historia de tu aventura?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Descargar',
    cancelButtonText: 'No, gracias'
  }).then((result) => {
    if (result.isConfirmed) {
      descargarHistoria();
    }
    reiniciarJuego();
  });
}

/**
 * Reinicia el juego borrando el progreso guardado y volviendo al inicio.
 * Se utiliza SweetAlert2 para notificar el reinicio.
 */
function reiniciarJuego() {
  localStorage.removeItem("player");
  player = null;
  enemigos = [];
  actualizarHistoria("Reiniciando juego...", true);
  setTimeout(() => {
    Swal.fire({
      title: '¡Juego Reiniciado!',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      historia();
    });
  }, 1200);
}

/**
 * Agrega el kit de bienvenida al jugador.
 * Se asegura de no agregarlo más de una vez.
 */
function agregarKitbienvenida() {
  let jugadorCargado = cargarDatos("player");
  if (!jugadorCargado) {
    jugadorCargado = player;
  }
  if (!jugadorCargado) {
    jugadorCargado = new Player("Default", "Mago");
  }

  if (jugadorCargado.kitEntregado) {
    player = jugadorCargado;
    return;
  }

  jugadorCargado.kitEntregado = true;
  jugadorCargado.inventario.push(
    crearItem("Poción de vida (+50💖)", "Pocion", 5, 3),
    crearItem("Mapa", "Mapa", 0, 1)
  );

  switch (jugadorCargado.clase) {
    case "Mago":
      jugadorCargado.inventario.push(crearArma("Báculo", "Magico", 15, 12, 0.5, 1));
      break;
    case "Guerrero":
      jugadorCargado.inventario.push(crearArma("Espada de Madera", "Melee", 15, 10, 0.8, 1));
      break;
    case "Ladron":
      jugadorCargado.inventario.push(crearArma("Daga", "Melee", 10, 7, 1.5, 1));
      break;
    case "Arquero":
      jugadorCargado.inventario.push(crearArma("Arco de Madera", "Rango", 12, 8, 1.2, 1));
      break;
    default:
      jugadorCargado.inventario.push(crearArma("Báculo", "Magico", 15, 12, 0.5, 1));
  }

  guardarDatos("player", jugadorCargado);
  player = jugadorCargado;
}

/**
 * Muestra las opciones de cazar monstruos y administra el flujo de combate.
 */
async function textoMonstruos() {
  actualizarHistoria("Como decidiste cazar monstruos, el gremio te otorgó un kit de bienvenida.", false);
  agregarKitbienvenida();
  actualizarStats();
  await crearEnemigosHistoria();
  mostrarOpciones([
    { label: "Mostrar Inventario", handler: () => mostrarInventario(() => textoMonstruos()) },
    { label: "Ir a la caza de monstruos", handler: () => cazarMonstruos() }
  ]);
}

/**
 * Inicia la caza de monstruos, creando enemigos si es necesario y llamando al combate.
 */
async function cazarMonstruos() {
  if (enemigos.length === 0) {
    await crearEnemigoRandom();
  }
  const enemigoActual = enemigos[0];
  if (!enemigoActual) {
    actualizarHistoria("No hay enemigos disponibles. ¡Has acabado con todos!", false);
    mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
    return;
  }

  actualizarHistoria(
    `Te preparás para enfrentarte a ${enemigoActual.nombre} (dificultad ${enemigoActual.dificultad}).<br>¡Que comience la batalla!`,
    false
  );

  mostrarOpciones([
    {
      label: "Empezar combate",
      handler: () => {
        peleaPorTurnos(enemigoActual, () => {
          if (enemigos.length === 0) {
            crearEnemigoRandom();
          }
          cazarMonstruos();
        });
      }
    },
    { label: "Mostrar Inventario", handler: () => mostrarInventario(() => cazarMonstruos()) }
  ]);
}

/**
 * Simula ir al gremio de aventureros y muestra una misión aleatoria
 * cargada desde js/misiones.js con control de errores.
 */
async function irAlGremio() {
  actualizarHistoria(
    "Vas al gremio de aventureros siguiendo el mapa que te dio el Alcalde.<br>" +
    "Dentro, el ambiente se llena de murmullos de guerreros, magos y aventureros de todo tipo..."
  );
  player.puntaje += 5;
  guardarDatos("player", player);

  // Carga del módulo misiones.js
  const mod = await importConControl('./misiones.js');
  if (!mod) return; // Si hubo error muestra con SweetAlert
  const mision = mod.obtenerMision();

  mostrarOpciones([
    {
      label: "Hablar con la recepcionista",
      handler: () => {
        actualizarHistoria(
          `Recepcionista:<br>Bienvenido al Gremio de Aventureros. Tablón de misiones: "<strong>${mision.titulo}</strong> - ${mision.descripcion}".`
        );
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([
          {
            label: "Aceptar misión",
            handler: () => {
              actualizarHistoria("Elegís una misión de matar monstruos y te preparás para cumplirla.");
              player.puntaje += 5;
              guardarDatos("player", player);
              mostrarOpciones([{ label: "Continuar", handler: () => textoMonstruos() }]);
            }
          },
          { label: "Volver", handler: () => siguientePasoGremio() }
        ]);
      }
    },
    {
      label: "Explorar la sala",
      handler: () => {
        actualizarHistoria(
          "Observás a varios aventureros compartiendo historias de batallas.<br>" +
          "Ves un tablón con misiones y un mostrador de equipo. Quizás debas volver más adelante para equiparte mejor."
        );
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([{ label: "Hablar con la recepcionista de vuelta", handler: () => irAlGremio() }]);
      }
    },
    {
      label: "Ir a cazar monstruos",
      handler: () => {
        actualizarHistoria("Te preparás para cazar monstruos en las afueras del pueblo...", true);
        player.puntaje += 5;
        guardarDatos("player", player);
        mostrarOpciones([{ label: "Continuar", handler: () => textoMonstruos() }]);
      }
    },
    {
      label: "Regresar a la aldea",
      handler: () => {
        actualizarHistoria("Decidís volver a la aldea por el momento.", true);
        mostrarOpciones([
          { label: "Volver", handler: () => siguientePasoAldea() },
          { label: "Hablar con la recepcionista", handler: () => irAlGremio() }
        ]);
      }
    }
  ]);
}

/**
 * Cierra la historia de la aldea o expande el lore.
 */
function siguientePasoAldea() {
  actualizarHistoria(
    "El Alcalde te sugiere ir al gremio de aventureros.<br>" +
    "¿Qué querés hacer?<br><br>" +
    "1. Ir al gremio de aventureros.<br>" +
    "2. Explorar la aldea un poco más.<br>" +
    "3. Finalizar la aventura.",
    true
  );

  mostrarOpciones([
    { label: "Ir al gremio", handler: () => irAlGremio() },
    {
      label: "Explorar la aldea",
      handler: () => {
        actualizarHistoria("Decidís explorar la aldea. Conoces nuevos rostros y escuchas historias locales.");
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([]);
      }
    },
    {
      label: "Finalizar",
      handler: () => {
        actualizarHistoria(`Te alejás de la aldea y das por terminada tu aventura.<br>Gracias por jugar, ${player.nombre}!`, true);
        mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
      }
    }
  ]);
}

/**
 * Permite hablar con el Alcalde.
 */
function hablarConElAlcalde() {
  actualizarHistoria(
    `Alcalde:<br>Hola ${player.nombre}, me dijeron que perdiste la memoria.<br>` +
    "Quizás deberías ir al gremio de aventureros para ver si tienen un registro tuyo.<br>" +
    "Aquí tienes un mapa de la ciudad."
  );
  player.puntaje += 5;
  guardarDatos("player", player);

  mostrarOpciones([
    { label: "Ir al gremio", handler: () => irAlGremio() },
    {
      label: "Explorar la aldea",
      handler: () => {
        actualizarHistoria("Decidiste explorar la aldea un poco más antes de ir al gremio.");
        mostrarOpciones([
          { label: "Explorar la aldea", handler: () => siguientePasoAldea() },
          { label: "Hablar con el alcalde", handler: () => hablarConElAlcalde() }
        ]);
      }
    }
  ]);
}

/**
 * Desarrolla el lore de la aldea a través de la interacción con un aldeano.
 */
function loreAldea() {
  actualizarHistoria(
    `Aldeano:<br>¡Hola! ¿Quién sos vos?<br><br>` +
    `1. "Hola, soy ${player.nombre}. Soy un ${player.clase} aventurero en busca de mi pasado."<br>` +
    '2. "No es asunto tuyo."',
    false
  );

  mostrarOpciones([
    {
      label: "Opción 1",
      handler: () => {
        actualizarHistoria("Aldeano:<br>¿En serio? Deberías hablar con el Alcalde, él sabe todo lo que pasa acá.");
        player.puntaje += 5;
        guardarDatos("player", player);
        mostrarOpciones([
          { label: "Ir con el Alcalde", handler: () => hablarConElAlcalde() },
          {
            label: "Más tarde",
            handler: () => {
              actualizarHistoria("Decidiste no hablar con el Alcalde por ahora.");
              mostrarOpciones([
                { label: "Explorar la aldea", handler: () => siguientePasoAldea() },
                { label: "Hablar con el alcalde", handler: () => hablarConElAlcalde() }
              ]);
            }
          }
        ]);
      }
    },
    {
      label: "Opción 2",
      handler: () => {
        actualizarHistoria("Aldeano:<br>¡Entonces no me hagas perder el tiempo! Andate ya.");
        player.puntaje -= 3;
        guardarDatos("player", player);
        mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
      }
    }
  ]);
}

/**
 * Interacción inicial con un aldeano en la aldea.
 */
function interaccionConAldeano() {
  actualizarHistoria("Decidís dar una vuelta por la aldea y te encontrás con un aldeano. ¿Querés hablar o ignorarlo?", false);
  mostrarOpciones([
    { label: "Hablar con él", handler: () => loreAldea() },
    { label: "Ignorarlo", handler: () => {
        actualizarHistoria("No está bueno aislarse. Pensalo de nuevo.");
        mostrarOpciones([{ label: "Volver", handler: () => interaccionConAldeano() }]);
      }
    }
  ]);
}

/**
 * Pide al usuario que ingrese su nombre y permita elegir la clase.
 */
function nombreYClase() {
  actualizarHistoria("Para continuar, ingresa tu nombre (no lo podrás cambiar después).", false);
  choicesDiv.innerHTML = "";
  choicesDiv.classList.add("two-rows");

  const entradaNombre = document.createElement("input");
  entradaNombre.type = "text";
  entradaNombre.placeholder = "Ingresa tu nombre";
  entradaNombre.classList.add("form-control", "mb-2");
  choicesDiv.appendChild(entradaNombre);

  const btnOk = document.createElement("button");
  btnOk.innerText = "OK";
  btnOk.classList.add("btn", "btn-success", "m-1");
  btnOk.addEventListener("click", () => {
    const nombreIngresado = entradaNombre.value.trim();
    if (!nombreIngresado) {
      actualizarHistoria("❌ Ingresá un nombre válido.", false);
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }]);
      return;
    }
    if (nombreIngresado.length < 2) {
      actualizarHistoria("❌ El nombre debe tener al menos 2 caracteres.", false);
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }]);
      return;
    }
    if (nombreIngresado.length > 15) {
      actualizarHistoria("❌ El nombre no puede superar los 15 caracteres.", false);
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }]);
      return;
    }
    elegirClase(nombreIngresado);
  });
  choicesDiv.appendChild(btnOk);
}

/**
 * Permite al usuario elegir la clase del personaje.
 * @param {string} nombreIngresado - Nombre ingresado.
 */
function elegirClase(nombreIngresado) {
  actualizarHistoria("Elige una clase:<br>1. 🧙‍♂️ Mago<br>2. 🦝 Ladrón<br>3. 🏹 Arquero<br>4. 🛡️ Guerrero", false);

  mostrarOpciones([
    { label: "Mago", handler: () => { player = new Player(nombreIngresado, "Mago"); guardarDatos("player", player); interaccionConAldeano(); } },
    { label: "Ladrón", handler: () => { player = new Player(nombreIngresado, "Ladron"); guardarDatos("player", player); interaccionConAldeano(); } },
    { label: "Arquero", handler: () => { player = new Player(nombreIngresado, "Arquero"); guardarDatos("player", player); interaccionConAldeano(); } },
    { label: "Guerrero", handler: () => { player = new Player(nombreIngresado, "Guerrero"); guardarDatos("player", player); interaccionConAldeano(); } }
  ]);
}

/**
 * Función principal que inicia la historia.
 */
function historia() {
  const jugadorGuardado = cargarDatos("player");
  if (jugadorGuardado) {
    player = jugadorGuardado;
    actualizarStats();
    actualizarHistoria(`Bienvenido de nuevo, ${player.nombre}.<br>Continuás tu aventura...`, false);
    setTimeout(() => { textoMonstruos(); }, 2000);
  } else {
    actualizarHistoria(
      "Sos un aventurero que despertó en una pequeña aldea en las afueras del reino de Aurora.<br>" +
      "Nadie sabe de dónde venís ni nada de tu pasado.<br>" +
      "Llevás una bolsa con algunas monedas y un mapa que señala un castillo en ruinas.<br><br>" +
      "¿Deseás comenzar la historia?",
      false
    );
    mostrarOpciones([
      { label: "Aceptar", handler: () => nombreYClase() },
      { label: "Playground", handler: () => {
          actualizarHistoria(
            "Decidiste cazar monstruos en las afueras del pueblo...<br>" +
            "⚔️ Tu clase será: Mago<br>" +
            "📝 Tu nombre será: Playground",
            false
          );
          player = new Player("Playground", "Mago");
          guardarDatos("player", player);
          setTimeout(() => { textoMonstruos(); }, 2000);
        }
      }
    ]);
  }
}

// Guarda automáticamente el progreso antes de abandonar la pestaña
window.addEventListener("beforeunload", () => {
  if (player) {
    guardarDatos("player", player);
  }
});

// Función asíncrona que usa fetch para obtener detalles remotos de misión.
async function obtenerDetalleMision() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    return data.title; // Se usa el título del post como detalle de misión.
  } catch (error) {
    await Swal.fire({
      title: 'Error al obtener misión',
      text: 'No se pudo cargar el detalle de la misión.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
    return "Detalle de misión no disponible.";
  }
}

/**
 * Importa dinámicamente un módulo y devuelve su objeto.
 * Muestra SweetAlert2 si hay algun error.
 * @param {string} path — Ruta al módulo.
 * @returns {Promise<Module|null>}
 */
async function importConControl(path) {
  try {
    return await import(path);
  } catch (err) {
    Swal.fire({
      title: 'Error al cargar módulo',
      text: err.message,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
    return null;
  }
}

/**
 * Carga el JSON de enemigos y devuelve las instancias de Enemigo.
 * Muestra SweetAlert2 si hay algun error.
 */
async function cargarEnemigosJSON() {
  try {
    const res = await fetch("js/enemigos.json");
    if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
    const lista = await res.json();
    return lista.map(e =>
      new Enemigo(e.nombre, e.tipo, e.clase, e.dificultad, e.habilidades, e.pv)
    );
  } catch (err) {
    Swal.fire({
      title: 'Error al cargar enemigos',
      text: err.message,
      icon: 'error'
    });
    return [];
  }
}

// Inicia la historia
historia();

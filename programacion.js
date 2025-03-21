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
 * Actualiza el texto de la historia en el DOM.
 * @param {string} text - Texto a mostrar.
 */
function actualizarHistoria(text) {
  storyText.innerText = text;
}

/**
 * Actualiza la pestaña de estadísticas con los datos actuales del jugador,
 * incluyendo el inventario en forma de lista vertical.
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
    `;
  }
}

/**
 * Muestra opciones como botones en el contenedor de choices.
 * Utiliza DocumentFragment para minimizar repintados.
 * @param {Array} choices - Array de objetos con propiedades label y handler.
 * @param {boolean} fullWidth - Indica si se muestra un solo botón ancho.
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
 * Guarda datos en LocalStorage y actualiza las estadísticas.
 * @param {string} key - Clave para almacenar el dato.
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
    console.error("Error al cargar datos:", error);
    return null;
  }
}

/*******************************************
 * 3) Funciones útiles y de Creación de Enemigos
 *******************************************/

/**
 * Ejecuta la habilidad correspondiente según la clase del jugador.
 * @param {number} habilidadIndex - Índice de la habilidad a ejecutar (0 a 3).
 * @param {Enemigo} enemigo - Enemigo actual del combate.
 */
function usarHabilidad(habilidadIndex, enemigo) {
  switch (player.clase) {
    case "Mago":
      switch (habilidadIndex) {
        case 0: {
          // Bola de Fuego
          const dmg = 20 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Lanzas una Bola de Fuego causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          // Escudo Arcano
          const bonus = 10;
          player.armadura += bonus;
          actualizarHistoria(`Activas un Escudo Arcano y aumentas tu armadura en ${bonus}.`);
          break;
        }
        case 2: {
          // Rayo Congelante
          const dmg = 15 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Lanzas un Rayo Congelante causando ${dmg} de daño y congelas al enemigo.`);
          break;
        }
        case 3: {
          // Teletransporte
          actualizarHistoria(`Te teletransportas, esquivando el próximo ataque enemigo.`);
          break;
        }
      }
      break;
    case "Guerrero":
      switch (habilidadIndex) {
        case 0: {
          // Golpe Poderoso
          const dmg = 25 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Golpe Poderoso causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          // Defensa de Acero
          player.armadura += 15;
          actualizarHistoria(`Activaste Defensa de Acero y aumentas tu armadura en 15.`);
          break;
        }
        case 2: {
          // Carga Brutal
          const dmg = 20 + enteroRandom(0, 10);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas una Carga Brutal causando ${dmg} de daño.`);
          break;
        }
        case 3: {
          // Grito de Batalla
          player.puntaje += 10;
          actualizarHistoria(`Emites un Grito de Batalla y ganas 10 puntos de puntaje.`);
          break;
        }
      }
      break;
    case "Arquero":
      switch (habilidadIndex) {
        case 0: {
          // Disparo Preciso
          const dmg = 18 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Disparas con precisión causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          // Lluvia de Flechas
          const dmg = 12 + enteroRandom(0, 8);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas una Lluvia de Flechas causando ${dmg} de daño.`);
          break;
        }
        case 2: {
          // Tiro al Corazón
          const dmg = 30;
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Tiro al Corazón causando ${dmg} de daño crítico.`);
          break;
        }
        case 3: {
          // Esquivar
          actualizarHistoria(`Te preparas para esquivar, aumentando tu probabilidad de evadir el próximo ataque.`);
          break;
        }
      }
      break;
    case "Ladron":
      switch (habilidadIndex) {
        case 0: {
          // Ataque Sorpresa
          const dmg = 20 + enteroRandom(0, 5);
          enemigo.pv -= dmg;
          actualizarHistoria(`Realizas un Ataque Sorpresa causando ${dmg} de daño.`);
          break;
        }
        case 1: {
          // Esquivar
          actualizarHistoria(`Activas tu habilidad de Esquivar, incrementando tu evasión.`);
          break;
        }
        case 2: {
          // Robo
          actualizarHistoria(`Intentas robar al enemigo. Si tienes éxito, podrías obtener un objeto.`);
          break;
        }
        case 3: {
          // Finta
          actualizarHistoria(`Realizas una Finta para confundir al enemigo, reduciendo su precisión.`);
          break;
        }
      }
      break;
  }
  // Guarda el estado actualizado del jugador
  guardarDatos("player", player);
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
 * Crea los enemigos iniciales de la historia.
 */
function crearEnemigosHistoria() {
  const enemigo1 = new Enemigo("Slime", "Monstruo", "Slime", 1, [], 50);
  const enemigo2 = new Enemigo("Lobo", "Monstruo", "Lobo", 2, [], 70);
  const enemigo3 = new Enemigo("Hada Maligna", "Monstruo", "Hada", 3, [], 80);

  enemigos.push(enemigo1, enemigo2, enemigo3);
}

/**
 * Función que maneja la pelea por turnos entre el jugador y un enemigo.
 * Se evita la recursión profunda utilizando setTimeout para delegar en el event loop.
 * @param {Enemigo} enemigo - Enemigo a combatir.
 * @param {Function} volverHandler - Callback para continuar la historia.
 */
function peleaPorTurnos(enemigo, volverHandler) {
  actualizarHistoria(
    `¡Combate contra ${enemigo.nombre}!\n` +
    `Tus PV: ${player.pv}\n` +
    `PV Enemigo: ${enemigo.pv}`
  );

  mostrarOpciones([
    {
      label: "Atacar",
      handler: () => {
        // Ataque básico del jugador
        const dmgJugador = 10 + enteroRandom(0, 3);
        enemigo.pv -= dmgJugador;

        if (enemigo.pv <= 0) {
          actualizarHistoria(
            `¡Venciste a ${enemigo.nombre}!\nGanás algo de experiencia...`
          );
          player.puntaje += enemigo.dificultad * 10;
          guardarDatos("player", player);
          // Remueve el enemigo vencido
          enemigos.shift();
          mostrarOpciones([{ label: "Continuar", handler: volverHandler }]);
          return;
        }

        // Ataque del enemigo
        const dmgEnemigo = 5 + enteroRandom(0, enemigo.dificultad * 2);
        player.pv -= dmgEnemigo;

        if (player.pv <= 0) {
          actualizarHistoria(
            `¡${enemigo.nombre} te ha derrotado! Tus PV han llegado a 0.\nFin de la aventura.`
          );
          mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
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
        const pocion = player.inventario.find(i => i.nombre.includes("Poción"));
        if (!pocion) {
          actualizarHistoria("No tenés ninguna poción de vida.");
          mostrarOpciones([
            { label: "Volver", handler: () => setTimeout(() => peleaPorTurnos(enemigo, volverHandler), 0) }
          ], true);
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

        const dmgEnemigo = 5 + enteroRandom(0, enemigo.dificultad * 2);
        player.pv -= dmgEnemigo;

        actualizarHistoria(
          `El ${enemigo.nombre} te ataca e inflige ${dmgEnemigo} de daño.\n` +
          `Tu PV actual: ${Math.max(player.pv, 0)}`
        );

        if (player.pv <= 0) {
          actualizarHistoria(
            `Mientras tomabas la poción, el ${enemigo.nombre} te golpeó y te dejó en 0 PV.\nFin de la aventura.`
          );
          mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
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
            actualizarHistoria(
              `¡Venciste a ${enemigo.nombre}!\nGanás algo de experiencia...`
            );
            player.puntaje += enemigo.dificultad * 10;
            guardarDatos("player", player);
            enemigos.shift();
            mostrarOpciones([{ label: "Continuar", handler: volverHandler }]);
            return;
          }
          const dmgEnemigo = 5 + enteroRandom(0, enemigo.dificultad * 2);
          player.pv -= dmgEnemigo;
          actualizarHistoria(
            `El ${enemigo.nombre} aprovecha para atacar y te inflige ${dmgEnemigo} de daño.\n` +
            `Tu PV actual: ${Math.max(player.pv, 0)}`
          );
          if (player.pv <= 0) {
            actualizarHistoria(
              `El ataque del ${enemigo.nombre} fue demasiado fuerte y quedaste en 0 PV.\nFin de la aventura.`
            );
            mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
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
        actualizarHistoria("Escapaste del combate. ¿Qué vas a hacer ahora?");
        mostrarOpciones([{ label: "Volver", handler: volverHandler }], true);
      }
    }
  ]);
}

/**
 * Crea un enemigo aleatorio y lo agrega al array de enemigos.
 */
function crearEnemigoRandom() {
  const nombres = ["Orco", "Zombi", "Esqueleto", "Gigante", "Dragón"];
  const index = enteroRandom(0, nombres.length);
  const nombre = nombres[index];
  const dificultad = 3 + enteroRandom(1, 5);
  const pv = 100 + dificultad * 10;

  const enemigo = new Enemigo(nombre, "Monstruo", nombre, dificultad, [], pv);
  enemigos.push(enemigo);
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
    actualizarHistoria("No tenés nada en el inventario.");
    if (volverHandler) {
      mostrarOpciones([{ label: "Volver", handler: volverHandler }]);
    } else {
      mostrarOpciones([]);
    }
    return;
  }

  let mensaje = "Tu inventario:\n";
  player.inventario.forEach(obj => {
    mensaje += `- ${obj.nombre} (Tipo: ${obj.tipo}, Cantidad: ${obj.cantidad})\n`;
  });
  actualizarHistoria(mensaje);

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
 * Reinicia el juego borrando el progreso guardado y volviendo al inicio.
 */
function reiniciarJuego() {
  localStorage.removeItem("player");
  player = null;
  enemigos = [];
  historia();
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
function textoMonstruos() {
  actualizarHistoria("Como decidiste cazar monstruos, el gremio te dio un kit de bienvenida.\n");
  agregarKitbienvenida();
  actualizarStats();
  mostrarOpciones([
    { label: "Mostrar Inventario", handler: () => mostrarInventario(() => textoMonstruos()) },
    { label: "Ir a la caza de monstruos", handler: () => cazarMonstruos() }
  ]);
}

/**
 * Inicia la caza de monstruos, creando enemigos si es necesario y llamando al combate.
 */
function cazarMonstruos() {
  if (enemigos.length === 0) {
    crearEnemigosHistoria();
  }
  if (enemigos.length === 0) {
    crearEnemigoRandom();
  }
  const enemigoActual = enemigos[0];
  if (!enemigoActual) {
    actualizarHistoria("No hay enemigos disponibles. ¡Has acabado con todos!");
    mostrarOpciones([{ label: "Reiniciar", handler: reiniciarJuego }]);
    return;
  }

  actualizarHistoria(
    `Te preparás para enfrentarte a ${enemigoActual.nombre} (dificultad ${enemigoActual.dificultad}).\n¡Que comience la batalla!`
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
 * Simula ir al gremio de aventureros.
 */
function irAlGremio() {
  actualizarHistoria(
    "Vas al gremio de aventureros siguiendo el mapa que te dio el Alcalde.\n" +
    "Es un edificio grande con un cartel de una espada y un escudo cruzados.\n" +
    "Adentro se escuchan murmullos de guerreros, magos y gente de todo tipo..."
  );
  player.puntaje += 5;
  guardarDatos("player", player);

  mostrarOpciones([
    {
      label: "Hablar con la recepcionista",
      handler: () => {
        actualizarHistoria(
          "Recepcionista:\nBienvenido al Gremio de Aventureros. Si buscás información sobre tu pasado, " +
          "capaz que encuentres algo en nuestros registros, o también podrías agarrar misiones para ganar plata."
        );
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([
          {
            label: "Buscar misiones",
            handler: () => {
              actualizarHistoria("La recepcionista te muestra un tablón con misiones disponibles.");
              mostrarOpciones([
                {
                  label: "Aceptar una misión",
                  handler: () => {
                    actualizarHistoria("Elegís una misión de matar monstruos y te preparás para salir a cumplirla.");
                    player.puntaje += 5;
                    guardarDatos("player", player);
                    mostrarOpciones([{ label: "Continuar", handler: () => textoMonstruos() }]);
                  }
                },
                { label: "Volver", handler: () => siguientePasoGremio() }
              ]);
            }
          }
        ]);
      }
    },
    {
      label: "Explorar la sala",
      handler: () => {
        actualizarHistoria(
          "Observás a varios aventureros de distintas clases compartiendo historias de batallas.\n" +
          "Ves un tablón de misiones con carteles de recompensas y un mostrador donde venden equipo.\n" +
          "Quizás deberías volver más adelante para equiparte mejor."
        );
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([{ label: "Hablar con la recepcionista de vuelta.", handler: () => irAlGremio() }]);
      }
    },
    {
      label: "Ir a cazar monstruos",
      handler: () => {
        actualizarHistoria("Te preparás para cazar monstruos en las afueras del pueblo...");
        player.puntaje += 5;
        guardarDatos("player", player);
        mostrarOpciones([{ label: "Continuar", handler: () => textoMonstruos() }]);
      }
    },
    {
      label: "Regresar a la aldea",
      handler: () => {
        actualizarHistoria("Decidís volver a la aldea por el momento.");
        mostrarOpciones([
          { label: "Volver", handler: () => siguientePasoAldea() },
          { label: "Hablar con la recepcionista de vuelta.", handler: () => irAlGremio() }
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
    "El Alcalde te sugiere ir al gremio de aventureros.\n" +
    "¿Qué querés hacer?\n\n" +
    "1. Ir al gremio de aventureros.\n" +
    "2. Explorar la aldea un poco más.\n" +
    "3. Finalizar la aventura."
  );

  mostrarOpciones([
    { label: "Ir al gremio", handler: () => irAlGremio() },
    {
      label: "Explorar la aldea",
      handler: () => {
        actualizarHistoria(
          "Decidís explorar la aldea un rato más. Te cruzás con varios aldeanos que te saludan amablemente."
        );
        player.puntaje += 2;
        guardarDatos("player", player);
        mostrarOpciones([]);
      }
    },
    {
      label: "Finalizar",
      handler: () => {
        actualizarHistoria(
          `Te alejás de la aldea y das por terminada tu aventura.\n` +
          `Hasta acá llega la historia por el momento. Gracias por haber jugado ${player.nombre}!`
        );
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
    "Alcalde:\n" +
    `Hola ${player.nombre}, me contaron que perdiste la memoria.\n` +
    "Por acá nunca te habíamos visto antes, pero no sos el primero en aparecer sin recuerdos.\n\n" +
    "Creo que deberías ir al gremio de aventureros para ver si tienen un registro tuyo. " +
    "Ellos anotan a todos los que pasan por esta región.\n" +
    "Te dejo un mapa de la ciudad para que puedas ir sin problema."
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
          { label: "Hablar con el alcalde de vuelta.", handler: () => hablarConElAlcalde() }
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
    "Aldeano:\n¡Hola! ¿Quién sos vos? No te había visto antes por acá.\n\n" +
    `1. "Hola, soy ${player.nombre}. Soy un ${player.clase} aventurero y estoy en busca de mi pasado."\n` +
    '2. "No es asunto tuyo."'
  );

  mostrarOpciones([
    {
      label: "Opción 1",
      handler: () => {
        actualizarHistoria(
          "Aldeano:\n¿En serio? Deberías hablar con el Alcalde, es muy sabio. " +
          "Él sabe todo lo que pasa por acá y seguramente te pueda ayudar."
        );
        player.puntaje += 5;
        guardarDatos("player", player);
        mostrarOpciones([
          { label: "Ir con el Alcalde", handler: () => hablarConElAlcalde() },
          { label: "Más tarde", handler: () => {
              actualizarHistoria("Decidiste no hablar con el Alcalde por el momento.");
              mostrarOpciones([
                { label: "Explorar la aldea", handler: () => siguientePasoAldea() },
                { label: "Hablar con el alcalde.", handler: () => hablarConElAlcalde() }
              ]);
            }
          }
        ]);
      }
    },
    {
      label: "Opción 2",
      handler: () => {
        actualizarHistoria("Aldeano:\n¡Ah bueno! Entonces no me hagas perder más el tiempo. Andate de acá.");
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
  actualizarHistoria(
    "Decidís ir a dar una vuelta por la aldea y te encontrás con un aldeano.\n" +
    "¿Querés hablar con él o ignorarlo?"
  );

  mostrarOpciones([
    { label: "Hablar con él", handler: () => loreAldea() },
    { label: "Ignorarlo", handler: () => {
        actualizarHistoria("No está bueno aislarse. Pensalo de nuevo.");
        mostrarOpciones([{ label: "Volver", handler: () => interaccionConAldeano() }], true);
      }
    }
  ]);
}

/**
 * Pide al usuario que ingrese su nombre y permite elegir la clase.
 */
function nombreYClase() {
  actualizarHistoria(
    "Para continuar, elige tu nombre:\nTené en cuenta que no vas a poder cambiarlo después."
  );

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
      actualizarHistoria("❌ Ingresá un nombre válido.");
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }], true);
      return;
    }
    if (nombreIngresado.length < 2) {
      actualizarHistoria("❌ El nombre debe tener al menos 2 caracteres.");
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }], true);
      return;
    }
    if (nombreIngresado.length > 15) {
      actualizarHistoria("❌ El nombre no puede superar los 15 caracteres.");
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }], true);
      return;
    }
    elegirClase(nombreIngresado);
  });

  choicesDiv.appendChild(btnOk);
}

/**
 * Permite al usuario elegir la clase del personaje.
 * @param {string} nombreIngresado - Nombre ingresado por el usuario.
 */
function elegirClase(nombreIngresado) {
  actualizarHistoria("Elige una clase:\n1. 🧙‍♂️ Mago\n2. 🦝 Ladrón\n3. 🏹 Arquero\n4. 🛡️ Guerrero");

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
  // Al cargar la página se revisa si existe un jugador guardado para continuar la partida
  const jugadorGuardado = cargarDatos("player");
  if (jugadorGuardado) {
    player = jugadorGuardado;
    actualizarStats();
    actualizarHistoria(`Bienvenido de nuevo, ${player.nombre}.\nContinuás tu aventura...`);
    setTimeout(() => textoMonstruos(), 2000);
  } else {
    actualizarHistoria(
      "Sos un aventurero que despertó en una pequeña aldea en las afueras del reino de Aurora.\n" +
      "Nadie sabe de dónde venís ni nada de tu pasado.\n" +
      "Llevás una bolsa con algunas monedas y un mapa que señala un castillo en ruinas.\n\n" +
      "¿Deseás comenzar la historia?"
    );

    mostrarOpciones([
      { label: "Aceptar", handler: () => nombreYClase() },
      { label: "Playground", handler: () => {
          mostrarOpciones([]);
          actualizarHistoria(
            "Decidiste ir a cazar monstruos en las afueras del pueblo...\n\n" +
            "⚔️ Tu clase será: Mago\n" +
            "📝 Tu nombre será: Playground"
          );
          player = new Player("Playground", "Mago");
          guardarDatos("player", player);
          setTimeout(() => textoMonstruos(), 2000);
        }
      }
    ]);
  }
}

// Guarda automáticamente el progreso cuando se cierra la pestaña
window.addEventListener("beforeunload", () => {
  if (player) {
    guardarDatos("player", player);
  }
});

// Inicia la historia
historia();

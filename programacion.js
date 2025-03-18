/*******************************************
 * 1) Clases y Variables Globales
 *******************************************/
class Player {
  constructor(nombre, clase) {
    this.nombre = nombre;
    this.clase = clase;
    this.armadura = 0;
    this.ataque = 0;
    this.nivel = 1;
    this.puntaje = 0;
    this.inventario = [];

    switch(clase) {
      case "Mago":
        this.pv = 100;
        break
      case "Ladron":
        this.pv = 80;
        break
      case "Arquero":
        this.pv = 90;
        break
      case "Guerrero":
        this.pv = 120;
        break
      default:
        this.pv = 80;
    }

    this.maxPv = this.pv + 5;
  }

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

class Enemigo {
  constructor(nombre, tipo, clase, dificultad, habilidades = [], pv) {
    this.nombre = nombre;
    this.tipo = tipo;
    this.clase = clase;
    this.dificultad = dificultad;
    this.habilidades = habilidades;
    this.pv = pv
  }
}

// Variable global para almacenar la instancia del jugador
let player;

// Array para almacenar múltiples enemigos creados
let enemigos = [];

// Referencias al DOM
const storyText = document.getElementById("story-text");
const choicesDiv = document.getElementById("choices");

/*******************************************
 * Funciones para el DOM
 *******************************************/

// Muestra el texto en el div #story-text
function actualizarHistoria(text) {
  storyText.innerText = text;
}

// Muestra botones en #choices
// Recibe un array de objetos: [{ label: "Texto", handler: () => {...} }, ...]
// Y un segundo parámetro (fullWidth) para indicar si se muestra un solo botón ancho
function mostrarOpciones(choices, fullWidth = false) {

  // Elimina 'two-rows' por si ya estaba activa
  choicesDiv.classList.remove("two-rows");

  // Si queremos un solo botón a lo ancho, activamos single-button
  if (fullWidth) {
    choicesDiv.classList.add("single-button");
  } else {
    choicesDiv.classList.remove("single-button");
  }

  choicesDiv.innerHTML = ""; // Limpia las opciones anteriores

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.classList.add("btn", "btn-primary", "m-1");
    btn.addEventListener("click", choice.handler);
    choicesDiv.appendChild(btn);
  });
}

// Guarda datos en LocalStorage
function guardarDatos(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Carga datos de LocalStorage
function cargarDatos(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/*******************************************
 * 2) Funciones de Creación de Enemigos
 *******************************************/

/* Enemigos de más fuertes a más débiles:
 *  - Dragón
 *  - Demonio
 *  - Gigante
 *  - Orco
 *  - Zombi
 *  - Esqueleto {Con clases: Guerrero, Arquero, Mago}
 *  - Hada Maligna
 *  - Lobo
 *  - Slime 
 */

// Función que genera un número random entre un rango
function enteroRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/* La idea de la funcion crearEnemigosHistoria es en base a un orden fijo:
 * 1) Slime
 * 2) Lobo
 * 3) Hada Maligna
 * Después, se entra a un “playground” de enemigos random.
 */

function crearEnemigosHistoria() {
  // Slime, Lobo, Hada Maligna (dificultad 1,2,3)
  const enemigo1 = new Enemigo("Slime", "Monstruo", "Slime", 1, [], 50);
  const enemigo2 = new Enemigo("Lobo", "Monstruo", "Lobo", 2, [], 70);
  const enemigo3 = new Enemigo("Hada Maligna", "Monstruo", "Hada", 3, [], 80);

  enemigos.push(enemigo1, enemigo2, enemigo3);
}

/**
 * Función que maneja la pelea por turnos entre player y un enemigo
 */

function peleaPorTurnos(enemigo, volverHandler) {
  // Mostramos estado actual
  actualizarHistoria(
    `¡Combate contra ${enemigo.nombre}!\n` +
    `Tus PV: ${player.pv}\n` +
    `PV Enemigo: ${enemigo.pv}`
  );

  // Opciones de combate
  mostrarOpciones([
    {
      label: "Atacar",
      handler: () => {
        // Daño básico: el jugador hace 10 + algo random
        let dmgJugador = 10 + enteroRandom(0, 3);
        enemigo.pv -= dmgJugador;

        if (enemigo.pv <= 0) {
          // El enemigo muere
          actualizarHistoria(
            `¡Venciste a ${enemigo.nombre}!\nGanás algo de experiencia...`
          );
          player.puntaje += enemigo.dificultad * 10;
          guardarDatos("player", player);

          // Borramos el enemigo de la lista
          enemigos.shift(); // si el primer enemigo es el actual
          // Podés llevar la historia a la siguiente fase
          mostrarOpciones([{ label: "Continuar", handler: volverHandler }]);
          return;
        }

        // Si el enemigo no muere, ataca al jugador
        let dmgEnemigo = 5 + enteroRandom(0, enemigo.dificultad * 2);
        player.pv -= dmgEnemigo;

        // Si muere el jugador, termina el juego
        if (player.pv <= 0) {
          actualizarHistoria(
            `¡${enemigo.nombre} te ha derrotado! Tus PV han llegado a 0.\n` +
            `Fin de la aventura.`
          );
          mostrarOpciones([]);
          return;
        }

        // Si ambos siguen con vida, repetimos
        peleaPorTurnos(enemigo, volverHandler);
      }
    },
    {
      label: "Usar poción (si tenés)",
      handler: () => {
        // Buscar una poción en el inventario
        let pocion = player.inventario.find(i => i.nombre.includes("Poción"));
        if (!pocion) {
          actualizarHistoria("No tenés ninguna poción de vida.");
          mostrarOpciones([{ label: "Volver", handler: () => peleaPorTurnos(enemigo, volverHandler) }], true);
          return;
        }
        // Consumimos 1 poción
        pocion.cantidad -= 1;
        if (pocion.cantidad <= 0) {
          // Quitamos la poción del inventario
          player.inventario = player.inventario.filter(i => i !== pocion);
        }
        // Curamos al jugador
        player.pv += 50;
        if (player.pv > player.maxPv) {
          player.pv = player.maxPv;
        }

        guardarDatos("player", player);
        // Ataque del enemigo
        let dmgEnemigo = 5 + enteroRandom(0, enemigo.dificultad * 2);
        player.pv -= dmgEnemigo;

        // Mostrar el daño infligido
        actualizarHistoria(
          `El ${enemigo.nombre} te ataca e inflige ${dmgEnemigo} de daño.\n` +
          `Tu PV actual: ${Math.max(player.pv, 0)}`
        );

        // Verificar si el jugador murió
        if (player.pv <= 0) {
          actualizarHistoria(
            `Mientras tomabas la poción, el ${enemigo.nombre} te golpeó y te dejó en 0 PV.\n` +
            "Fin de la aventura."
          );
          mostrarOpciones([]);
          return;
        }

        peleaPorTurnos(enemigo, volverHandler);
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

/* 
 * Crear un enemigo aleatorio (más adelante, cuando superamos los 3 iniciales).
 * Podés usar un array con nombres y stats, o generar en base a la dificultad y un random.
 */
function crearEnemigoRandom() {
  const nombres = ["Orco", "Zombi", "Esqueleto", "Gigante", "Dragón"];
  const index = enteroRandom(0, nombres.length);
  const nombre = nombres[index];
  const dificultad = 3 + enteroRandom(1, 5); // algo mayor que 3
  let pv = 100 + dificultad * 10;

  const enemigo = new Enemigo(
    nombre, 
    "Monstruo", 
    nombre, 
    dificultad, 
    [], 
    pv
  );
  enemigos.push(enemigo);
}


/*******************************************
 * 2) Inventario
 *******************************************/
function crearItem(nombre, tipo, valor, cantidad = 1) {
  return { nombre, tipo, valor, cantidad };
}

function crearArma(nombre, tipo, valor, dmg, atkps, cantidad = 1) {
  return { nombre, tipo, valor, dmg, atkps, cantidad };
}

// Agrega un item al inventario. Si ya existe, aumenta la cantidad
function agregarItem(item) {
  let itemExistente = player.inventario.find(i => i.nombre === item.nombre);
  if (itemExistente) {
    itemExistente.cantidad += item.cantidad;
  } else {
    player.inventario.push(item);
  }

  // Guardamos el inventario en LocalStorage
  guardarDatos("player", player);
}

function mostrarInventario(volverHandler = null) {
  if (player.inventario.length === 0) {
    actualizarHistoria("No tenés nada en el inventario.");
    // Si no hay callback, mostramos sin opciones
    if (!volverHandler) {
      mostrarOpciones([]);
    } else {
      // Si hay callback, mostramos un botón para volver
      mostrarOpciones([
        { label: "Volver", handler: volverHandler }
      ]);
    }
    return;
  }

  let mensaje = "Tu inventario:\n";
  player.inventario.forEach(obj => {
    mensaje += `- ${obj.nombre} (Tipo: ${obj.tipo}, Cantidad: ${obj.cantidad})\n`;
  });
  actualizarHistoria(mensaje);

  // Mostrar botón para volver si se pasó un callback
  if (volverHandler) {
    mostrarOpciones([
      { label: "Volver", handler: volverHandler }
    ]);
  } else {
    mostrarOpciones([]);
  }
}

/*******************************************
 * 3) Historia
 *******************************************/

// Agrega objetos básicos al inventario como "kit de bienvenida"

function cazarMonstruos() {
  // Si no hay enemigos creados, creamos los 3 iniciales
  if (enemigos.length === 0) {
    crearEnemigosHistoria();
  }

  // Verificación de hbaer matado a los 3 enemigos iniciales
  if (enemigos.length === 0) {
    // Si no hay más enemigos => random spawns
    crearEnemigoRandom();
  }

  // Tomamos el primer enemigo
  const enemigoActual = enemigos[0];

  if (!enemigoActual) {
    actualizarHistoria("No hay enemigos disponibles. ¡Has acabado con todos!");
    mostrarOpciones([]);
    return;
  }

  actualizarHistoria(
    `Te preparás para enfrentarte a ${enemigoActual.nombre} (dificultad ${enemigoActual.dificultad}).\n` +
    "¡Que comience la batalla!"
  );

  // Llamamos a la pelea por turnos
  mostrarOpciones([
    {
      label: "Empezar combate",
      handler: () => peleaPorTurnos(enemigoActual, () => {
        // Callback para cuando termine la pelea (o si escapa)
        // Revisamos si hay más enemigos, si no => spawns random
        if (enemigos.length === 0) {
          crearEnemigoRandom();
        }
        // Volvemos a cazarMonstruos para enfrentar el siguiente enemigo
        cazarMonstruos();
      })
    },
    {
      label: "Mostrar Inventario",
      handler: () => {
        mostrarInventario(() => cazarMonstruos());
      }
    }
  ]);
}

function agregarKitbienvenida() {
  let jugadorCargado = cargarDatos("player");
  if (!jugadorCargado) {
    jugadorCargado = player;
  }
  if (!jugadorCargado) {
    jugadorCargado = new Player("Default", "Mago");
  }

  // Verificamos si ya se entregó el kit para no volver a hacerlo
  if (jugadorCargado.kitEntregado) {
    // Actualizamos la variable global 'player' y salimos
    player = jugadorCargado;
    return;
  }
  
  // Bandera para marcar que el kit ya se entregó
  jugadorCargado.kitEntregado = true;

  // Adición de los objetos básicos del kit de bienvenida
  jugadorCargado.inventario.push(
    crearItem("Poción de vida (+50💖)", "Pocion", 5, 3),
    crearItem("Mapa", "Mapa", 0, 1)
  );

  // Dependiendo de la clase se reparte el arma inicial:
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

  // Guardamos los datos actualizados en LocalStorage
  guardarDatos("player", jugadorCargado);

  // Actualizamos la variable global 'player'
  player = jugadorCargado;
}

function textoMonstruos() {
  actualizarHistoria("Como decidiste cazar monstruos, el gremio te dio un kit de bienvenida.\n");
  agregarKitbienvenida();

  mostrarOpciones([
    {
      label: "Mostrar Inventario",
      handler: () => {
        mostrarInventario(() => textoMonstruos());
      }
    },
    {
      label: "Ir a la caza de monstruos",
      handler: () => {
        cazarMonstruos();
      }
    }
  ]);
}

/*
 (7) Función que simula ir al gremio de aventureros
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
                    mostrarOpciones([
                      {
                        label: "Continuar",
                        handler: () => textoMonstruos()
                      }
                    ]);
                  }
                },
                {
                  label: "Volver",
                  handler: () => siguientePasoGremio()
                }
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
        mostrarOpciones([
          {
            label: "Hablar con la recepcionista de vuelta.",
            handler: () => irAlGremio()
          }
        ]);
      }
    },
    {
      label: "Ir a cazar monstruos",
      handler: () => {
        actualizarHistoria("Te preparás para cazar monstruos en las afueras del pueblo...");
        player.puntaje += 5;
        guardarDatos("player", player);
        mostrarOpciones([
          {
            label: "Continuar",
            handler: () => textoMonstruos()
          }
        ]);
      }
    },
    {
      label: "Regresar a la aldea",
      handler: () => {
        actualizarHistoria("Decidís volver a la aldea por el momento.");
        mostrarOpciones([
          {
            label: "Volver",
            handler: () => siguientePasoAldea()
          },
          {
            label: "Hablar con al recepcionista de vuelta.",
            handler: () => irAlGremio()
          }
        ]);
      }
    }
  ]);
}

/*
 (6) Función que cierra la historia de la aldea o expande el lore
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
    {
      label: "Ir al gremio",
      handler: () => irAlGremio()
    },
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
        mostrarOpciones([]);
      }
    }
  ]);
}

/*
 (5) Función para hablar con el Alcalde
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
    {
      label: "Ir al gremio",
      handler: () => irAlGremio()
    },
    {
      label: "Explorar la aldea",
      handler: () => {
        actualizarHistoria("Decidiste explorar la aldea un poco más antes de ir al gremio.");
        mostrarOpciones([
          {
            label: "Explorar la aldea",
            handler: () => siguientePasoAldea()
          },
          {
            label: "Hablar con el alcalde de vuelta.",
            handler: () => hablarConElAlcalde()
          }
        ]);
      }
    }
  ]);
}

/*
 (4) Función que desarrolla el lore de la aldea
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
          {
            label: "Ir con el Alcalde",
            handler: () => hablarConElAlcalde()
          },
          {
            label: "Más tarde",
            handler: () => {
              actualizarHistoria("Decidiste no hablar con el Alcalde por el momento.");
              mostrarOpciones([
                {
                  label: "Explorar la aldea",
                  handler: () => siguientePasoAldea()
                },
                {
                  label: "Hablar con el alcalde.",
                  handler: () => hablarConElAlcalde()
                }
              ]);
            }
          }
        ]);
      }
    },
    {
      label: "Opción 2",
      handler: () => {
        actualizarHistoria(
          "Aldeano:\n¡Ah bueno! Entonces no me hagas perder más el tiempo. Andate de acá."
        );
        player.puntaje -= 3;
        guardarDatos("player", player);
        mostrarOpciones([]);
      }
    }
  ]);
}

/*
 (3) Función que maneja las interacciones iniciales con el aldeano
*/
function interaccionConAldeano() {
  actualizarHistoria(
    "Decidís ir a dar una vuelta por la aldea y te encontrás con un aldeano.\n" +
    "¿Querés hablar con él o ignorarlo?"
  );

  mostrarOpciones([
    {
      label: "Hablar con él",
      handler: () => loreAldea()
    },
    {
      label: "Ignorarlo",
      handler: () => {
        actualizarHistoria("No está bueno aislarse. Pensalo de nuevo.");
        mostrarOpciones([{ label: "Volver", handler: () => interaccionConAldeano() }], true);
      }
    }
  ]);
}

/*
 (2) Función para pedir nombre y clase del jugador
*/
// Sub-función para elegir la clase
function elegirClase(nombreIngresado) {
  actualizarHistoria("Elige una clase:\n1. 🧙‍♂️ Mago\n2. 🦝 Ladrón\n3. 🏹 Arquero\n4. 🛡️ Guerrero");

  mostrarOpciones([
    {
      label: "Mago",
      handler: () => {
        player = new Player(nombreIngresado, "Mago");
        guardarDatos("player", player);
        interaccionConAldeano();
      }
    },
    {
      label: "Ladrón",
      handler: () => {
        player = new Player(nombreIngresado, "Ladron");
        guardarDatos("player", player);
        interaccionConAldeano();
      }
    },
    {
      label: "Arquero",
      handler: () => {
        player = new Player(nombreIngresado, "Arquero");
        guardarDatos("player", player);
        interaccionConAldeano();
      }
    },
    {
      label: "Guerrero",
      handler: () => {
        player = new Player(nombreIngresado, "Guerrero");
        guardarDatos("player", player);
        interaccionConAldeano();
      }
    }
  ]);
}

function nombreYClase() {
  actualizarHistoria(
    "Para continuar, elige tu nombre:\n" +
    "Tené en cuenta que no vas a poder cambiarlo después."
  );

  // Limpiamos las opciones y agregamos la clase 'two-rows'
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

  // Validación del nombre ingresado
  btnOk.addEventListener("click", () => {
    const nombreIngresado = entradaNombre.value.trim();

    // Verificación de si está vacío
    if (!nombreIngresado) {
      actualizarHistoria("❌ Ingresá un nombre válido.");
      mostrarOpciones([{ label: "Reintentar", handler: () => nombreYClase() }], true);
      return;
    }

    // Verificación de longitud mínima y máxima
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

    // Si pasa las validaciones, procedemos
    elegirClase(nombreIngresado);
  });

  choicesDiv.appendChild(btnOk);
}

/*
 (1) Función principal de la historia
*/
function historia() {
  actualizarHistoria(
    "Sos un aventurero que despertó en una pequeña aldea en las afueras del reino de Aurora.\n" +
    "Nadie sabe de dónde venís ni nada de tu pasado.\n" +
    "Llevás una bolsa con algunas monedas y un mapa que señala un castillo en ruinas.\n\n" +
    "¿Deseás comenzar la historia?"
  );

  mostrarOpciones([
    {
      label: "Aceptar",
      handler: () => nombreYClase()
    },
    {
      label: "Cancelar",
      handler: () => {
        mostrarOpciones([]);
        actualizarHistoria(
          "Decidiste ir a cazar monstruos en las afueras del pueblo...\n\n" +
          "⚔️ Tu clase será: Mago\n" +
          "📝 Tu nombre será: Playground"
        );

        player = new Player("Playground", "Mago");
        guardarDatos("player", player);

        // Retrasamos el inicio de textoMonstruos() para que la historia se muestre antes
        setTimeout(() => {
          textoMonstruos();
        }, 2000);
      }
    }
  ]);
}

/*
  Inicia la historia
*/
historia();
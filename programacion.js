const player = {
  nombre: "",
  clase: "",
  puntaje: 0,
  inventario: []
};

const enemigos = {
  nombre: "",
  tipo: "",
  clase: "",
  dificultad: "",
  habilidades: []
};

// Crea un ítem con propiedades
function crearItem(nombre, tipo, valor, cantidad = 1) {
  return { nombre, tipo, valor, cantidad };
}

// Agregar items al inventario
function agregarItem(item) {
  // Si el ítem existe, aumenta su cantidad. Si no, se agrega
  let itemExistente = player.inventario.find(i => i.nombre === item.nombre);

  if (itemExistente) {
    itemExistente.cantidad += item.cantidad;
  } else {
    player.inventario.push(item);
  }
}

// Mostrar el inventario
function mostrarInventario() {
  if (player.inventario.length === 0) {
    alert("No tenés nada en el inventario.");
    return;
  }
  let mensaje = "Tu inventario:\n";
  player.inventario.forEach(obj => {
    mensaje += `- ${obj.nombre} (Tipo: ${obj.tipo}, Cantidad: ${obj.cantidad})\n`;
  });
  alert(mensaje);
}

// (1) Función principal de la historia
function storyTime() {
  let historia;

  // Aseguramos que el jugador acepte empezar la historia
  do {
    historia = confirm(
      "Sos un aventurero que despertó en una pequeña aldea en las afueras del reino de Aurora. " +
      "Nadie sabe de dónde venís ni nada de tu pasado. " +
      "Llevás una bolsa con algunas monedas y un mapa que señala un castillo en ruinas.\n\n" +
      "Acepta para continuar la historia."
    );

    if (!historia) {
      alert("⚠️ Si no tocás 'Aceptar', no vas a poder seguir con la historia.");
    }
  } while (!historia);

  // El jugador elige nombre y clase
  nombreYClase();

  // Interactuamos con el aldeano
  interaccionConAldeano();

  console.log("Puntaje final:", player.puntaje);
}

// (2) Función para pedir nombre y clase del jugador
function nombreYClase() {
  // Petición para el nombre del jugador
  player.nombre = prompt(
    "Para continuar, elige tu nombre:\n" +
    "Tené en cuenta que no vas a poder cambiarlo después."
  );

  // Petición para la clase del jugador
  let bandera = false;
  do {
    let claseElegida = prompt(
      "Elige una clase:\n" +
      "1. 🧙‍♂️ Mago\n" +
      "2. 🦝 Ladrón\n" +
      "3. 🏹 Arquero\n" +
      "4. 🛡️ Guerrero"
    );
    switch (claseElegida) {
      case "1":
        player.clase = "Mago";
        bandera = true;
        break;
      case "2":
        player.clase = "Ladrón";
        bandera = true;
        break;
      case "3":
        player.clase = "Arquero";
        bandera = true;
        break;
      case "4":
        player.clase = "Guerrero";
        bandera = true;
        break;
      default:
        alert("❌ Opción no válida.");
        break;
    }
  } while (!bandera);
}

// (3) Función que maneja las interacciones iniciales con el aldeano
function interaccionConAldeano() {
  let opcion;
  do {
    opcion = prompt(
      "Decidís ir a dar una vuelta por la aldea y te encontrás con un aldeano.\n" +
      "1. Hablar con él.\n" +
      "2. No hablar con nadie.\n"
    );
    if (opcion === "2") {
      alert("No está bueno aislarse. Pensalo de nuevo.");
    } else if (opcion !== "1") {
      alert("❌ Opción no válida.");
    }
  } while (opcion !== "1");

  loreAldea();
}

// (4) Función que desarrolla el lore de la aldea
function loreAldea() {
  alert("Aldeano:\n¡Hola! ¿Quién sos vos? No te había visto antes por acá.");

  let respuesta = prompt(
    "¿Cómo respondes?\n" +
      "1. 'Hola, soy " + player.nombre + ". Soy un " + player.clase + " aventurero y estoy en busca de mi pasado.'\n" +
      "2. 'No es asunto tuyo.'"
  );

  switch (respuesta) {
    case "1":
      alert(
        "Aldeano:\n¿En serio? Deberías hablar con el Alcalde, es muy sabio. " +
          "Él sabe todo lo que pasa por acá y seguramente te pueda ayudar."
      );
      player.puntaje += 5;

      // Preguntamos si quiere hablar con el Alcalde
      let hablar = confirm("¿Querés hablar con el Alcalde ahora?");

      if (hablar) {
        hablarConElAlcalde();
      } else {
        alert("Decidiste no hablar con el Alcalde por el momento.");
      }
      break;
    case "2":
      alert("Aldeano:\n¡Ah bueno! Entonces no me hagas perder más el tiempo. Andate de acá.");
      player.puntaje -= 3;
      break;
    default:
      alert("Aldeano:\nNo te entendí, ¿podrías repetirlo?");
      break;
  }
}

// (5) Función para hablar con el Alcalde
function hablarConElAlcalde() {
  alert(
    "Alcalde:\n" +
      "Hola " + player.nombre + ", me contaron que perdiste la memoria. " +
      "Por acá nunca te habíamos visto antes, pero no sos el primero en aparecer sin recuerdos.\n\n" +
      "Creo que deberías ir al gremio de aventureros para ver si tienen un registro tuyo. " +
      "Ellos anotan a todos los que pasan por esta región.\n" +
      "Te dejo un mapa de la ciudad para que puedas ir sin problema."
  );
  player.puntaje += 5;

  siguientePasoAldea();
}

// (6) Función que cierra la historia de la aldea o expande el lore
function siguientePasoAldea() {
  let opcion = prompt(
    "El Alcalde te sugiere ir al gremio de aventureros.\n" +
    "¿Qué querés hacer?\n\n" +
    "1. Ir al gremio de aventureros.\n" +
    "2. Explorar la aldea un poco más.\n" +
    "3. Finalizar la aventura por ahora."
  );

  switch (opcion) {
    case "1":
      irAlGremio();
      break;
    case "2":
      alert("Decidís explorar la aldea un rato más. Te cruzás con varios aldeanos que te saludan amablemente.");
      player.puntaje += 2;
      break;
    case "3":
      alert(
        "Te alejás de la aldea y das por terminada tu aventura por ahora.\n" +
        "Hasta acá llega la historia por el momento. Gracias por haber jugado este prólogo, " + player.nombre + "!"
      );
      break;
    default:
      alert("❌ Opción no válida.");
      break;
  }
}

// (7) Función que simula ir al gremio de aventureros
function irAlGremio() {
  alert(
    "Vas al gremio de aventureros siguiendo el mapa que te dio el Alcalde.\n" +
    "Es un edificio grande con un cartel de una espada y un escudo cruzados.\n" +
    "Adentro se escuchan murmullos de guerreros, magos y gente de todo tipo..."
  );

  // Se suma puntaje por descubrir el gremio
  player.puntaje += 5;

  let opcionGremio = prompt(
    "¿Qué querés hacer en el gremio?\n" +
    "1. Hablar con la recepcionista\n" +
    "2. Explorar la sala\n" +
    "3. Ir a las afueras a cazar monstruos\n" +
    "4. Regresar a la aldea"
  );

  switch (opcionGremio) {
    case "1":
      alert(
        "Recepcionista:\nBienvenido al Gremio de Aventureros. Si buscás información sobre tu pasado, " +
        "capaz que encuentres algo en nuestros registros, o también podrías agarrar misiones para ganar plata."
      );
      player.puntaje += 2;
      break;
    case "2":
      alert(
        "Observás a varios aventureros de distintas clases compartiendo historias de batallas.\n" +
        "Ves un tablón de misiones con carteles de recompensas y un mostrador donde venden equipo.\n" +
        "Quizás deberías volver más adelante para equiparte mejor."
      );
      player.puntaje += 2;
      break;
    case "3":
      alert("Te preparás para cazar monstruos en las afueras del pueblo...");
      player.puntaje += 5;
      break;
    case "4":
      alert("Decidís volver a la aldea por el momento.");
      break;
    default:
      alert("❌ Opción no válida.");
      break;
  }
}

function cazarMounstros(){
  
}
storyTime();
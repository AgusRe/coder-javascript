const misiones = [
    {
        id: 1,
        titulo: "Cazar Slime",
        descripcion: "El gremio necesita que elimines a un Slime que acecha en las afueras del pueblo. Recompensa: 10 puntos de experiencia."
    },
    {
        id: 2,
        titulo: "Rescatar a un aldeano",
        descripcion: "Un aldeano se perdió en el bosque. Encuéntralo y guíalo de regreso a la aldea. Recompensa: 15 monedas."
    },
    {
        id: 3,
        titulo: "Recoger hierbas medicinales",
        descripcion: "La herbóloga del gremio requiere hierbas para preparar pociones. Recógelas en el valle cercano. Recompensa: Un ítem especial."
    },
    {
        id: 4,
        titulo: "Explorar ruinas antiguas",
        descripcion: "Las ruinas de un castillo olvidado esconden secretos que podrían revelar más sobre tu pasado. Recompensa: Conocimiento antiguo."
    },
    {
        id: 5,
        titulo: "Derrotar un lobo feroz",
        descripcion: "Un lobo ha estado atacando el ganado; elimínalo para restaurar la paz. Recompensa: Armas mejoradas."
    }
];

// Función que retorna una misión aleatoria del array
function obtenerMision() {
    const index = Math.floor(Math.random() * misiones.length);
    return misiones[index];
}

export { obtenerMision };
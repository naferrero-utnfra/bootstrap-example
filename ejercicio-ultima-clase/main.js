const KEY = "4VWYkqTjp8ac7ykXLxNk8xwEM8VZV2lPRI9dcwQj";
const FECHA_MINIMA = "1995-06-16";
const FECHA_MAXIMA = obtenerDiaDeHoy();

const elementos = {
  titulo: document.getElementById("titulo"),
  desc: document.getElementById("desc"), // Desktop
  descModal: document.getElementById("desc-modal"), // Modal mobile
  imagen: document.getElementById("imagen"),
  videoContainer: document.getElementById("video-container"),
  videoLink: document.getElementById("video-link"),
  cargando: document.getElementById("section-cargando"),
  fecha: document.getElementById("fecha"),
};

elementos.fecha.setAttribute("max", FECHA_MAXIMA);

function configurarEventos() {
  elementos.fecha.onchange = async (event) => {
    traerDatos(event.target.value);
  };

  elementos.imagen.onload = () => {
    cambiarCargando(false);
  };
}

async function traerDatos(date = null) {
  try {
    cambiarCargando(true);
    limpiarContenido();

    let apiUrl = "https://api.nasa.gov/planetary/apod?api_key=" + KEY;
    if (date) {
      apiUrl += "&date=" + date;
    }

    const resultado = await fetch(apiUrl);

    if (!resultado.ok) {
      throw new Error(
        `Error HTTP: ${resultado.status} ${resultado.statusText}`
      );
    }

    const datos = await resultado.json();

    const { title, explanation, url: urlImagen, media_type } = datos;

    elementos.titulo.textContent = title;

    mostrarDescripcion(explanation);

    if (media_type === "video") {
      mostrarVideo(urlImagen);
      cambiarCargando(false);
    } else if (media_type === "image") {
      mostrarImagen(urlImagen);
    } else {
      throw new Error("Tipo de medio desconocido: " + media_type);
    }
  } catch (error) {
    elementos.titulo.textContent = "Error al cargar";
    mostrarDescripcion(
      "No se pudieron obtener los datos. Intenta con otra fecha."
    );
    cambiarCargando(false);
  }
}

function mostrarDescripcion(texto) {
  if (elementos.desc) {
    elementos.desc.textContent = texto;
  }

  if (elementos.descModal) {
    elementos.descModal.textContent = texto;
  }

  const modalButton = document.querySelector(
    '[data-bs-target="#descriptionModal"]'
  );
  if (modalButton) {
    const tieneTexto = texto && texto.trim() !== "";
    modalButton.disabled = !tieneTexto;
  }
}

function mostrarImagen(urlImagen) {
  elementos.imagen.style.display = "block";
  elementos.videoContainer.classList.add("d-none");

  if (!urlImagen || urlImagen.trim() === "") {
    console.error("URL de imagen vacía");
    return;
  }

  elementos.imagen.src = urlImagen;
  elementos.imagen.alt = elementos.titulo.textContent;
}

function mostrarVideo(urlVideo) {
  elementos.imagen.style.display = "none";
  elementos.videoContainer.classList.remove("d-none");

  elementos.videoLink.href = urlVideo;
}

function limpiarContenido() {
  elementos.titulo.textContent = "Cargando...";

  if (elementos.desc) elementos.desc.textContent = "Obteniendo información...";
  if (elementos.descModal)
    elementos.descModal.textContent = "Cargando descripción...";

  elementos.imagen.src = "";
  elementos.imagen.style.display = "none";
  elementos.videoContainer.classList.add("d-none");

  const modalElement = document.getElementById("descriptionModal");
  if (modalElement && typeof bootstrap !== "undefined") {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
}

function obtenerDiaDeHoy() {
  const hoyLocal = new Date();
  const hoyUTC = new Date(
    Date.now() - hoyLocal.getTimezoneOffset() * 1000 * 60
  );
  const fechaString = hoyUTC.toISOString().slice(0, 10);
  return fechaString;
}

function cambiarCargando(mostrar) {
  if (mostrar) {
    elementos.cargando.classList.add("d-block");
    elementos.cargando.classList.remove("d-none");
  } else {
    elementos.cargando.classList.add("d-none");
    elementos.cargando.classList.remove("d-block");
  }
}

function init() {
  configurarEventos();
  traerDatos();
}

init();

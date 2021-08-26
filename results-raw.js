function initialize() {
  const data = JSON.parse(localStorage.getItem("data")),
    jsonEl = document.querySelector(".json"),
    defaultJSON = {
      error: "Ocurrió un problema al traer los datos o éstos no existen."
    };
  // Pretty json
  data ? jsonEl.textContent = pretty(data) : jsonEl.textContent = pretty(defaultJSON);
};

window.onload = () => {
  initialize();
}
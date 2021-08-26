var data = {};
var pilots = [];

async function initialize() {
  await fetch(__APIURL)
    .then(handleResponse)
    .then(res => {
      data = res;
      pilots = res.etapas[0].resultados.map(x => (x.piloto));
    })

  paint();
}

function paint() {
  const countEl = document.querySelector(".count"),
    enrolledEl = document.querySelector(".enrolled"),
    pilotsEl = document.querySelector(".pilots"),
    stagesEl = document.querySelector(".stages");

  countEl.textContent = `Etapas: ${data.metadata.etapas}`;
  enrolledEl.textContent = `Inscriptos: ${data.metadata.inscriptos}`;

  pilots.forEach(el => {
    let html = `<div class="text">${el}</div>`;
    pilotsEl.insertAdjacentHTML("beforeend", html);
  });

  data.etapas.forEach(el => {
    let before = ``;
    el.resultados.forEach(r => {
      before += `
      <div class="text">${r.piloto} (${r.tiempo})</div>
      `;
    });
    let html = `
    <div class="row">
      <div class="col">
        <div class="subtitle">${el.etapa} (${el.horario})</div>
        ${before}
      </div>
    </div>
    `;
    stagesEl.insertAdjacentHTML("beforeend", html);
  });
}

window.onload = () => {
  initialize();
}
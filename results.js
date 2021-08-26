var data = { metadata: {}, etapas: [] };
/** 
 * Returns number in seconds given a duration in string format
 * e.g. 12:34 into 754 seconds
*/
function durationInSeconds(duration) {
  let substringArr = duration.split(':');
  return (+substringArr[0] * 60) + +substringArr[1];
}

/**
 * Returns string in duration format given time in seconds
 * e.g. 754 seconds into 12:34
 */
function durationToString(time) {
  var timeInSeconds = +time;
  var minutes = Math.floor(timeInSeconds / 60);
  var seconds = (timeInSeconds % 60);
  // Check for single digit numbers
  return seconds < 10 ? `${minutes}:0${seconds}` : `${minutes}:${seconds}`;
}

/**
 * Merges objects with same key and accumulates values.
 * Returns first element from array of objects, 
 * previously sorted by numeric values (asc)
 */
function reducer(array) {
  return array.reduce((prev, current, index) => {
    if (!(current.piloto in prev.keys)) {
      prev.keys[current.piloto] = index;
      prev.result.push(current);
    }
    // Accumulate pilot times
    else prev.result[prev.keys[current.piloto]].tiempo += current.tiempo;
    return prev;
  }, { result: [], keys: [] })
    // Numeric sort by pilot time
    .result.sort((a, b) => {
      return a.tiempo - b.tiempo
    })[0];
}

async function initialize() {
  // JSON to send as response  

  await fetch(__APIURL)
    .then(handleResponse)
    .then(res => {
      var stages = res.etapas;
      var enrolledPilots = [];
      for (let stage of stages) {
        let pilots = stage.resultados;

        // Stage winner
        let stageWinner = pilots.sort((a, b) => {
          return durationInSeconds(a.tiempo) - durationInSeconds(b.tiempo);
        })[0];

        const stageData = { ...stage, ganador: stageWinner };
        delete stageData.resultados;
        data.etapas.push(stageData);

        for (let pilot of pilots) {
          enrolledPilots.push({ piloto: pilot.piloto, tiempo: durationInSeconds(pilot.tiempo) })
        }
      }

      // Rally winner
      var winner = reducer(enrolledPilots);

      winner.tiempo = durationToString(winner.tiempo);
      data.metadata['ganador'] = winner;

      // Morning winner
      var morning = [];
      var morningStages = stages.filter(stage => stage.horario === "mañana");

      for (let ms of morningStages) {
        for (let r of ms.resultados) morning.push({ piloto: r.piloto, tiempo: durationInSeconds(r.tiempo) });
      }

      var morningWinner = reducer(morning);

      morningWinner.tiempo = durationToString(morningWinner.tiempo);
      data.metadata['ganadorMañana'] = morningWinner;

      // Afternoon winner
      var afternoon = [];
      var afternoonStages = stages.filter(stage => stage.horario === "tarde");
      for (let as of afternoonStages) {
        for (let r of as.resultados) afternoon.push({ piloto: r.piloto, tiempo: durationInSeconds(r.tiempo) });
      }

      var afternoonWinner = reducer(afternoon);

      afternoonWinner.tiempo = durationToString(afternoonWinner.tiempo);
      data.metadata['ganadorTarde'] = afternoonWinner;

      // Store data in localStorage (tunnel between html files)
      localStorage.setItem("data", JSON.stringify(data));

      paint();
    })
}

// Display data in browser
function paint() {
  const winner = data.metadata.ganador,
    mWinner = data.metadata['ganadorMañana'],
    aWinner = data.metadata.ganadorTarde,
    stages = data.etapas,
    winnerEl = document.querySelector(".winner"),
    mWinnerEl = document.querySelector(".morning-winner"),
    aWinnerEl = document.querySelector(".afternoon-winner"),
    sWinnersEl = document.querySelector(".stage-winners");

  winnerEl.textContent = `${winner.piloto} (${winner.tiempo})`;
  mWinnerEl.textContent = `${mWinner.piloto} (${mWinner.tiempo})`;
  aWinnerEl.textContent = `${aWinner.piloto} (${aWinner.tiempo})`;

  stages.forEach(el => {
    let html = `
    <div class="row">
      <div class="col">
        <div class="subtitle">${el.etapa} (${el.horario})</div>
        <div class="text">${el.ganador.piloto} (${el.ganador.tiempo})</div>
      </div>
    </div>
    `;
    sWinnersEl.insertAdjacentHTML("beforeend", html)
  })
}

window.onload = () => {
  initialize();
}
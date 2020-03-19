const component = '[data-component=state]';
const state = '[data-state]';
const body = '[data-role=body]';
const refreshData = '[data-refresh]';
const refreshTrigger = '[data-refresh-trigger]';
const d1 = '20200310';
const d2 = '20200317'

function init () {
  if (!$(component)) {
    return;
  } else {
    bindEvents();
  }
};

function bindEvents () {
  Chart.defaults.global.legend.display = false;
  const $components = $(component);
  $(refreshTrigger).on('click', function () {
    refresh($components);
  });
  refresh($components);
};

function run (set) {
  let state = $(set).data().state;
  let tableBody = $(set).find(body);
  let d = new Date();
  let month = d.getMonth();
  let date = d.getDate();
  let year = d.getFullYear();
  let hours = d.getHours();
  let min = d.getMinutes();
  $(refreshData).empty().append(`Last refresh: <strong>${month}/${date}/${year} ${hours}:${min}</strong>`)
  $.ajax({
    url: "https://covidtracking.com/api/states?state=" + state,
    success: function(result) {
      $(tableBody).empty().append(
        `<tr>
          <td>${result.positive}</td>
          <td>${result.negative}</td>
          <td>${result.pending}</td>
          <td>${result.death}</td>
          <td>${result.total}</td>
          <td>${result.lastUpdateEt}</td>
        </tr>`
      )
      let ctx = document.getElementById(state).getContext('2d');
      const myChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: {
              labels: ['Positive', 'Negative', 'Deaths', 'Total'],
              datasets: [{
                label: state,
                data: [
                  result.positive,
                  result.negative,
                  result.death,
                  result.total
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderWidth: 1
              }
            ]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
      });
    }
  });
}

function refresh(components) {
  components.each(function(i, set) {
    run(set);
  });
}

init();

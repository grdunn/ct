// Format date 20200316 for API
console.log('everything is chill.');

const component = '[data-component=state]';
const state = '[data-state]';
const body = '[data-role=body]';
const refreshData = '[data-refresh]';
const refreshTrigger = '[data-refresh-trigger]';
const filter = '[data-component=filter]';
const dates = []
const t = new Date()
const firstDateValue = '20200310';
const todayValue = moment(t).format('YYYYMMDD');
const delta = moment(todayValue).diff(moment(firstDateValue), 'days')

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
    refresh($components, 'all');
  });
  // setFilters();
  refresh($components, 'all');
};

// function setFilters () {
//   let currentDay = new Date();
//   let filters = [
//     {
//       label: moment(currentDay).format('MM / DD / YYYY'),
//       value: moment(currentDay).format('YYYYMMDD'),
//     }
//   ];
//   for ( let i = 0; i < delta; i++ ) {
//     filters.push(
//       {
//         label: moment(currentDay).add(-1, 'days').format('MM / DD / YYYY'),
//         value: moment(currentDay).add(-1, 'days').format('YYYYMMDD'),
//       }
//     );
//     currentDay = moment(currentDay).add(-1, 'days');
//   }
//   filters.forEach(function(item, i ) {
//     $(filter).append(
//       `<option value="${item.value}">${item.label}</option>`
//     );
//   })
// }

function run (set, query) {
  let state = $(set).data().state;
  let tableBody = $(set).find(body);
  let d = new Date();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let year = d.getFullYear();
  let hours = d.getHours();
  let min = d.getMinutes();
  let url = 'https://covidtracking.com/api/';

  console.log(d);

  if (query === 'all') {
    url += `states/daily?state=${state}`;
  } else {
    url += `states/daily?state=${state}&date=${query}`;
  }

  $(refreshData).empty().append(`Last refresh: <strong>${month}/${date}/${year} ${hours}:${min}</strong>`)

  $.ajax({
    url: url,
    success: function(result) {
      let dataset
      let everything = false;
      if (result.length && result.length > 1) {
        dataset = result[0];
        everything = true;
      } else {
        dataset = result;
      }

      let dateCheck = moment(dataset.dateChecked).format('MM/DD/YY');

      $(tableBody).empty().append(
        `<tr>
          <td>${dataset.positive}</td>
          <td>${dataset.negative}</td>
          <td class='desktop'>${dataset.pending}</td>
          <td>${dataset.death}</td>
          <td>${dataset.total}</td>
          <td class='desktop'>${dateCheck}</td>
        </tr>`
      );

      let lineChartLabels = [];
      let lineChartPositiveData = [];
      let lineChartNegativeData = [];
      let lineChartDeathData = [];

      if (everything) {

        result.forEach(function (data, i) {
          lineChartLabels.push(moment(data.dateChecked).format('MM-DD'));
          lineChartPositiveData.push(data.positive)
          lineChartNegativeData.push(data.negative)
          lineChartDeathData.push(data.death)
        });

        let ctxLine = document.getElementById(state + '-LINE').getContext('2d');
        var myLineChart = new Chart(ctxLine, {
          type: 'line',
          data: {
            labels: lineChartLabels.reverse(),
            datasets: [
              {
                label: 'Positive',
                data: lineChartPositiveData.reverse(),
                borderColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderWidth: 3,
                fill: false
              },
              {
                label: 'Negative',
                data: lineChartNegativeData.reverse(),
                borderColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderWidth: 3,
                fill: false
              },
              {
                label: 'Death',
                data: lineChartDeathData.reverse(),
                borderColor: [
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderWidth: 3,
                fill: false
              }
            ]
          }
        });
      }

      let ctx = document.getElementById(state).getContext('2d');
      const myChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: {
              labels: ['Positive', 'Negative', 'Deaths', 'Total'],
              datasets: [{
                label: state,
                data: [
                  dataset.positive,
                  dataset.negative,
                  dataset.death,
                  dataset.total
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

function refresh(components, query) {
  components.each(function(i, set) {
    run(set, query);
  });
}

init();

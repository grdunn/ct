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
    let query = parseInt($(filter).val());
    refresh($components, query);
  });
  setFilters();
  refresh($components);
};

function setFilters () {
  let currentDay = new Date();
  let filters = [
    {
      label: moment(currentDay).format('MM/DD/YY'),
      value: moment(currentDay).format('YYYYMMDD'),
    }
  ];
  for ( let i = 0; i < delta; i++ ) {
    filters.push(
      {
        label: moment(currentDay).add(-1, 'days').format('MM/DD/YY'),
        value: moment(currentDay).add(-1, 'days').format('YYYYMMDD'),
      }
    );
    currentDay = moment(currentDay).add(-1, 'days');
  }
  filters.forEach(function(item, i ) {
    $(filter).append(
      `<option value="${item.value}">${item.label}</option>`
    );
  })
}

function runGraph (set, query) {
  let state = $(set).data().state;
  let tableBody = $(set).find(body);
  let d = new Date();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let year = d.getFullYear();
  let hours = d.getHours();
  let min = d.getMinutes();
  let url = `https://covidtracking.com/api/`;
  if (query && query != 'all') {
    url += `states/daily?state=${state}&date=${query}`
  } else {
    url += `states?state=${state}`;
  }
  let ctx = document.getElementById(state).getContext('2d');
  $.ajax({
    url: url,
    success: function(result) {
      let percentage = Math.round(result.positive / result.total * 100);
      $(tableBody).empty().append(
        `<tr>
          <td>${result.positive}</td>
          <td>${result.negative}</td>
          <td>${result.death}</td>
          <td>${result.total}</td>
          <td class='desktop'>~${percentage}%</td>
          <td class='desktop'>${result.lastUpdateEt}</td>
        </tr>`
      );
      let data = {
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
      };
      if (window[`myBarGraph${state}`]) {
        window[`myBarGraph${state}`].data = data;
        window[`myBarGraph${state}`].update();
      } else {
        window[`myBarGraph${state}`] = new Chart(ctx, {
          type: 'horizontalBar',
          data: data,
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
      $(refreshData).empty().append(`Last refresh: <strong>${month}/${date}/${year} ${hours}:${min}</strong>`);
    }
  });
};

function runLine (set, query) {
  let state = $(set).data().state;
  let tableBody = $(set).find(body);
  let url = `https://covidtracking.com/api/states/daily?state=${state}`;
  let lineChartLabels = [];
  let lineChartPositiveData = [];
  let lineChartNegativeData = [];
  let lineChartDeathData = [];
  let ctxLine = document.getElementById(state + '-LINE').getContext('2d');
  $.ajax({
    url: url,
    success: function(r) {

      let result;

      const sortedResult = _.orderBy(r, function (o) {
        return new moment(o.date);
      }, ['desc']);

      if (query && query != 'all') {
        result = _.filter(sortedResult, function(s) {
          return moment(s.date).isSameOrBefore(moment(query));
        });
      } else {
        result = sortedResult;
      }

      result.forEach(function (data, i) {
        lineChartLabels.push(moment(data.dateChecked).format('MM-DD'));
        lineChartPositiveData.push(data.positive);
        lineChartNegativeData.push(data.negative);
        lineChartDeathData.push(data.death);
      });

      let data = {
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
      };

      if (window[`myLineChart${state}`]) {
        window[`myLineChart${state}`].data = data;
        window[`myLineChart${state}`].update();
      } else {
        window[`myLineChart${state}`] = new Chart(ctxLine, {
          type: 'line',
          data: data
        });
      };
    }
  });
};

function refresh(components, query) {
  components.each(function(i, set) {
    runGraph(set, query);
    runLine(set, query);
  });
}

init();

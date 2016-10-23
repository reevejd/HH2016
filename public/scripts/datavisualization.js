google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

var drawChart = function(trait, snp, frequency, targetId) {
    var data = google.visualization.arrayToDataTable([
        ['Personality Trait', 'Frequency of This Personality Trait Among the ' + snp + " Population" ],
        [trait, frequency],
        ['not' + trait, 1-frequency]
    ]);

    var options = {
        title: 'Test'
    };

    var chart = new google.visualization.PieChart(document.getElementById('target'));

    chart.draw(data, options);
}

drawChart('trait', 'snpname', 0.8, 'piechart_');




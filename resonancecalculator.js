jQuery(function () {
const PIPI = 2 * Math.PI; // Two PI are better than one. Used to calculate data for chart.
const CHART_X_AXIS_FIRST_VALUE = 10; // First value of X axis (total weight) to be drown on the chart. 
const CHART_X_AXIS_LAST_VALUE = 35; // Last value of X axis (total weight) to be drown on the chart.
const OPTIMAL_RESONANCE_FREQUENCY = 10; // Optimal resonace for any tonearm is 10 Hz.
const CONVERSION_RATIO_FROM_100HZ_TO_10HZ = 1.75;
const OPTIMAL_FREQUENCY_UPPER_LIMIT = 10.5;    //***************************************************
const OPTIMAL_FREQUENCY_LOWER_LIMIT = 9.5;     //
const GOOD_FREQUENCY_UPPER_LIMIT = 12.50;      //   
const GOOD_FREQUENCY_LOWER_LIMIT = 7.50;       //   Used in chart to draw boundry plotLines and
const BOUNDARY_FREQUENCY_UPPER_LIMIT = 13.50;  //   in tip massage.
const BOUNDARY_FREQUENCY_LOWER_LIMIT = 6.50;   //
const INCORRECT_FREQUENCY_UPPER_LIMIT = 16.00; //
const INCORRECT_FREQUENCY_LOWER_LIMIT = 4.02;  //***************************************************


jQuery('#total_mass, #f_resonance, #mass_10Hz').prop('disabled', true);
jQuery('#compilance').attr('maxlength', '2');
jQuery('#cartridge_mass, #headshell_mass, #tonearm_mass, #screws_mass').attr('maxlength', '4');
jQuery ('#chart_info_header').on('click', function(event) {
  jQuery('#chart_info_icon').toggleClass('glyphicon-chevron-up, glyphicon-chevron-down'); 
  event.preventDefault();
});

jQuery('#calculate_button').click(function() {
    if (isFormValid() === true) {
        jQuery('#total_mass').val(calculateTotalMass);
        drawResonanceLine();
    }
});

function isFormValid() {
    var inputData = ["#compilance", "#cartridge_mass", "#headshell_mass", "#tonearm_mass", "#screws_mass"];
    var validForm = true;
    
    for (var i = 0; i <= inputData.length - 1; i++) {
        var value = jQuery(inputData[i]).val();
        var inputFloat = parseFloat(value.replace(',' , '.'));
        if (!isNaN(inputFloat) && (inputFloat > 0.1 && inputFloat < 100)) {
            jQuery(inputData[i]).parent().removeClass('has-error');
            jQuery(inputData[i]).parent().addClass('has-success');
        } else {
            jQuery(inputData[i]).parent().removeClass('has-success');
            jQuery(inputData[i]).parent().addClass('has-error');
            validForm = false;
        }
    };
    return validForm;
};

function calculateTotalMass() {
    var totalMass = 0.0; 
    jQuery('#cartridge_mass, #headshell_mass, #tonearm_mass, #screws_mass').each(function() {
        totalMass += parseFloat(jQuery(this).val().replace(',' , '.'));
    });
    return totalMass;
};

function drawResonanceLine() {
    var chartData = resonanceChartData();
    var plotLineX = {
        value: chartData[2],
        color: 'purple',
        dashStyle: 'solid',
        width: 2,
        zIndex: 5,
        label: { 
            text: '<b> resonance frequency is ' + chartData[1] + ' Hz ' + '@ ' + chartData[2] + 'grams' ,
            rotation: '0',
            x: 10,
            y: 50
        }
    }
    resonanceChart.series[0].setData(chartData[0]);
    resonanceChart.xAxis[0].options.plotLines[0] = plotLineX;
    resonanceChart.xAxis[0].update();
};

function resonanceChartDummyData() {
    var dummyChartData = [];
    var loopMass = CHART_X_AXIS_FIRST_VALUE;
    for (var i = 0; i <= (CHART_X_AXIS_LAST_VALUE - CHART_X_AXIS_FIRST_VALUE) ; i++) {
        dummyChartData[i] = [loopMass, OPTIMAL_RESONANCE_FREQUENCY];
        loopMass++;
    }
    return dummyChartData;
};

function resonanceChartData() {
    var loopChart = [];
    var loopMass = CHART_X_AXIS_FIRST_VALUE;
    var totalMass = jQuery('#total_mass').val();
    var compliance = jQuery('#compilance').val();
    var compilance100Hz = jQuery('#100Hz').is(':checked');

    if (compilance100Hz) {
        compliance = compliance * CONVERSION_RATIO_FROM_100HZ_TO_10HZ;
    }

    var resonanceFrequency = Number((1000 / (PIPI * Math.sqrt(compliance * totalMass))).toFixed(2));
    var resonanceMass = Number(((Math.pow((1000 / (PIPI * resonanceFrequency)), 2)) / compliance).toFixed(1));
    var resonanceMass10Hz = Number(((Math.pow((1000 / (PIPI * OPTIMAL_RESONANCE_FREQUENCY)), 2)) / compliance).toFixed(1));

    jQuery('#f_resonance').val(resonanceFrequency); 
    jQuery('#mass_10Hz').val(resonanceMass10Hz);
    
    for (var i = 0; i <= (CHART_X_AXIS_LAST_VALUE - CHART_X_AXIS_FIRST_VALUE); i++) {
        var loopResonaceFrequency = Number((1000 / (PIPI * Math.sqrt(compliance * loopMass))).toFixed(2));
        loopChart[i] = [loopMass, loopResonaceFrequency];
        loopMass++;
    }
    var chartData = [loopChart, resonanceFrequency, resonanceMass, resonanceMass10Hz];
    return (chartData);
}

var resonanceChart = Highcharts.chart('resonancegraph', {

title: { text: 'Turntable tonearm resonance chart' },
chart: { type: 'line' },
tooltip: {
    backgroundColor: '#FCFFC5',
    borderWidth: 5,
    crosshairs: [true, true],
    headerFormat: '<b>{point.x} grams</b><br>'
},  
credits: {
    text: "copyright Audiosite.net / made with highcharts",
    href: "https://www.highcharts.com/"
},
legend: { enabled: false },

yAxis: {
    min: 4,
    max: 16,
    tickInterval: 1,
    gridLineWidth: 1.5,
    minorTicks: true,
    minorGridLineWidth: 0.8,
    minorTickInterval: 0.5,
        
    title: { text: 'resonance frequency (Hz)' },
    tooltip: { valueSuffix: 'yAxis tooltip' },
    
    plotLines: [{
        value: INCORRECT_FREQUENCY_LOWER_LIMIT,
        color: 'red',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, {
        value: BOUNDARY_FREQUENCY_LOWER_LIMIT,
        color: 'orange',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, {
        value: GOOD_FREQUENCY_LOWER_LIMIT,
        color: 'green',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, {
        value: OPTIMAL_FREQUENCY_LOWER_LIMIT,
        color: 'blue',
        dashStyle: 'dot',
        width: 1,
        zIndex: 2,
    }, {
        value: OPTIMAL_FREQUENCY_UPPER_LIMIT,
        color: 'blue',
        dashStyle: 'dot',
        width: 1,
        zIndex: 2,
    }, {
        value: GOOD_FREQUENCY_UPPER_LIMIT,
        color: 'green',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, {
        value: BOUNDARY_FREQUENCY_UPPER_LIMIT,
        color: 'orange',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, {
        value: INCORRECT_FREQUENCY_UPPER_LIMIT,
        color: 'red',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 2,
    }, ]
},

xAxis: {
    min: CHART_X_AXIS_FIRST_VALUE,
    max: CHART_X_AXIS_LAST_VALUE,
    tickInterval: 5,
    gridLineWidth: 1.5,
    minorTicks: true,
    minorTickInterval: 1.0,

    title: { text: 'tonearm effective mass (grams)' },
    plotLines: [{}],
    },

    series: [{
        name: 'Resonance frequency',
        data: resonanceChartDummyData(),
        
    zones: [{
        value: BOUNDARY_FREQUENCY_LOWER_LIMIT,
        color: 'red'
    }, {
        value: GOOD_FREQUENCY_LOWER_LIMIT,
        color: 'orange'
    }, {
        value: GOOD_FREQUENCY_UPPER_LIMIT,
        color: 'green'
    }, {
        value: BOUNDARY_FREQUENCY_UPPER_LIMIT,
        color: 'orange'
    }, {
        value: INCORRECT_FREQUENCY_UPPER_LIMIT,
        color: 'red'
    }],
    
}]
}); });
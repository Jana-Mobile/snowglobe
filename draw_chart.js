if ($('#snowglobe_frame').length) {
    $('#snowglobe_frame').remove()
} else {
    Ext.DomHelper.append(document.body, {
        tag: 'div',
        id: 'snowglobe_frame',
        style: {
            position: 'absolute',
            border: 'solid 2px #80B0E8',
            width: '90%',
            height: '600px',
            top: '40px',
            left: '5%',
            zIndex: '6',
            backgroundColor: '#D8D8D8'
        }
    });

    var activeTab = Ext.ComponentQuery.query('renamable-tab[active]')[0].tabId;
    var allResultViews = Ext.ComponentQuery.query('query-result-view');
    var queryResult = null;
    for (var i = 0; i < allResultViews.length; i++) {
        if (allResultViews[i].ownerCt.ownerCt.tag == activeTab) {
            queryResult = allResultViews[i].m_lastQueryResult;
        }
    }
    var columns = queryResult.m_columns.slice(1);  // remove row numbers
    var result = [];
    var colTypes = [];
    for (var colNum = 0; colNum < columns.length; colNum++) {
        colTypes.push(columns[colNum].type);
        result[colNum] = {
            name: columns[colNum].fullName,
            data: []
        }
    }

    for (var chunkNum = 0; chunkNum < queryResult.m_chunks.length; chunkNum++) {
        var chunk = queryResult.m_chunks[chunkNum];
        if (chunk && chunk.m_records) {
            for (var recordNum = 0; recordNum < chunk.m_records.length; recordNum++) {
                var record = chunk.m_records[recordNum];
                for (var columnNum = 0; columnNum < columns.length; columnNum++) {
                    var data = record['column' + columnNum];
                    switch(colTypes[columnNum]) {
                        case "fixed":
                            data = parseFloat(data);
                            break;
                        case "timestamp_ltz":
                            data = new Date(data);
                    }
                    result[columnNum].data.push(data);
                }
            }
        }
    }

    if (colTypes[0] == "timestamp_ltz" && colTypes.slice(1).every(function (a) { return a == "fixed"; })) {
        var xValues = result[0].data;
        var serieses = result.slice(1);
        var title = "Column-series over time line chart";
    } else if (_.isEqual(colTypes, ["timestamp_ltz", "text", "fixed"])) {
        var title = "Normalized label-value over time line chart";
        var seenTimes = [];

        var xValues = result[0].data.filter(function (a) {
            if (seenTimes.indexOf(a.getTime()) >= 0) {
                return false;
            }
            seenTimes.push(a.getTime());
            return true;
        });
        seenTimes.sort(function (a, b) { return parseInt(a) - parseInt(b); });
        xValues.sort(function (a, b) { return a.getTime() - b.getTime(); });

        var seriesData = {};
        for (var i = 0; i < result[0].data.length; i++) {
            var seriesName = result[1].data[i];
            if (!seriesData.hasOwnProperty(seriesName)) {
                seriesData[seriesName] = new Array(xValues.length).fill(null);
            }
            var index = seenTimes.indexOf(result[0].data[i].getTime());
            seriesData[seriesName][index] = result[2].data[i];
        }
        var serieses = [];
        for (var key in seriesData) {
            if (seriesData.hasOwnProperty(key)) {
                serieses.push({
                    name: key,
                    data: seriesData[key]
                });
            }
        }
    } else {
        var title = "Don't know how to plot columns: " + colTypes
    }

    $('#snowglobe_frame').highcharts({
        title: {
            text: title,
            x: -20 //center
        },
        subtitle: {
            text: 'by snowglobe',
            x: -20
        },
        xAxis: {
            categories: xValues
        },
        yAxis: {
            title: {
                text: 'count'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ''
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: serieses
    });
    xValues = null;
    serieses = null;
}
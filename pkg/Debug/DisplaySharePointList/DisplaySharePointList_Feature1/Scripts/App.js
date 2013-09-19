'use strict';

$(document).ready(function () {

    var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    var hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    var executor = new SP.RequestExecutor(appweburl);

    var pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/sites\/([\w]*)\/*/;
    var url = pattern.exec(appweburl);

    console.log(appweburl);
    console.log(url[0] + "/_api/web/lists/getbytitle('Servers')/items");

    executor.executeAsync({
        url: url[0] + "/_api/web/lists/getbytitle('Servers')/items",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: onSuccess,
        error: onError
    });

    function onSuccess(data) {
        var jsonObject = JSON.parse(data.body);
        var results = jsonObject.d.results;
        var chart_data = [];
        var values = [];

        for (var i = 0; i < results.length; i++) {
            $("#servers").append("<li>" + results[i].Title + "</li>");
            values.push( { label: results[i].Date, value: results[i].FreeSpace } );
        }

        chart_data.push({ key: "Free Space", values: values });

        nv.addGraph(function () {
            var chart = nv.models.discreteBarChart()
            .x(function (d) { return d.label })
            .y(function (d) { return d.value })
            .staggerLabels(true)
            .tooltips(false)
            .showValues(true)
            .transitionDuration(250)
            ;

            d3.select('#chart svg')
            .datum(chart_data)
            .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }

    function onError(data, errorCode, errorMessage) {
        console.log("Could not complete cross-domain call: " + errorMessage);
    }

    function getQueryStringParameter(paramToRetrieve) {
        var params = document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] === paramToRetrieve)
                return singleParam[1];
        }
    }
});


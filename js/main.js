var margin = { left:80, right:20, top:50, bottom:100 };

var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
//Transition var
var t = d3.transition().duration(750);

var flag = true;
var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    // X Scale
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    // Y Scale
    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxisGroup = g.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height +")");
    var yAxisGroup = g.append("g")
                        .attr("class", "y axis");
// X Label
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

// Y Label
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

d3.json("data/revenues.json").then(function(data){
    // console.log(data);

    // Clean data
    data.forEach(function(d) {
        d.profit = +d.profit;
        d.revenue = +d.revenue;
    });

    
    d3.interval(() => {
        var newData = flag ? data : data.slice(1);
        update(newData);
        //for every 1 sec will change flag
        flag = !flag;
    }, 1000);

    //Run Vis for first time
    update(data);
});


function update(data) {
    var value = flag ? "revenue" : "profit";
    x.domain(data.map(function(d){ return d.month }));
    y.domain([0, d3.max(data, function(d) { return d[value] })]);
    // X Axis
    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.transition(t).call(xAxisCall);

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return "$" + d; });
    yAxisGroup.transition(t).call(yAxisCall);

    // Bars
    //JOIN new data with old elements
    var rects = g.selectAll("rect")
        .data(data, (d) => {
            return d.month;
        })

    //EXIT old elements not present in new data
    rects.exit()
         .attr("fill", "grey")    //change fill of exiting ele
         .transition(t)   //gradually change height to 0 and y to 0
         .attr("height", 0)
         .attr("y", y(0))
        .remove();
    // //UPDATE old elements present in new data
    // rects.transition(t)
    //     .attr("y", function(d){ return y(d[value]); })
    //     .attr("x", function(d){ return x(d.month) })
    //     .attr("height", function(d){ return height - y(d[value]); })
    //     .attr("width", x.bandwidth);
    //Enter new elements present in new data
    rects.enter()
        .append("rect")
            .attr("x", function(d){ return x(d.month) })
            .attr("width", x.bandwidth)
            .attr("fill", "orange")
            .attr("y", y(0))
            .attr("height", 0)
            //UPDATE old elements present in new data
            .merge(rects)
            .transition(t)
            .attr("x", function(d){ return x(d.month) })
            .attr("width", x.bandwidth)
            .attr("y", function(d){ return y(d[value]); })
            .attr("height", function(d){ return height - y(d[value]); });

    var label = flag ? "revenue" : "profit";
    yLabel.text(label);
}
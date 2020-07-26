
//Get the Data
fetch('res/movieData.json')
    .then(res => res.json())
    .then((out) => {
        console.log(out)
        
        uniqueMovies = [...new Set(out.map(d => d.series))]
        console.log(uniqueMovies)

        uniqueMovies.forEach(d => {
            data = out.filter(i => i.series === d)

            makeChart(data)

            //Only show movies that are better
            //if (data.map(d => d.imdb).reduce((n, item) => n !== false && item >= n && item)){
            //    makeChart(data)
            //}
            
        })
    })

//Make a chart
function makeChart(data){
    var chartWidth = 200;
    var chartHeight = 200;

    let seriesName = new Set(data.map(d => d.series))
    let axisName = seriesName.values().next()

    var div = d3.select("body")
        .append("div")
        .classed("tooltip", true)
        .style("opacity", 0)
    
    var svg = d3.select("#chartContent")
        .append("svg")
        .attr("height", chartWidth)
        .attr("width", chartHeight)

    var chartGroup = svg.append("g")

    //Cast the imdb data as int
    data.forEach(d => {
        d.imdb = +d.imdb;
    })

    var xBandScale = d3.scaleBand()
        .domain(data.map(d => d.title_clean))
        .range([0, chartWidth])
        .padding(0.1);

    var yLinearScale = d3.scaleLinear()
        .domain([0, 10])
        .range([chartHeight - 20, 0]);

    //console.log(yLinearScale(2))

    //Draw the Bars
    var bars = chartGroup.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .classed("bar", true)
        .attr("x", d => xBandScale(d.title_clean))
        .attr("y", d => yLinearScale(d.imdb))
        .attr("fill", d => {
            if (d.imdb > 5) {
                return "#00b33c"
            } else {
                return "red"
            }
        })
        .attr("width", xBandScale.bandwidth())
        .attr("height", d => chartHeight - 20 - yLinearScale(d.imdb))
        .on("mouseover", function(d) {
            div.style("opacity", 1);

            div .html(`<strong>${d.title_clean}</strong> <hr> IMDB ${d.imdb}`)
                .style("left", this.getBoundingClientRect().x + "px")
                .style("top", (this.getBoundingClientRect().y + window.scrollY - 70) + "px");   
        })
        .on("mouseout", d=> {
            div.style("opacity", 0)
        })
    
    var axis = chartGroup.append("text")
        .attr("class", "axisText")
        .attr("y", chartHeight - 5)
        .text(axisName.value)

    axis.attr("x", function() {
        return (200 - this.getBoundingClientRect().width)/2
    })

}
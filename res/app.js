var summary_data
var movie_data

// Get the summary data - this loads on page load
fetch('res/summary.json')
    .then(res => res.json())
    .then(out => {
        //console.log(out.sort(compare("series", 1)))

        summary_data = out

        makeActiveButtons()
        getMovieData()
    })


//Get the Movie Data upon load and make the initial charts
function getMovieData(){
    fetch('res/movieData.json')
        .then(res => res.json())
        .then((out) => { 

            movie_data = out

            plotAllMovies()
        });
}

function makeActiveButtons(){
    let buttons = document.getElementsByClassName("button")

    Array.from(buttons).forEach(d => {
        d.addEventListener('click', () => {
            Array.from(buttons).forEach(b => b.classList.remove('active'))

            d.classList.add('active');
        })
    })
}

function makeGif(func){

    func()

}

function plotAllMovies(){
    d3.select("#chartContent").html("")
    summary_data.map(d => {
        data = movie_data.filter(i => i.series === d.series)

        makeChart(data)
        
    })
}

function gotWorse(){
    d3.select("#chartContent").html("")
    betterMovies = summary_data.filter(d => d.imdb < 0)

    betterMovies.map(d => {
        data = movie_data.filter(i => i.series === d.series)

        makeChart(data)
        
    })
}

function gotBetter(){
    d3.select("#chartContent").html("")
    betterMovies = summary_data.filter(d => d.imdb > 0)

    betterMovies.map(d => {
        data = movie_data.filter(i => i.series === d.series)

        makeChart(data)
        
    })
}

//Used for sorting
function compare(property, asc){
    return function (a, b) {
        if (a[property] < b[property]){
            return -1 * asc
        } else if (a[property] > b[property]){
            return 1 * asc
        } else {
            return 0
        }
    }
}

//truncate string
function truncateString(str, num = 15){
    if(str.length <= num){
        return str
    } else {
        return `${str.slice(0, num)}...`
    }
}

//Add a tooltip
var div = d3.select("body")
.append("div")
.classed("tooltip", true)
.style("opacity", 0)

//Make a chart
function makeChart(data){
    var chartWidth = 200;
    var chartHeight = 200;

    let seriesName = new Set(data.map(d => d.series))
    let axisName = seriesName.values().next()


    
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

            barBox = this.getBoundingClientRect()

            div .html(`<strong>${truncateString(d.title_clean)}</strong> <hr> IMDB ${d.imdb}`)
                .style("left", (barBox.x - 4) + "px")
                .style("top", (barBox.y + window.scrollY - 75) + "px");   
        })
        .on("mouseout", d=> {
            div.style("opacity", 0)
        })
        .on("click", d => {
            window.open(`https://www.imdb.com/title/${d.imdb_id}`, '_blank');
        });
    
    var axis = chartGroup.append("text")
        .attr("class", "axisText")
        .attr("y", chartHeight - 5)
        .text(axisName.value)

    axis.attr("x", function() {
        return (200 - this.getBoundingClientRect().width)/2
    })

}
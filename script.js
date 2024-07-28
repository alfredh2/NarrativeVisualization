let currentSlide = 1;
let data, filteredData;
let currentPage = 0;
const itemsPerPage = 20;
let totalPages = 0;

function nextSlide() {
    d3.select(`#slide${currentSlide}`).classed("active", false);
    currentSlide++;
    if (currentSlide > 4) currentSlide = 4; // Ensure the slide number doesn't exceed the number of slides
    d3.select(`#slide${currentSlide}`).classed("active", true);
    if (currentSlide === 2) {
        if (!filteredData) {
            filteredData = data; // Initialize filteredData if not already done
        }
        createScatterPlot();
    } else if (currentSlide === 3) {
        createBarChart();
    } else if (currentSlide === 4) {
        createBoxPlot();
        d3.select("#nextButton").style("display", "none");
    } else {
        d3.select("#nextButton").style("display", "inline-block");
    }
}

function previousSlide() {
    d3.select(`#slide${currentSlide}`).classed("active", false);
    currentSlide--;
    if (currentSlide < 1) currentSlide = 1; // Ensure the slide number doesn't go below 1
    d3.select(`#slide${currentSlide}`).classed("active", true);
    if (currentSlide === 4) {
        d3.select("#nextButton").style("display", "none");
    } else {
        d3.select("#nextButton").style("display", "inline-block");
    }
}

function updateFilter() {
    const genre = d3.select("#genreFilter").property("value");
    const minPopularity = +d3.select("#popularityFilter").property("value");
    d3.select("#popularityValue").text(minPopularity);

    filteredData = data.filter(d => 
        (genre === "All" || d["top genre"] === genre) && 
        d.popularity >= minPopularity
    );

    createScatterPlot();
}

function updateTrendLine() {
    createScatterPlot();
}

function calculateCorrelation(data, xVar, yVar) {
    const n = data.length;
    const sumX = d3.sum(data, d => +d[xVar]);
    const sumY = d3.sum(data, d => +d[yVar]);
    const sumXY = d3.sum(data, d => +d[xVar] * +d[yVar]);
    const sumXX = d3.sum(data, d => +d[xVar] * +d[xVar]);
    const sumYY = d3.sum(data, d => +d[yVar] * +d[yVar]);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return numerator / denominator;
}

function createScatterPlot() {

    // Load the dataset if not already loaded
    if (!data) {
        d3.csv("top_spotify.csv").then(loadedData => {
            data = loadedData;
            filteredData = data; // Initialize filteredData with the full dataset
            setupFilters();
            createScatterPlot();
        }).catch(error => {
            console.error('Error loading or parsing data:', error);
        });
        return;
    }

    // Ensure previous SVG is removed if it exists
    d3.select("#scatterplot").selectAll("*").remove();

    const svg = d3.select("#scatterplot")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const x = d3.scaleLinear()
                .domain(d3.extent(filteredData, d => +d.nrgy))
                .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
                .domain(d3.extent(filteredData, d => +d.dB))
                .range([height - margin.bottom, margin.top]);

    // Append x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x))
       .call(g => g.select(".domain").remove())
       .append("text")
       .attr("x", width / 2)
       .attr("y", margin.bottom + 10)
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .attr("fill", "black")
       .attr("text-anchor", "middle")
       .text("Energy");


    // Append y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y))
       .call(g => g.select(".domain").remove())
       .append("text")
       .attr("x", -height / 2)
       .attr("y", -margin.left + 20)
       .attr("fill", "black")
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .attr("text-anchor", "middle")
       .attr("transform", "rotate(-90)")
       .text("Decibels");

    // Append circles for data points
    svg.append("g")
       .selectAll("circle")
       .data(filteredData)
       .enter()
       .append("circle")
       .attr("cx", d => x(d.nrgy))
       .attr("cy", d => y(d.dB))
       .attr("r", 3)
       .attr("fill", "steelblue")
       .on("mouseover", function(event, d) {
           d3.select(this).attr("r", 6).attr("fill", "orange");
           svg.append("text")
              .attr("id", "tooltip")
              .attr("x", x(d.nrgy))
              .attr("y", y(d.dB) - 10)
              .attr("text-anchor", "middle")
              .attr("fill", "black")
              .text(`Title: ${d.title}, Artist: ${d.artist}`);
       })
       .on("mouseout", function() {
           d3.select(this).attr("r", 3).attr("fill", "steelblue");
           svg.select("#tooltip").remove();
       });

    // Add trend line if checkbox is checked
    if (d3.select("#showTrend").property("checked")) {
        const linearRegression = (data) => {
            const n = data.length;
            const sumX = d3.sum(data, d => d.nrgy);
            const sumY = d3.sum(data, d => d.dB);
            const sumXY = d3.sum(data, d => d.nrgy * d.dB);
            const sumXX = d3.sum(data, d => d.nrgy * d.nrgy);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            return { slope, intercept };
        };

        const { slope, intercept } = linearRegression(filteredData);

        // Add trend line
        svg.append("line")
            .attr("x1", x(d3.min(filteredData, d => d.nrgy)))
            .attr("y1", y(slope * d3.min(filteredData, d => d.nrgy) + intercept))
            .attr("x2", x(d3.max(filteredData, d => d.nrgy)))
            .attr("y2", y(slope * d3.max(filteredData, d => d.nrgy) + intercept))
            .attr("stroke", "red")
            .attr("stroke-width", 2);
    }

    // Calculate correlation
    const correlation = calculateCorrelation(filteredData, 'nrgy', 'dB').toFixed(2);

    // Add annotation
    const annotation = svg.append("g")
                         .attr("transform", `translate(${width - margin.right - 20},${height - margin.bottom / 2 - 75})`);

    annotation.append("rect")
              .attr("x", -150)
              .attr("y", -25)
              .attr("width", 300)
              .attr("height", 50)
              .attr("fill", "white")
              .attr("stroke", "black");

    annotation.append("text")
              .attr("x", 0)
              .attr("y", 0)
              .attr("text-anchor", "middle")
              .attr("alignment-baseline", "middle")
              .attr("class", "annotation")
              .text(`Correlation between Energy and Decibels: ${correlation}`);

    // Add plot title
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", margin.top)
       .attr("text-anchor", "middle")
       .attr("class", "annotation")
       .text("Scatterplot of Energy vs. Decibels");

}

function createBarChart() {

    // Load the dataset if not already loaded
    if (!data) {
        d3.csv("top_spotify.csv").then(loadedData => {
            data = loadedData;
            createBarChart();
        }).catch(error => {
            console.error('Error loading or parsing data:', error);
        });
        return;
    }

    // Ensure previous SVG is removed if it exists
    d3.select("#barchart").selectAll("*").remove();

    const svg = d3.select("#barchart")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 80, left: 70 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    // Group data by genre and calculate average energy
    const genreData = d3.rollups(data, v => d3.mean(v, d => +d.nrgy), d => d["top genre"])
                        .map(([key, value]) => ({ genre: key, avgEnergy: value }))
                        .sort((a, b) => d3.descending(a.avgEnergy, b.avgEnergy));

    totalPages = Math.ceil(genreData.length / itemsPerPage);

    const paginatedData = genreData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const x = d3.scaleBand()
                .domain(paginatedData.map(d => d.genre))
                .range([margin.left, width - margin.right])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, 100])  // Keep the maximum value at 100
                .range([height - margin.bottom, margin.top]);


    // Append x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x))
       .selectAll("text")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end")
       .attr("font-size", "12px")
       .attr("font-weight", "bold");

    // Append x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - margin.bottom + 125)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .text("Genre");


    // Append y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y))
       .call(g => g.select(".domain").remove());

    // Append y-axis label
    svg.append("text")
       .attr("x", -height / 2)
       .attr("y", -margin.left + 100)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .attr("transform", "rotate(-90)")
       .text("Average Energy");

    // Append bars
    svg.append("g")
       .selectAll("rect")
       .data(paginatedData)
       .enter()
       .append("rect")
       .attr("x", d => x(d.genre))
       .attr("y", d => y(d.avgEnergy))
       .attr("height", d => y(0) - y(d.avgEnergy))
       .attr("width", x.bandwidth())
       .attr("fill", "steelblue")
       .on("mouseover", function(event, d) {
           d3.select(this).attr("fill", "orange");
           svg.append("text")
              .attr("id", "tooltip")
              .attr("x", x(d.genre) + x.bandwidth() / 2)
              .attr("y", y(d.avgEnergy) - 10)
              .attr("text-anchor", "middle")
              .attr("fill", "black")
              .text(`Avg Energy: ${d.avgEnergy.toFixed(2)}`);
       })
       .on("mouseout", function() {
           d3.select(this).attr("fill", "steelblue");
           svg.select("#tooltip").remove();
       });


    // Update pagination controls visibility
    d3.select("#previousPage").style("display", currentPage === 0 ? "none" : "inline-block");
    d3.select("#nextPage").style("display", currentPage === totalPages - 1 ? "none" : "inline-block");
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        createBarChart();
    }
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        createBarChart();
    }
}

function setupFilters() {
    const genres = Array.from(new Set(data.map(d => d["top genre"])));
    genres.forEach(genre => {
        d3.select("#genreFilter").append("option").text(genre).attr("value", genre);
    });
}

function createBoxPlot() {

    // Load the dataset if not already loaded
    if (!data) {
        d3.csv("top_spotify.csv").then(loadedData => {
            data = loadedData;
            setupGenreSelects();
            createBoxPlot();
        }).catch(error => {
            console.error('Error loading or parsing data:', error);
        });
        return;
    }

    // Ensure previous SVG is removed if it exists
    d3.select("#boxplot").selectAll("*").remove();

    const svg = d3.select("#boxplot")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const genre1 = d3.select("#genreSelect1").property("value");
    const genre2 = d3.select("#genreSelect2").property("value");

    if (!genre1 || !genre2) return; // Return if no genres are selected

    // Filter data for selected genres
    const filteredData1 = data.filter(d => d["top genre"] === genre1);
    const filteredData2 = data.filter(d => d["top genre"] === genre2);

    // Calculate statistics for boxplot
    const stats = [filteredData1, filteredData2].map((data, i) => {
        const values = data.map(d => +d.nrgy).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;
        return { genre: i === 0 ? genre1 : genre2, min, q1, median, q3, max };
    });

    // Create scales
    const x = d3.scaleBand()
                .domain([genre1, genre2])
                .range([margin.left, width - margin.right])
                .padding(0.4);

    const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height - margin.bottom, margin.top]);

    // Append x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    // Append y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));

    // Append y-axis label
    svg.append("text")
       .attr("x", -height / 2)
       .attr("y", margin.left - 50)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .attr("transform", "rotate(-90)")
       .text("Energy");

    // Create boxplot elements
    stats.forEach((stat, i) => {
        const group = svg.append("g").attr("transform", `translate(${x(stat.genre)},0)`);

        // Append vertical line
        group.append("line")
             .attr("x1", x.bandwidth() / 2)
             .attr("x2", x.bandwidth() / 2)
             .attr("y1", y(stat.min))
             .attr("y2", y(stat.max))
             .attr("stroke", "black");

        // Append box
        group.append("rect")
             .attr("x", 0)
             .attr("y", y(stat.q3))
             .attr("width", x.bandwidth())
             .attr("height", y(stat.q1) - y(stat.q3))
             .attr("stroke", "black")
             .attr("fill", i === 0 ? "steelblue" : "green");

        // Append median line
        group.append("line")
             .attr("x1", 0)
             .attr("x2", x.bandwidth())
             .attr("y1", y(stat.median))
             .attr("y2", y(stat.median))
             .attr("stroke", "black");
    });

    // Calculate the absolute difference between medians
    const medianDiff = Math.abs(stats[0].median - stats[1].median).toFixed(2);

    // Add annotation
    const annotation = svg.append("g")
                         .attr("transform", `translate(${width - margin.right - 20},${height - margin.bottom / 2 - 75})`);

    annotation.append("rect")
              .attr("x", -150)
              .attr("y", -25)
              .attr("width", 250)
              .attr("height", 50)
              .attr("fill", "white")
              .attr("stroke", "black");

    annotation.append("text")
              .attr("x", -25)
              .attr("y", 0)
              .attr("text-anchor", "middle")
              .attr("alignment-baseline", "middle")
              .attr("class", "annotation")
              .text(`Difference in medians of energy: ${medianDiff}`);
}

function setupGenreSelects() {
    const genres = Array.from(new Set(data.map(d => d["top genre"])));
    genres.forEach(genre => {
        d3.select("#genreSelect1").append("option").text(genre).attr("value", genre);
        d3.select("#genreSelect2").append("option").text(genre).attr("value", genre);
    });
}

function updateBoxPlot() {
    createBoxPlot();
}

// Call the setup functions when the page loads
if (!data) {
    d3.csv("top_spotify.csv").then(loadedData => {
        data = loadedData;
        filteredData = data; 
        setupFilters();
        setupGenreSelects();
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}

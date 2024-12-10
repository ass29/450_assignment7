import React, {Component} from "react";
import * as d3 from "d3";

class Child1 extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            colorScale: "Sentiment",
            selectedTweets: [],
        };

        this.svgContainer = React.createRef();
    }

    componentDidMount()
    {
        this.createVisualization();
    }

    componentDidUpdate(prevProps, prevState)
    {
        if (prevProps.csv_data !== this.props.csv_data || prevState.colorScale !== this.state.colorScale)
        {
            this.createVisualization();
        }
    }

    createVisualization()
    {
        const data = this.props.csv_data;
        const width = 700;
        const height = 1000;
        const monthHeight = 250;
        const marginLeft = 100;
        const marginRight = 100;
        const graphWidth = width - marginLeft - marginRight;

        const svg = d3.select(this.svgContainer.current)
            .attr("width", width)
            .attr("height", height);

        const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["green", "#ECECEC", "red"]);
        const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["green", "#ECECEC", "red"]);

        const colorScale = this.state.colorScale === "Sentiment" ? sentimentColorScale : subjectivityColorScale;

        const months = ["March", "April", "May"];
        const yScale = d3.scaleBand()
            .domain(months)
            .range([0, height])
            .padding(0.4);

        const monthBounds = {
            March: {top: 0, bottom: yScale("March") + yScale.bandwidth()},
            April: {top: yScale("March") + yScale.bandwidth(), bottom: yScale("April") + yScale.bandwidth()},
            May: {top: yScale("April") + yScale.bandwidth(), bottom: height},
        };

        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(graphWidth / 2 + marginLeft).strength(0.05))
            .force("y", d3.forceY(d => yScale(d.Month) + yScale.bandwidth() / 2).strength(0.3))
            .force("collide", d3.forceCollide(15))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const tweetCircles = svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", (d) => colorScale(d[this.state.colorScale]))
            .attr("stroke", "none")
            .on("click", (event, d) => this.handleTweetClick(d, event, tweetCircles));

        simulation.nodes(data).on("tick", () =>
        {
            tweetCircles.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);

            tweetCircles.each(function (d)
            {
                const yPos = d.y;
                if (yPos < monthBounds[d.Month].top)
                {
                    d.y = monthBounds[d.Month].top;
                } else if (yPos > monthBounds[d.Month].bottom)
                {
                    d.y = monthBounds[d.Month].bottom;
                }
            });
        });

        const monthLabels = svg.selectAll(".monthLabel")
            .data(months)
            .enter().append("text")
            .attr("class", "monthLabel")
            .attr("x", marginLeft - 10)
            .attr("y", (d, i) => yScale(d) + yScale.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .text((d) => d)
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "black");

        const legendWidth = 20;
        const legendHeight = 100;
        const legendMargin = 20;

        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendWidth - legendMargin}, 50)`);

        const legendScale = d3.scaleLinear().domain([-1, 0, 1]).range([legendHeight, 0]);

        const legendAxis = d3.axisRight(legendScale).ticks(5);

        legend.append("g")
            .call(legendAxis);

        legend.selectAll("rect")
            .data([-1, 0, 1])
            .enter().append("rect")
            .attr("x", -10)
            .attr("y", (d) => legendScale(d))
            .attr("width", 10)
            .attr("height", legendHeight / 5)
            .attr("fill", (d) => colorScale(d));
    }

    handleTweetClick(tweet, event, tweetCircles)
    {
        const selectedTweets = [...this.state.selectedTweets];
        const index = selectedTweets.findIndex((t) => t.idx === tweet.idx);

        if (index === -1)
        {
            selectedTweets.unshift(tweet);
            d3.select(event.target).attr("stroke", "black");
        } else
        {
            selectedTweets.splice(index, 1);
            d3.select(event.target).attr("stroke", "none");
        }

        this.setState({selectedTweets});
    }

    handleColorChange = (event) =>
    {
        this.setState({colorScale: event.target.value});
    };

    render()
    {
        return (
            <div>
                <div>
                    <label>Select Color Scale: </label>
                    <select value={this.state.colorScale} onChange={this.handleColorChange}>
                        <option value="Sentiment">Sentiment</option>
                        <option value="Subjectivity">Subjectivity</option>
                    </select>
                </div>
                <svg ref={this.svgContainer}></svg>
                <div>
                    <h3>Selected Tweets:</h3>
                    {this.state.selectedTweets.map((tweet, index) => (
                        <div key={index} style={{border: "1px solid black", margin: "5px", padding: "10px"}}>
                            <p><strong>Raw Tweet:</strong> {tweet.RawTweet}</p>
                            <p><strong>Month:</strong> {tweet.Month}</p>
                            <p><strong>Sentiment:</strong> {tweet.Sentiment}</p>
                            <p><strong>Subjectivity:</strong> {tweet.Subjectivity}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default Child1;

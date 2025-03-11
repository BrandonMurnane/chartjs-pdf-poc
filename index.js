const QuickChart = require('quickchart-js');
const PDFDocument = require('pdfkit');
const svgToPdf = require('svg-to-pdfkit');
const fs = require('fs');
const vega = require('vega');
const vl = require('vega-lite');

const command = process.argv[2];
const outputFilename = process.argv[3] || (command === 'quickchart' ? 'quickchart.pdf' : 'vega.pdf');

(async () => {
    try {
        if (command === 'quickchart') {
            const desiredWidth = 800;
            const scaleFactor = 2;
            const bufferWidth = desiredWidth * scaleFactor;
            const defaultHeight = 600;
            const bufferHeight = defaultHeight * scaleFactor;

            const qc = new QuickChart();
            qc.setConfig({
                type: 'horizontalBar',
                data: {
                    labels: ['Haggis', 'Irnbru', 'Vegetables', 'Black Pudding', 'Fish'],
                    datasets: [
                        {
                            label: 'Sane',
                            data: [12, 19, 3, 5, 20],
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Insane',
                            data: [2, 3, 20, 15, 2],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        xAxes: [{
                            stacked: true,
                            ticks: { beginAtZero: true },
                            scaleLabel: { display: true, labelString: 'Types of People' }
                        }],
                        yAxes: [{
                            stacked: true,
                            barPercentage: 0.5,
                            categoryPercentage: 1.0,
                            scaleLabel: { display: true, labelString: 'Food' }
                        }]
                    }
                }
            });
            qc.setWidth(bufferWidth);
            qc.setHeight(bufferHeight);
            qc.setDevicePixelRatio(scaleFactor);
            qc.setFormat('svg');
            qc.setBackgroundColor('transparent');
            const svgBuffer = await qc.toBinary();
            const svgString = svgBuffer.toString();
            fs.writeFileSync('chart_quickchart.svg', svgString);
            console.log('SVG file saved as chart_quickchart.svg');

            const doc = new PDFDocument({ autoFirstPage: false });
            const pdfStream = fs.createWriteStream(outputFilename);
            doc.pipe(pdfStream);
            doc.addPage({ size: [desiredWidth, defaultHeight] });
            svgToPdf(doc, svgString, 0, 0, { width: desiredWidth, height: defaultHeight });
            doc.lineWidth(2);
            doc.rect(0, 0, desiredWidth, defaultHeight).stroke();
            doc.end();

            pdfStream.on('finish', () => {
                console.log(`PDF file created: ${outputFilename}`);
            });
        } else if (command === 'vega') {
            const desiredWidth = 800;

            const vlSpec = {
                "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
                "width": desiredWidth,
                "height": { "step": 40 },
                "data": {
                    "values": [
                        {"Food": "Haggis", "Sane": 12, "Insane": 2},
                        {"Food": "Irnbru", "Sane": 19, "Insane": 3},
                        {"Food": "Vegetables", "Sane": 3, "Insane": 20},
                        {"Food": "Black Pudding", "Sane": 5, "Insane": 15},
                        {"Food": "Fish", "Sane": 20, "Insane": 2}
                    ]
                },
                "transform": [
                    { "fold": ["Sane", "Insane"], "as": ["Type", "Value"] }
                ],
                "mark": "bar",
                "encoding": {
                    "x": {
                        "field": "Value",
                        "type": "quantitative",
                        "stack": "zero",
                        "title": "Types of People"
                    },
                    "y": {
                        "field": "Food",
                        "type": "nominal",
                        "title": "Food"
                    },
                    "color": {
                        "field": "Type",
                        "type": "nominal",
                        "scale": { "range": ["rgba(255,99,132,0.5)", "rgba(54,162,235,0.5)"] },
                        "legend": { "title": "Type" }
                    }
                }
            };

            const compiled = vl.compile(vlSpec).spec;
            const view = new vega.View(vega.parse(compiled), { renderer: "none" });
            const svgString = await view.toSVG();
            fs.writeFileSync('chart_vega.svg', svgString);
            console.log('SVG file saved as chart_vega.svg');
            //https://vega.github.io/vega-lite/docs/size.html#specifying-responsive-width-and-height
            const numCategories = 5;
            const step = 40;
            const chartHeight = numCategories * step;

            const doc = new PDFDocument({ autoFirstPage: false });
            const pdfStream = fs.createWriteStream(outputFilename);
            doc.pipe(pdfStream);
            doc.addPage({ size: [desiredWidth, chartHeight] });
            svgToPdf(doc, svgString, 0, 0, { width: desiredWidth, height: chartHeight });
            doc.lineWidth(2);
            doc.rect(0, 0, desiredWidth, chartHeight).stroke();
            doc.end();

            pdfStream.on('finish', () => {
                console.log(`PDF file created: ${outputFilename}`);
            });
        }
    } catch (error) {
        console.error('Error creating chart PDF:', error);
    }
})();

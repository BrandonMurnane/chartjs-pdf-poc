const QuickChart = require('quickchart-js');
const PDFDocument = require('pdfkit');
const svgToPdf = require('svg-to-pdfkit');
const fs = require('fs');

const outputFilename = process.argv[2] || 'chart.pdf';

(async () => {
    try {
        const desiredWidth = 800;
        const defaultHeight = 600;

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
                        ticks: {beginAtZero: true, fontSize: 18, fontStyle: "bold",},
                        scaleLabel: {
                            display: true,
                            labelString: 'Amount of People',
                            fontSize: 20,
                            fontStyle: "bold",
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        barPercentage: 0.5,
                        categoryPercentage: 1.0,
                        ticks: {fontSize: 18, fontStyle: "bold",},
                        scaleLabel: {
                            display: true,
                            labelString: 'Food Item',
                            fontSize: 20,
                            fontStyle: "bold",
                        }
                    }]
                }
            }
        });
        qc.setWidth(desiredWidth);
        qc.setHeight(defaultHeight);
        qc.setFormat('svg');
        qc.setBackgroundColor('transparent');

        const svgBuffer = await qc.toBinary();
        const svgString = svgBuffer.toString();
        fs.writeFileSync('chart.svg', svgString);
        console.log('SVG file saved as chart.svg');

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
    } catch (error) {
        console.error('Error creating chart PDF:', error);
    }
})();

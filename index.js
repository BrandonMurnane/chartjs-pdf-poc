const QuickChart = require('quickchart-js');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const outputFilename = process.argv[2] || 'chart.pdf';

(async () => {
    try {
        const displayChartWidth = 800;
        const displayChartHeight = 600;
        const scaleFactor = 2;
        const bufferWidth = displayChartWidth * scaleFactor;
        const bufferHeight = displayChartHeight * scaleFactor;

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
                        ticks: { beginAtZero: true , fontSize: 18, fontStyle: "bold", },
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
                        ticks: { fontSize: 18, fontStyle: "bold", },
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
        qc.setWidth(bufferWidth);
        qc.setHeight(bufferHeight);
        qc.setDevicePixelRatio(scaleFactor);
        qc.setBackgroundColor('transparent');
        const imageBuffer = await qc.toBinary();

        const doc = new PDFDocument({ autoFirstPage: false });
        const pdfStream = fs.createWriteStream(outputFilename);
        doc.pipe(pdfStream);
        doc.addPage({ size: [displayChartWidth, displayChartHeight] });
        doc.image(imageBuffer, 0, 0, { width: displayChartWidth, height: displayChartHeight });
        doc.lineWidth(2);
        doc.rect(0, 0, displayChartWidth, displayChartHeight).stroke();
        doc.save();
        doc.opacity(0.3);
        doc.fontSize(96).fillColor('gray');
        const centerX = displayChartWidth / 2;
        const centerY = displayChartHeight / 2;
        doc.rotate(45, { origin: [centerX, centerY] });
        doc.text('Confidential', 0, centerY - 48, { width: displayChartWidth, align: 'center' });
        doc.restore();
        doc.end();

        pdfStream.on('finish', () => {
            console.log(`PDF file created: ${outputFilename}`);
        });
    } catch (error) {
        console.error('Error creating chart PDF:', error);
    }
})();

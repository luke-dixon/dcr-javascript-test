const form = document.getElementById("chart-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();


    const chart = document.getElementById("chart");
    chart.replaceChildren();

    const formData = new FormData(event.target, event.submitter);
    createChart(dataProcessors[formData.get("dataChoice")]);
});


const dataProcessors = {
    population: {
        getData: (data) => data,
        label: (d) => [d.name, d.population.toLocaleString("en")].join("\n"),
        value: (d) => d.population,
        group: (d) => d.region,
    },
    numBorders: {
        getData: (data) => data,
        label: (d) => [d.name, d.borders.length].join("\n"),
        value: (d) => d.borders.length,
        group: (d) => d.region,
    },
    numTimezones: {
        getData: (data) => data,
        label: (d) => [d.name, d.timezones.length].join("\n"),
        value: (d) => d.timezones.length,
        group: (d) => d.region,
    },
    numLanguages: {
        getData: (data) => data,
        label: (d) => [d.name, d.languages.length].join("\n"),
        value: (d) => d.languages.length,
        group: (d) => d.region,
    },
    regionNumCountries: {
        getData: (data) => {
            const regions = {};
            for (const country of data) {
                if (country.region in regions) {
                    regions[country.region].value++;
                } else {
                    regions[country.region] = {
                        name: country.region,
                        value: 1,
                    };
                }
            }
            return Object.values(regions);
        },
        label: (d) => [d.name, d.value].join("\n"),
        value: (d) => d.value,
        group: (d) => d.name,
    },
    regionNumTimezones: {
        getData: (data) => {
            const regions = {};
            for (const country of data) {
                if (country.region in regions) {
                    const timezones = regions[country.region].timezones;
                    for (const timezone of country.timezones) {
                        timezones.add(timezone);
                    }
                    regions[country.region].value = timezones.size;
                } else {
                    const timezones = new Set(country.timezones);
                    regions[country.region] = {
                        name: country.region,
                        timezones: timezones,
                        value: timezones.size,
                    };
                }
            }
            return Object.values(regions);
        },
        label: (d) => [d.name, d.value].join("\n"),
        value: (d) => d.value,
        group: (d) => d.name,
    },
};

let data = null;

async function loadData() {
    if (!data) {
        return await d3.json("../data/countries.json");
    } else {
        return data;
    }
}

async function createChart(processor) {

    const chart = BubbleChart(processor.getData(await loadData()), {
        label: processor.label,
        value: processor.value,
        group: processor.group,
    });

    document.getElementById("chart").appendChild(chart);
}

createChart(dataProcessors.population);

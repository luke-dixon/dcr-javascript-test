const form = document.getElementById("chart-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();


    const chart = document.getElementById("chart");
    chart.replaceChildren();

    const tableContainer = document.getElementById("table-container");
    tableContainer.replaceChildren();

    const formData = new FormData(event.target, event.submitter);
    createChart(dataProcessors[formData.get("dataChoice")]);
    addTable(dataProcessors[formData.get("dataChoice")]);
});


function getRegionData(data) {
    const regions = {};
    for (const country of data) {
        if (country.region in regions) {
            const timezones = regions[country.region].timezones;
            for (const timezone of country.timezones) {
                timezones.add(timezone);
            }
            regions[country.region]["unique timezones"] = timezones.size;
            regions[country.region].countries++;
        } else {
            const timezones = new Set(country.timezones);
            regions[country.region] = {
                name: country.region,
                countries: 1,
                timezones: timezones,
                "unique timezones": timezones.size,
            };
        }
    }
    return Object.values(regions);
}


function countryToolTip(country) {
    const info = [
        `Name: ${country.name}`,
        `Population: ${country.population}`,
        `Capital: ${country.capital}`,
        `Region: ${country.region}`,
        `Currencies: ${country.currencies.map(c => c.code).join(", ")}`,
    ];
    return info.join("\n");
}

function regionToolTip(region) {
    const info = [
        `Name: ${region.name}`,
        `Countries: ${region.countries}`,
        `Unique timezones: ${region["unique timezones"]}`,
    ];
    return info.join("\n");
}


const dataProcessors = {
    population: {
        getData: (data) => data,
        label: (d) => [d.name, d.population.toLocaleString("en")].join("\n"),
        value: (d) => d.population,
        group: (d) => d.region,
        tableHeaders: ["name", "population"],
        tableRow: (d) => [d.name, d.population],
        title: countryToolTip,
    },
    numBorders: {
        getData: (data) => data,
        label: (d) => [d.name, d.borders.length].join("\n"),
        value: (d) => d.borders.length,
        group: (d) => d.region,
        tableHeaders: ["name", "borders"],
        tableRow: (d) => [d.name, d.borders.length],
        title: countryToolTip,
    },
    numTimezones: {
        getData: (data) => data,
        label: (d) => [d.name, d.timezones.length].join("\n"),
        value: (d) => d.timezones.length,
        group: (d) => d.region,
        tableHeaders: ["name", "timezones"],
        tableRow: (d) => [d.name, d.timezones.length],
        title: countryToolTip,
    },
    numLanguages: {
        getData: (data) => data,
        label: (d) => [d.name, d.languages.length].join("\n"),
        value: (d) => d.languages.length,
        group: (d) => d.region,
        tableHeaders: ["name", "languages"],
        tableRow: (d) => [d.name, d.languages.length],
        title: countryToolTip,
    },
    regionNumCountries: {
        getData: getRegionData,
        label: (d) => [d.name, d.countries].join("\n"),
        value: (d) => d.countries,
        group: (d) => d.name,
        tableHeaders: ["name", "countries"],
        tableRow: (d) => [d.name, d.countries],
        title: regionToolTip,
    },
    regionNumTimezones: {
        getData: getRegionData,
        label: (d) => [d.name, d["unique timezones"]].join("\n"),
        value: (d) => d["unique timezones"],
        group: (d) => d.name,
        tableHeaders: ["name", "unique timezones"],
        tableRow: (d) => [d.name, d["unique timezones"]],
        title: regionToolTip,
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
        title: processor.title,
    });

    document.getElementById("chart").appendChild(chart);
}

function createTable() {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    return [table, thead, tbody];
}

function createTableRow(headers, elementType) {
    const row = document.createElement("tr");
    for (const header of headers) {
        const th = document.createElement(elementType);
        row.appendChild(th);
        th.appendChild(document.createTextNode(header));
    }

    return row;
}

async function addTable(processor) {
    const data = processor.getData(await loadData());

    const [table, thead, tbody] = createTable();

    thead.appendChild(createTableRow(processor.tableHeaders, "th"));
    for (const row of data) {
        const rowData = processor.tableRow(row);
        tbody.appendChild(createTableRow(rowData, "td"));
    }

    document.getElementById("table-container").appendChild(table);
}

createChart(dataProcessors.population);
addTable(dataProcessors.population);

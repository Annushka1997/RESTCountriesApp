"use strict";

// Variables 

const tableContainer = document.querySelector("#wrapperBody");
const dataTable = document.querySelector("#dataTable");
const paginationContainer = document.querySelector("#paginationContainer");
const rowsPerPageSelect = document.querySelector("#rowsPerPageSelect");
const searchBtn = document.querySelector("#searchBtn");

const minRowsPerPage = 5;
let rowsPerPage = 10;
const maxRowsPerPage = 15;

let currentPage = 1;
let totalPages = 0;

let activeColumn = "";
let sortDirection = "";

// Functions 

// Get Data Function 
async function fetchData() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = response.json();
        return data;
    } catch (error) {
        console.log("Error while getting data from server");
    }
}

// function for create cells 

function createCells(data, i = 0) {
    const row = dataTable.lastElementChild.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();
    const cell4 = row.insertCell();
    const cell5 = row.insertCell();
    cell1.textContent = data[i].name.common;
    cell2.textContent = data[i].altSpellings[0];
    cell3.textContent = data[i].capital;
    cell4.textContent = data[i].population;
    if (data[i].currencies && Object.keys(data[i].currencies) instanceof Array) {
        cell5.textContent = Object.keys(data[i].currencies)[0];
    }
}

// create button function 

function createBtn() {
    return document.createElement("button");
}

// create span element function 

function createSpanElement() {
    return document.createElement("span");
}

// Rendering Data Function 
function renderData(data) {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;


    while (dataTable.rows.length > 1) {
        dataTable.deleteRow(1);
    }

    // For loop for creating cells 
    for (let i = startIndex; i < endIndex && i < data.length; i++) {
        createCells(data, i);
    }

    // Pagination

    while (paginationContainer.firstChild) {
        paginationContainer.firstChild.remove();
    }

    // create prev Page Button 
    const prevPageButton = createBtn();
    prevPageButton.textContent = "<";
    prevPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderData(data);
        }
    });
    paginationContainer.appendChild(prevPageButton);


    // create first page button

    let startButton = 1;
    let endButton = totalPages;

    if (totalPages > 5) {
        if (currentPage <= 3) {
            endButton = 5;
        } else if (currentPage >= totalPages - 2) {
            startButton = totalPages - 4;
        } else {
            startButton = currentPage - 2;
            endButton = currentPage + 2;
        }
    }

    if (startButton > 1) {
        const firstPageButton = createBtn();
        firstPageButton.textContent = 1;
        firstPageButton.addEventListener("click", () => {
            currentPage = 1;
            renderData(data);
        });
        paginationContainer.appendChild(firstPageButton);

        if (startButton > 2) {
            const dots = createSpanElement();
            dots.textContent = "...";
            paginationContainer.appendChild(dots);
        }
    }

    // create buttons with for loop

    for (let i = startButton; i <= endButton; i++) {
        const button = createBtn();
        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("current-page");
        }

        button.addEventListener("click", () => {
            currentPage = i;
            renderData(data);
        });

        paginationContainer.appendChild(button);
    }

    // create end dots 

    if (endButton < totalPages) {
        if (endButton < totalPages - 1) {
            const dots = createSpanElement();
            dots.textContent = "...";
            paginationContainer.appendChild(dots);
        }

        const lastPageButton = createBtn();
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener("click", () => {
            currentPage = totalPages;
            renderData(data);
        });
        paginationContainer.appendChild(lastPageButton);
    }

    // Create next page button
    const nextPageButton = createBtn();
    nextPageButton.textContent = ">";
    nextPageButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderData(data);
        }
    });
    paginationContainer.appendChild(nextPageButton);

    // create last page button 

    const goToLastPageButton = createBtn();
    goToLastPageButton.textContent = ">>";
    goToLastPageButton.addEventListener("click", () => {
        currentPage = totalPages;
        renderData(data);
    });

    paginationContainer.appendChild(goToLastPageButton);

    const currentPageSpan = createSpanElement();
    currentPageSpan.textContent = `Current Page: ${currentPage}`;
    paginationContainer.appendChild(currentPageSpan);
}

// Change Rows Per Page Function 
function changeRowsPerPage() {
    rowsPerPage = parseInt(rowsPerPageSelect.value);
    currentPage = 1;
    fetchData().then((data) => {
        updatePageParameters(data);
        renderData(data);
    });
    changeColorOfSelectedSortButton();
}


function updatePageParameters(data) {
    totalPages = Math.ceil(data.length / rowsPerPage);

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
}

// Search country Function 

function searchCountry(url) {
    while (dataTable.rows.length > 1) {
        dataTable.deleteRow(1);
    }

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            createCells(data);
        })
        .catch((error) => {
            alert("You have entered incorrect data,please check and enter again");
            window.location.reload();
        });

    searchBtn.value = "";
    changeColorOfSelectedSortButton();
}

// Function to change the color of the selected row

function changeSelectRowColor(event) {
    const row = event.target.parentNode;

    if (row.tagName === "TR") {
        const rows = dataTable.querySelectorAll("tbody tr");

        rows.forEach((row) => {
            row.classList.remove("selected");
        });

        row.classList.add("selected");
    }
}

// Sorting data functions 

function sortData(data, column, direction) {
    data.sort((a, b) => {
        const valueA = getValueByColumn(a, column);
        const valueB = getValueByColumn(b, column);

        if (direction === "desc") {
            return compareValues(valueA, valueB);
        } else if (direction === "asc") {
            return compareValues(valueB, valueA);
        }

        return 0;
    });
}

function getValueByColumn(item, column) {
    const columnMappings = {
        name: item.name.common,
        altSpellings: item.altSpellings,
        capital: item.capital,
        population: item.population,
        currencies: item.currencies ? Object.keys(item.currencies)[0] : ""
    };

    return columnMappings[column] || "";
}

function compareValues(valueA, valueB) {
    if (valueA > valueB) {
        return -1;
    } else if (valueA < valueB) {
        return 1;
    }

    return 0;
}

async function sortColumn(column, dir) {

    if (sortDirection === dir) {
        window.location.reload();
    }

    activeColumn = column;
    sortDirection = dir;

    await fetchData()
        .then((data) => {
            sortData(data, activeColumn, sortDirection);
            renderData(data);
        })
        .catch((error) => {
            console.log("Error while sorting data");
        });
}

function changeColorOfSelectedSortButton(btn) {
    const buttons = document.querySelectorAll("th button");
    buttons.forEach(button => {
        button.classList.remove("select");
    });
    btn.classList.add("select");
}

async function init() {
    const data = await fetchData();
    updatePageParameters(data);
    renderData(data);

    rowsPerPageSelect.value = rowsPerPage;
    rowsPerPageSelect.addEventListener("change", changeRowsPerPage);
    searchBtn.addEventListener("change", () => {
        searchCountry(`https://restcountries.com/v3.1/name/${searchBtn.value}?fullText=true`);
    });
    dataTable.addEventListener("click", (event) => {
        changeSelectRowColor(event);
    });

    const headers = [
        { id: "nameHeader", column: "name" },
        { id: "altSpellingsHeader", column: "altSpellings" },
        { id: "capitalHeader", column: "capital" },
        { id: "populationHeader", column: "population" },
        { id: "currenciesHeader", column: "currencies" }
    ];

    headers.forEach((header) => {
        const element = document.querySelector(`#${header.id}`);
        element.addEventListener("click", (event) => {
            sortColumn(header.column, event.target.dataset.sortDirection);
            changeColorOfSelectedSortButton(event.target);
        });
    });
}

init();
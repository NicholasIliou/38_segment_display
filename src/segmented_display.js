// Variables to store patterns and the number of displays
let patterns = {};
let numberOfDisplays;
let lastDisplayedContent = ""; // Store the last content of displayed.txt

// Utility function to handle fetch requests
function fetchJson(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load resource.");
            return response.json();
        })
        .catch(err => {
            console.error('Error loading resource:', err);
            alert("Failed to load resource.");
        });
}

// Function to get the required number of displays (defaults to the length of displayed.txt)
function getDisplayNumber(display_count = null) {
    if (display_count === null) {
        return getTextFromFile('../displayed.txt').then(content => {
            return content.length; // Use the length of the content in displayed.txt as the display number
        });
    } else {
        return display_count; // Use the provided display count if it's specified
    }
}

// Function to load patterns (from patterns.json)
function loadPatterns(filePath) {
    fetchJson(filePath).then(configs => {
        patterns = configs;
    });
}

// Function to create a display dynamically
function createDisplay(displayId) {
    const container = document.createElement('div');
    container.id = `svg-container-${displayId}`;
    container.classList.add('svg-display');
    document.getElementById('svg-container-wrapper').appendChild(container);

    loadSvgDesign(container);
}

// Function to load SVG design and initialize interactive segments
function loadSvgDesign(container) {
    fetch('./src/PEKSEG.svg')
        .then(response => response.text())
        .then(svgText => {
            container.innerHTML = svgText;
            const svg = container.querySelector("svg");
            initializeSvgSegments(svg);
        })
        .catch(console.error);
}

// Function to initialize interactive segments in the SVG
function initializeSvgSegments(svg) {
    let index = 0;
    svg.querySelectorAll("polygon, rect, path").forEach(el => {
        el.id = `segment-${index++}`;
        //el.style.cursor = "pointer";
        //el.addEventListener("click", () => el.classList.toggle("active"));
    });
}

// Function to handle search from button click
function getTextFromButton() {
    const button = document.getElementById("search-pattern");
    button.addEventListener("click", function() {
        const buttonText = document.getElementById("search-query").value.trim().toLowerCase();
        handleSearch(buttonText);
    });
}

// Function to get text from a file (automatically on page load)
function getTextFromFile(filePath) {
    return fetch(filePath)
        .then(response => response.ok ? response.text() : Promise.reject("File not found"))
        .then(data => data.trim().toLowerCase())
        .catch(error => {
            console.error("Error:", error);
            displaySearchResult("Error reading file: " + error);
        });
}

// Function to display the search results
function displaySearchResult(resultText) {
    const resultDiv = document.getElementById("search-result");
    resultDiv.innerHTML = resultText;
}

// Function to handle the search logic and apply patterns to displays
function handleSearch(query) {
    const resultDiv = document.getElementById("search-result");

    if (!query) {
        resultDiv.innerHTML = "Please enter a search query.";
        return;
    }

    // Clear the display first to reset it
    clearDisplay();

    const characters = query.split('');
    const totalDisplays = numberOfDisplays;

    characters.forEach((char, index) => {
        const displayId = index % totalDisplays + 1;
        applyPatternToDisplay(char, displayId);
    });
}

// Function to apply the selected pattern to the corresponding display
function applyPatternToDisplay(char, displayId) {
    const matchedConfig = findPatternForCharacter(char);

    if (matchedConfig) {
        updateDisplayWithPattern(matchedConfig, displayId);
        displaySearchResult(`Found configuration: ${matchedConfig.name}`);
    } else {
        displaySearchResult("No matching configuration found.");
    }
}

// Function to find a matching pattern for a given character
function findPatternForCharacter(char) {
    return Object.keys(patterns).find(configName => {
        return configName.toLowerCase().includes(char);
    });
}

// Function to update the display with the matched pattern
function updateDisplayWithPattern(matchedConfig, displayId) {
    const selectedConfig = patterns[matchedConfig];
    const displayContainer = document.getElementById(`svg-container-${displayId}`);
    
    displayContainer.querySelectorAll("polygon, rect, path").forEach(el => {
        const segmentId = el.id;
        const isActive = selectedConfig[segmentId] || false;
        el.classList.toggle("active", isActive);
    });
}

// Function to clear all displays before applying new patterns
function clearDisplay() {
    const displayContainers = document.querySelectorAll('.svg-display');
    displayContainers.forEach(container => {
        container.querySelectorAll("polygon, rect, path").forEach(el => {
            el.classList.remove("active");  // Remove the active class to reset the display
        });
    });
}

// Function to initialize the search mechanism (file load or button click)
function initializeSearch() {
    getTextFromFile('../displayed.txt')
        .then(query => handleSearch(query))
        .catch(error => displaySearchResult("Error reading file: " + error));

    getTextFromButton();
}

// Function to initialize the app when DOM is loaded
function initializeApp() {
    // Set the number of displays either from the length of displayed.txt or a specified number
    getDisplayNumber().then(displayCount => {
        numberOfDisplays = displayCount;
        loadPatterns('./src/patterns.json');

        // Create the displays dynamically
        for (let i = 1; i <= numberOfDisplays; i++) {
            createDisplay(i);
        }

        // Initialize search functionality
        initializeSearch();
    });
}

// Initialize the app once DOM content is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
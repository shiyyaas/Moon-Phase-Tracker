// =============================================================================
// MOON PHASE TRACKER - CLEAN & COMMENTED VERSION
// =============================================================================

// Configuration object - stores all our app settings in one place
// This makes it easy to change settings without hunting through the code
const API_CONFIG = {
    BASE_URL: 'https://api.apiverve.com/v1/moonphases', // The API endpoint we'll call
    API_KEY: 'Add your KEY HERE', // Replace with your actual API key
    STORAGE_KEY: 'moonPhaseData' // Key name for storing data in localStorage
};

// =============================================================================
// DATE UTILITIES - Functions for working with dates
// =============================================================================

const DateUtils = {
    // Always return date in YYYY-MM-DD format
    formatDate(date) {
        return date.toISOString().split('T')[0]; // "2025-09-06"
    },

    // Get today's date as YYYY-MM-DD
    getTodayString() {
        return this.formatDate(new Date());
    },

    // Gets a future date string by adding days to today
    getFutureDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return this.formatDate(date);
    }
};

// =============================================================================
// STORAGE UTILITIES - Functions for saving/loading data from browser storage
// =============================================================================

const StorageUtils = {
    getData() {
        const data = localStorage.getItem(API_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },
    saveData(dateString, moonData) {
        const existingData = this.getData();
        existingData[dateString] = moonData;
        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(existingData));
    },
    hasDataForDate(dateString) {
        const data = this.getData();
        return data[dateString] !== undefined;
    }
};

// =============================================================================
// API UTILITIES - Functions for calling the moon phase API
// =============================================================================

const MoonAPI = {
    async fetchMoonPhase(dateString) {
        const response = await fetch(`${API_CONFIG.BASE_URL}?date=${dateString}`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_CONFIG.API_KEY,
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch moon phase data for ${dateString}. Status: ${response.status}`);
        }
        return await response.json();
    }
};

// =============================================================================
// UI UTILITIES - Functions for updating what the user sees
// =============================================================================

const UIUtils = {
    createMoonDisplay(dateString, moonData) {
        return `
            <div class="flex flex-col gap-3 items-center mb-6">
                <div class="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">              
                    ${moonData.data.phaseEmoji}
                </div>
                <p class="text-gray-700">${dateString}: ${moonData.data.phase}</p>
            </div>
        `;
    },
    createErrorDisplay(message) {
        return `
            <div class="flex flex-col gap-3 items-center mb-6">
                <p class="text-gray-700">${message}</p>
            </div>
        `;
    },
    showLoading(buttonId, loadingText = 'Loading...') {
        const button = document.getElementById(buttonId);
        button.disabled = true;
        button.textContent = loadingText;
        document.getElementById('spinner').classList.remove('hidden');
        document.getElementById('spinner').classList.add('block');
    },
    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        button.disabled = false;
        button.textContent = originalText;
        document.getElementById('spinner').classList.add('hidden');
        document.getElementById('spinner').classList.remove('block');
    },
    showResults() {
        const resultsContainer = document.getElementById('Sdays');
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('flex');
    },
    hideResults() {
        const resultsContainer = document.getElementById('Sdays');
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('flex');
    },
    clearResults() {
        document.getElementById('Sdays').innerHTML = '';
    }
};

// =============================================================================
// MAIN FUNCTIONALITY - Core features of the app
// =============================================================================

const MoonPhaseTracker = {
    async loadTodaysMoonPhase() {
        const today = DateUtils.getTodayString();
        try {
            let moonData;
            if (StorageUtils.hasDataForDate(today)) {
                console.log('Using cached data for today');
                const savedData = StorageUtils.getData();
                moonData = savedData[today];
            } else {
                console.log('Fetching fresh data for today');
                moonData = await MoonAPI.fetchMoonPhase(today);
                StorageUtils.saveData(today, moonData);
            }
            document.getElementById('nowmoon').innerHTML = UIUtils.createMoonDisplay(today, moonData);
        } catch (error) {
            console.error('Error loading today\'s moon phase:', error);
            document.getElementById('nowmoon').innerHTML = UIUtils.createErrorDisplay(error.message);
        }
    },

    async loadNextSevenDays() {
        console.log('Loading next 7 days...');
        UIUtils.showLoading('7btn');
        UIUtils.hideResults();
        UIUtils.clearResults();
        const container = document.getElementById('Sdays');

        for (let i = 1; i <= 7; i++) {
            try {
                const dateString = DateUtils.getFutureDateString(i);
                console.log(`Checking cache for ${dateString}...`);

                let moonData;
                if (StorageUtils.hasDataForDate(dateString)) {
                    console.log(`Using cached data for ${dateString}`);
                    const savedData = StorageUtils.getData();
                    moonData = savedData[dateString];
                } else {
                    console.log(`Fetching fresh data for ${dateString}`);
                    moonData = await MoonAPI.fetchMoonPhase(dateString);
                    StorageUtils.saveData(dateString, moonData);
                }

                container.innerHTML += `
                    <div class="flex text-gray-700 my-10">
                        ${UIUtils.createMoonDisplay(dateString, moonData)}
                    </div>
                `;

            } catch (error) {
                console.error(`Error fetching data for ${dateString}:`, error);
                container.innerHTML += `
                    <div class="flex flex-col items-center my-3 mx-3">
                        <p class="text-gray-700">${error.message}</p>
                    </div>
                `;
            }
        }

        UIUtils.hideLoading('7btn', 'Get Next Week');
        UIUtils.showResults();
        console.log('Finished loading next 7 days');
    },

    async loadCustomDate() {
        const customDateInput = document.getElementById('customDate');
        if (!customDateInput.value) {
            alert('Please select a date!');
            return;
        }
        const customDate = DateUtils.formatDate(new Date(customDateInput.value));

        console.log(`Loading custom date: ${customDate}`);
        UIUtils.showLoading('customBtn');
        UIUtils.hideResults();

        try {
            let moonData;
            if (StorageUtils.hasDataForDate(customDate)) {
                console.log(`Using cached data for ${customDate}`);
                const savedData = StorageUtils.getData();
                moonData = savedData[customDate];
            } else {
                console.log(`Fetching fresh data for ${customDate}`);
                moonData = await MoonAPI.fetchMoonPhase(customDate);
                StorageUtils.saveData(customDate, moonData);
            }

            document.getElementById('Sdays').innerHTML = `
                <div class="flex text-gray-700 my-10">
                    ${UIUtils.createMoonDisplay(customDate, moonData)}
                </div>
            `;

            UIUtils.showResults();
            console.log('Successfully loaded custom date');

        } catch (error) {
            console.error('Error loading custom date:', error);
            document.getElementById('Sdays').innerHTML = UIUtils.createErrorDisplay(error.message);
            UIUtils.showResults();
        }

        UIUtils.hideLoading('customBtn', 'Get CustomDate');
    }
};

// =============================================================================
// EVENT LISTENERS AND INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing moon tracker...');
    MoonPhaseTracker.loadTodaysMoonPhase();
});

// =============================================================================
// GLOBAL FUNCTIONS - These are called by HTML button clicks
// =============================================================================

function Smoon() {
    console.log('User clicked Get Next Week button');
    MoonPhaseTracker.loadNextSevenDays();
}

function Cmoon() {
    console.log('User clicked Get CustomDate button');
    MoonPhaseTracker.loadCustomDate();
}

// =============================================================================
// END OF FILE
// =============================================================================

// Pro tip: Open browser developer tools (F12) to see console.log messages
// This helps with debugging and understanding what's happening!

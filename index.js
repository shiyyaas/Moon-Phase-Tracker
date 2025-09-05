// Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.apiverve.com/v1/moonphases',
    API_KEY: 'Add your KEY HERE', // Replace with your actual API key
    STORAGE_KEY: 'moonPhaseData'
};

// Utility Functions
const DateUtils = {
    getTodayString() {
        return new Date().toLocaleDateString();
    },
    
    getFutureDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toLocaleDateString();
    }
};

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

// API Functions
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

// UI Functions
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

// Main Moon Phase Functions
const MoonPhaseTracker = {
    async loadTodaysMoonPhase() {
        const today = DateUtils.getTodayString();
        
        try {
            let moonData;
            
            if (StorageUtils.hasDataForDate(today)) {
                const savedData = StorageUtils.getData();
                moonData = savedData[today];
            } else {
                moonData = await MoonAPI.fetchMoonPhase(today);
                StorageUtils.saveData(today, moonData);
            }
            
            document.getElementById('nowmoon').innerHTML = UIUtils.createMoonDisplay(today, moonData);
            
        } catch (error) {
            document.getElementById('nowmoon').innerHTML = UIUtils.createErrorDisplay(error.message);
        }
    },
    
    async loadNextSevenDays() {
        UIUtils.showLoading('7btn');
        UIUtils.hideResults();
        UIUtils.clearResults();
        
        const container = document.getElementById('Sdays');
        
        for (let i = 1; i <= 7; i++) {
            try {
                const dateString = DateUtils.getFutureDateString(i);
                const moonData = await MoonAPI.fetchMoonPhase(dateString);
                
                container.innerHTML += `
                    <div class="flex text-gray-700 my-10">
                        ${UIUtils.createMoonDisplay(dateString, moonData)}
                    </div>
                `;
                
            } catch (error) {
                container.innerHTML += `
                    <div class="flex flex-col items-center my-3 mx-3">
                        <p class="text-gray-700">${error.message}</p>
                    </div>
                `;
            }
        }
        
        UIUtils.hideLoading('7btn', 'Get Next Week');
        UIUtils.showResults();
    },
    
    async loadCustomDate() {
        const customDateInput = document.getElementById('customDate');
        const customDate = customDateInput.value;
        
        if (!customDate) {
            alert('Please select a date!');
            return;
        }
        
        UIUtils.showLoading('customBtn');
        UIUtils.hideResults();
        
        try {
            const moonData = await MoonAPI.fetchMoonPhase(customDate);
            
            document.getElementById('Sdays').innerHTML = `
                <div class="flex text-gray-700 my-10">
                    ${UIUtils.createMoonDisplay(customDate, moonData)}
                </div>
            `;
            
            UIUtils.showResults();
            
        } catch (error) {
            document.getElementById('Sdays').innerHTML = UIUtils.createErrorDisplay(error.message);
            UIUtils.showResults();
        }
        
        UIUtils.hideLoading('customBtn', 'Get CustomDate');
    }
};

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
    MoonPhaseTracker.loadTodaysMoonPhase();
});

// Global functions for button clicks (referenced in HTML)
function Smoon() {
    MoonPhaseTracker.loadNextSevenDays();
}

function Cmoon() {
    MoonPhaseTracker.loadCustomDate();
}
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

// Utility Functions for Date operations
const DateUtils = {
    // Gets today's date as a string (like "12/25/2023")
    // Uses browser's default locale format
    getTodayString() {
        return new Date().toLocaleDateString();
    },
    
    // Gets a future date string by adding days to today
    // Example: getFutureDateString(5) gives date 5 days from now
    // Parameter: daysFromNow - how many days to add to today
    getFutureDateString(daysFromNow) {
        const date = new Date(); // Start with today's date
        date.setDate(date.getDate() + daysFromNow); // Add the specified number of days
        return date.toLocaleDateString(); // Return as formatted string
    }
};

// =============================================================================
// STORAGE UTILITIES - Functions for saving/loading data from browser storage
// =============================================================================

// Functions to handle localStorage operations (saving/loading data)
// localStorage keeps data even after browser closes
const StorageUtils = {
    // Gets all saved moon data from localStorage
    // Returns empty object {} if no data exists yet
    getData() {
        const data = localStorage.getItem(API_CONFIG.STORAGE_KEY); // Get saved data
        return data ? JSON.parse(data) : {}; // Parse JSON string back to object, or return empty object
    },
    
    // Saves moon data for a specific date to localStorage
    // Example: saveData("12/25/2023", moonDataObject)
    // Parameters: dateString - the date, moonData - the data to save
    saveData(dateString, moonData) {
        const existingData = this.getData(); // Get all currently saved data
        existingData[dateString] = moonData; // Add new data for this specific date
        // Convert object back to JSON string and save to localStorage
        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(existingData));
    },
    
    // Checks if we already have data saved for a specific date
    // This helps us avoid unnecessary API calls
    // Returns true if data exists, false if not
    hasDataForDate(dateString) {
        const data = this.getData(); // Get all saved data
        return data[dateString] !== undefined; // Check if this date exists in saved data
    }
};

// =============================================================================
// API UTILITIES - Functions for calling the moon phase API
// =============================================================================

// Functions for making API calls to get moon phase data from external service
const MoonAPI = {
    // Fetches moon phase data for a specific date from the API
    // This is an async function because API calls take time
    // Parameter: dateString - date like "12/25/2023"
    // Returns: moon phase data object
    async fetchMoonPhase(dateString) {
        // Make HTTP GET request to the API with the date parameter
        const response = await fetch(`${API_CONFIG.BASE_URL}?date=${dateString}`, {
            method: 'GET', // We're requesting data (not sending data)
            headers: {
                'X-API-Key': API_CONFIG.API_KEY, // Authentication header required by API
            }
        });
        
        // Check if the HTTP request was successful (status 200-299)
        if (!response.ok) {
            // If not successful, throw an error with details
            throw new Error(`Failed to fetch moon phase data for ${dateString}. Status: ${response.status}`);
        }
        
        // Convert the response from JSON string to JavaScript object and return it
        return await response.json();
    }
};

// =============================================================================
// UI UTILITIES - Functions for updating what the user sees
// =============================================================================

// Functions for updating the user interface (DOM manipulation)
const UIUtils = {
    // Creates HTML string for displaying moon phase information
    // Parameters: dateString - the date, moonData - moon phase data from API
    // Returns: HTML string that can be inserted into the page
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
    
    // Creates HTML string for showing error messages to user
    // Parameter: message - the error message to display
    // Returns: HTML string with error styling
    createErrorDisplay(message) {
        return `
            <div class="flex flex-col gap-3 items-center mb-6">
                <p class="text-gray-700">${message}</p>
            </div>
        `;
    },
    
    // Shows loading state - disables button and shows spinning animation
    // Parameters: buttonId - ID of button to disable, loadingText - text to show on button
    showLoading(buttonId, loadingText = 'Loading...') {
        const button = document.getElementById(buttonId); // Get the button element
        button.disabled = true; // Prevent user from clicking while loading
        button.textContent = loadingText; // Change button text to show loading
        
        // Show the spinning loading gif by changing CSS classes
        document.getElementById('spinner').classList.remove('hidden'); // Make visible
        document.getElementById('spinner').classList.add('block'); // Display as block element
    },
    
    // Hides loading state - enables button and hides spinner
    // Parameters: buttonId - ID of button to enable, originalText - original button text
    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId); // Get the button element
        button.disabled = false; // Allow user to click again
        button.textContent = originalText; // Restore original button text
        
        // Hide the spinning loading gif by changing CSS classes
        document.getElementById('spinner').classList.add('hidden'); // Hide from view
        document.getElementById('spinner').classList.remove('block'); // Remove block display
    },
    
    // Shows the results container where moon phases are displayed
    showResults() {
        const resultsContainer = document.getElementById('Sdays'); // Get results container
        resultsContainer.classList.remove('hidden'); // Make it visible
        resultsContainer.classList.add('flex'); // Apply flexbox layout for proper display
    },
    
    // Hides the results container
    hideResults() {
        const resultsContainer = document.getElementById('Sdays'); // Get results container
        resultsContainer.classList.add('hidden'); // Hide it from view
        resultsContainer.classList.remove('flex'); // Remove flex layout
    },
    
    // Clears all content from results container
    // Useful when loading new data to remove old results
    clearResults() {
        document.getElementById('Sdays').innerHTML = ''; // Set content to empty string
    }
};

// =============================================================================
// MAIN FUNCTIONALITY - Core features of the app
// =============================================================================

// Main functions that handle the core app functionality
// This is where the magic happens!
const MoonPhaseTracker = {
    
    // Loads and displays today's moon phase when page loads
    // This function runs automatically when the page opens
    async loadTodaysMoonPhase() {
        const today = DateUtils.getTodayString(); // Get today's date as string
        
        try { // Try to load moon data, catch any errors
            let moonData; // Variable to store the moon phase data
            
            // Check if we already have today's data saved locally (caching)
            // This makes the app faster and reduces API calls
            if (StorageUtils.hasDataForDate(today)) {
                console.log('Using cached data for today'); // Debug message
                // Use saved data (faster, no internet request needed)
                const savedData = StorageUtils.getData();
                moonData = savedData[today];
            } else {
                console.log('Fetching fresh data for today'); // Debug message
                // Fetch fresh data from API (requires internet)
                moonData = await MoonAPI.fetchMoonPhase(today);
                // Save it for next time to avoid future API calls
                StorageUtils.saveData(today, moonData);
            }
            
            // Display the moon phase in the 'nowmoon' container on the page
            document.getElementById('nowmoon').innerHTML = UIUtils.createMoonDisplay(today, moonData);
            
        } catch (error) {
            // If anything goes wrong (no internet, API error, etc.), show error message
            console.error('Error loading today\'s moon phase:', error);
            document.getElementById('nowmoon').innerHTML = UIUtils.createErrorDisplay(error.message);
        }
    },
    
    // Loads moon phases for the next 7 days when user clicks "Get Next Week"
    // This function makes 7 separate API calls (one for each day)
    async loadNextSevenDays() {
        console.log('Loading next 7 days...'); // Debug message
        
        // Show loading state to user
        UIUtils.showLoading('7btn'); // Disable button and show "Loading..."
        UIUtils.hideResults(); // Hide any previous results
        UIUtils.clearResults(); // Remove old content
        
        const container = document.getElementById('Sdays'); // Get container for results
        
        // Loop through next 7 days (1=tomorrow, 2=day after tomorrow, etc.)
        for (let i = 1; i <= 7; i++) {
            try {
                // Get date string for day i days from now
                const dateString = DateUtils.getFutureDateString(i);
                console.log(`Fetching data for ${dateString}...`); // Debug message
                
                // Fetch moon data for this specific date
                const moonData = await MoonAPI.fetchMoonPhase(dateString);
                
                // Add this day's moon phase to the display
                // Using += to add to existing content (building up the list)
                container.innerHTML += `
                    <div class="flex text-gray-700 my-10">
                        ${UIUtils.createMoonDisplay(dateString, moonData)}
                    </div>
                `;
                
            } catch (error) {
                // If this specific date fails, show error but continue with other dates
                console.error(`Error fetching data for day ${i}:`, error);
                container.innerHTML += `
                    <div class="flex flex-col items-center my-3 mx-3">
                        <p class="text-gray-700">${error.message}</p>
                    </div>
                `;
            }
        }
        
        // All done! Hide loading and show results
        UIUtils.hideLoading('7btn', 'Get Next Week'); // Re-enable button
        UIUtils.showResults(); // Make results visible
        console.log('Finished loading next 7 days'); // Debug message
    },
    
    // Loads moon phase for user-selected custom date
    // This runs when user picks a date and clicks "Get CustomDate"
    async loadCustomDate() {
        // Get the date input element and its value
        const customDateInput = document.getElementById('customDate');
        const customDate = customDateInput.value;
        
        // Check if user actually selected a date (validation)
        if (!customDate) {
            alert('Please select a date!'); // Show popup message
            return; // Exit function early - don't continue
        }
        
        console.log(`Loading custom date: ${customDate}`); // Debug message
        
        // Show loading state to user
        UIUtils.showLoading('customBtn'); // Disable button and show "Loading..."
        UIUtils.hideResults(); // Hide any previous results
        
        try {
            // Fetch moon data for the user-selected date
            const moonData = await MoonAPI.fetchMoonPhase(customDate);
            
            // Display the result (replace any existing content)
            document.getElementById('Sdays').innerHTML = `
                <div class="flex text-gray-700 my-10">
                    ${UIUtils.createMoonDisplay(customDate, moonData)}
                </div>
            `;
            
            UIUtils.showResults(); // Make results visible
            console.log('Successfully loaded custom date'); // Debug message
            
        } catch (error) {
            // Show error if something goes wrong (bad date, API error, etc.)
            console.error('Error loading custom date:', error);
            document.getElementById('Sdays').innerHTML = UIUtils.createErrorDisplay(error.message);
            UIUtils.showResults(); // Still show the container (with error message)
        }
        
        // Hide loading state (whether successful or not)
        UIUtils.hideLoading('customBtn', 'Get CustomDate');
    }
};

// =============================================================================
// EVENT LISTENERS AND INITIALIZATION
// =============================================================================

// This section handles when functions should run

// Event listener for when the HTML page finishes loading
// 'DOMContentLoaded' fires when HTML is ready (but before images/CSS finish loading)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing moon tracker...'); // Debug message
    // Automatically load today's moon phase when page opens
    MoonPhaseTracker.loadTodaysMoonPhase();
});

// =============================================================================
// GLOBAL FUNCTIONS - These are called by HTML button clicks
// =============================================================================

// These functions are referenced in your HTML onclick attributes
// They need to be global (not inside objects) so HTML can find them

// When user clicks "Get Next Week" button (onclick="Smoon()")
function Smoon() {
    console.log('User clicked Get Next Week button'); // Debug message
    MoonPhaseTracker.loadNextSevenDays(); // Call the main function
}

// When user clicks "Get CustomDate" button (onclick="Cmoon()")
function Cmoon() {
    console.log('User clicked Get CustomDate button'); // Debug message
    MoonPhaseTracker.loadCustomDate(); // Call the main function
}

// =============================================================================
// END OF FILE
// =============================================================================

// Pro tip: Open browser developer tools (F12) to see console.log messages
// This helps with debugging and understanding what's happening!
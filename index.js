    let today = new Date();
      // For today's moon data (nowmoondata)
        async function nowmoon() {
            // FETCHING DATE FOR TODAY DISPLAY
                const response = await fetch('https://api.apiverve.com/v1/moonphases', {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'Add your KEY HERE',
                    }
                    });
                const nowmoondata = await response.json();
                if (!response.ok) {
                    throw new Error(`Failed to fetch Today's moon phase data : CODE : ${response.status}`);
                }else {return nowmoondata;}
               }
      // For displaying nowmoondata
        function displaynowmoon(data,today) {
          const container = document.getElementById('nowmoon');
          
          container.innerHTML = `
          <div class="flex flex-col gap-3 items-center mb-6">
            <div class="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">              
            ${data.data.phaseEmoji}
            </div>
            <p class="text-gray-700">${today}: ${data.data.phase}</p>
          </div>
          `;
        }
        // This works onstart or reload
        document.addEventListener('DOMContentLoaded', function() {  
          nowmoon().then(nowmoondata => {
                today = today.toLocaleDateString();
                displaynowmoon(nowmoondata,today);
            }).catch(error => {
                document.getElementById('nowmoon').innerHTML = `
                <div class="flex flex-col gap-3 items-center mb-6">
                    <p class="text-gray-700">${error.message}</p>
                </div>
                `;
            });
        });


      // For Next 7days with button
        async function Smoon() {
            const button = document.getElementById('7btn');
            // Disable button and show loading
            button.disabled = true;
            button.textContent = 'Loading...';
            document.getElementById('spinner').classList.add('block');
            document.getElementById('spinner').classList.remove('hidden');
            // Hiding results
            document.getElementById('Sdays').classList.add('hidden');
            document.getElementById('Sdays').classList.remove('flex');
            // Clearing before once again
            const container1 = document.getElementById('Sdays');
            container1.innerHTML = '';
            for (let i = 1; i <= 7; i++) { 
                    // GETTING 7 DATES
                    let cptoday = new Date(); 
                    cptoday.setDate(cptoday.getDate() + i);
                    const nextdayF = cptoday.toLocaleDateString(); // Format the new date as a string
                    // FETCHING THE DATA
                    const response = await fetch(`https://api.apiverve.com/v1/moonphases?date=${nextdayF}`, {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'Add your KEY HERE',
                    }
                    });
                    const Smoondata = await response.json();
                    if (!response.ok) {
                        document.getElementById('Sdays').innerHTML += `
                        <div class="flex flex-col  items-center my-3 mx-3">
                            <p class="text-gray-700">Failed to fetch moon phase data for ${nextdayF}</p>
                            <p class="text-gray-700"> CODE : ${response.status}</p>
                        </div>
                        `;
                        continue; // Skip to the next iteration if there's an error
                    }
                    // DISPLAYING THE DATA
                    const container1 = document.getElementById('Sdays');
                    container1.innerHTML += `
                        <div class="flex text-gray-700 my-10">
                            <div class="flex flex-col gap-3 items-center mb-6">
                                <div class="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">
                                ${Smoondata.data.phaseEmoji}
                                </div>
                                <p class="text-gray-700">${nextdayF} : ${Smoondata.data.phase}</p>
                            </div>
                        </div> 
                    `;
                }

                // Hiding loading 
                button.disabled = false;
                button.textContent = 'Get Next Week';
                document.getElementById('spinner').classList.add('hidden');
                document.getElementById('spinner').classList.remove('block');
                // Showing result
                document.getElementById('Sdays').classList.remove('hidden');
                document.getElementById('Sdays').classList.add('flex');
        }

        // For custom date with button
        async function Cmoon() {
            const button = document.getElementById('customBtn');
            // Disable button and show loading
            button.disabled = true;
            button.textContent = 'Loading...';
            document.getElementById('spinner').classList.add('block');
            document.getElementById('spinner').classList.remove('hidden');
            // Hiding results
            document.getElementById('Sdays').classList.add('hidden');
            document.getElementById('Sdays').classList.remove('flex');

                    // GETTING CUSTOM DATES
                     let customDate = document.getElementById("customDate").value;
                    if (customDate === "") {
                        alert("Select a date brohhhhhh");
                            button.disabled = false;
                            button.textContent = 'Get CustomDate';
                            document.getElementById('spinner').classList.add('hidden');
                            document.getElementById('spinner').classList.remove('block');
                        return;
                    }
                    // FETCHING THE DATA
                    const response = await fetch(`https://api.apiverve.com/v1/moonphases?date=${customDate}`, {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'Add your KEY HERE',
                    }
                    });
                    const Cmoondata = await response.json();
                    if (!response.ok) {
                        document.getElementById('Sdays').innerHTML = `
                        <div class="flex flex-col  items-center my-3 mx-3">
                            <p class="text-gray-700">Failed to fetch moon phase data for ${customDate}</p>
                            <p class="text-gray-700"> CODE : ${response.status}</p>
                        </div>
                        `;
                    }else {
                        // DISPLAYING THE DATA
                    const container1 = document.getElementById('Sdays');
                    container1.innerHTML = `
                        <div class="flex text-gray-700 my-10">
                            <div class="flex flex-col gap-3 items-center mb-6">
                                <div class="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">
                                ${Cmoondata.data.phaseEmoji}
                                </div>
                                <p class="text-gray-700">${customDate} : ${Cmoondata.data.phase}</p>
                            </div>
                        </div> 
                    `;
                    }
                    
            // Hiding loading 
            button.disabled = false;
            button.textContent = 'Get CustomDate';
            document.getElementById('spinner').classList.add('hidden');
            document.getElementById('spinner').classList.remove('block');
            // Showing result
            document.getElementById('Sdays').classList.remove('hidden');
            document.getElementById('Sdays').classList.add('flex');
            }
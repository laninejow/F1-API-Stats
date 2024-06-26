document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    const value = urlParams.get('value');

    const header = document.querySelector('h1');
    header.textContent = `Driver Information: ${value}`;

    let apiUrl;

    if (filter === 'year') {
        apiUrl = `https://ergast.com/api/f1/${value}/drivers.json`;
    } else if (filter === 'race') {
        apiUrl = `https://ergast.com/api/f1/${new Date().getFullYear()}.json`;
    } else {
        console.error('Invalid filter type');
        return;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let drivers;
            if (filter === 'year') {
                drivers = data.MRData.DriverTable.Drivers;
            } else if (filter === 'race') {
                const races = data.MRData.RaceTable.Races;
                const race = races.find(race => race.raceName.toLowerCase().includes(value.toLowerCase()));
                if (race) {
                    fetch(`https://ergast.com/api/f1/${race.season}/${race.round}/results.json`)
                        .then(response => response.json())
                        .then(raceData => {
                            const results = raceData.MRData.RaceTable.Races[0].Results;
                            drivers = results.map(result => result.Driver);
                            displayDrivers(drivers, race.season);
                        })
                        .catch(error => {
                            console.error('Error fetching race results:', error);
                        });
                } else {
                    displayDrivers([]);
                }
                return;
            }

            displayDrivers(drivers, value);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    function displayDrivers(drivers, year) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        if (!drivers || drivers.length === 0) {
            resultsContainer.innerHTML = '<p>No drivers found for the given criteria.</p>';
            return;
        }

        drivers.forEach(driver => {
            const driverElement = document.createElement('div');
            driverElement.classList.add('accordion-item');

            const header = document.createElement('div');
            header.classList.add('accordion-header');

            const driverSection = document.createElement('div');
            driverSection.classList.add('driver-section');

            const driverImg = document.createElement('div');
            driverImg.classList.add('driver-img');
            const img = document.createElement('img');
            img.src = 'https://via.placeholder.com/150';
            img.alt = driver.givenName + ' ' + driver.familyName;
            driverImg.appendChild(img);
            driverSection.appendChild(driverImg);

            const driverInfo = document.createElement('div');
            driverInfo.classList.add('driver-info');
            const name = document.createElement('h5');
            name.classList.add('driver-name');
            name.textContent = driver.givenName + ' ' + driver.familyName;
            const team = document.createElement('p');
            team.classList.add('driver-team');
            team.textContent = 'Team: Loading...';
            driverInfo.appendChild(name);
            driverInfo.appendChild(team);
            driverSection.appendChild(driverInfo);
            header.appendChild(driverSection);

            const stat = document.createElement('div');
            stat.classList.add('stat');
            const statTitle = document.createElement('h5');
            statTitle.textContent = 'STATS';
            const icon = document.createElement('div');
            icon.classList.add('icon');
            const iconI = document.createElement('i');
            iconI.classList.add('fa-solid', 'fa-chevron-down');
            icon.appendChild(iconI);
            stat.appendChild(statTitle);
            stat.appendChild(icon);
            header.appendChild(stat);

            const content = document.createElement('div');
            content.classList.add('accordion-content');
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('accordion-content-container');

            const statInfo1 = document.createElement('div');
            statInfo1.classList.add('stat-info');
            const finishingPosition = document.createElement('h5');
            finishingPosition.textContent = 'Finishing Position';
            const position = document.createElement('h5');
            position.classList.add('driver-position');
            statInfo1.appendChild(finishingPosition);
            statInfo1.appendChild(position);
            contentContainer.appendChild(statInfo1);

            const statInfo2 = document.createElement('div');
            statInfo2.classList.add('stat-info');
            const bestLap = document.createElement('h5');
            bestLap.textContent = 'Best Lap';
            const bestLapTime = document.createElement('h5');
            bestLapTime.classList.add('driver-best-lap');
            statInfo2.appendChild(bestLap);
            statInfo2.appendChild(bestLapTime);
            contentContainer.appendChild(statInfo2);

            content.appendChild(contentContainer);
            driverElement.appendChild(header);
            driverElement.appendChild(content);
            resultsContainer.appendChild(driverElement);

            getDriverImage(driver.givenName + ' ' + driver.familyName).then(imageUrl => {
                img.src = imageUrl;
            });

            fetch(`https://ergast.com/api/f1/${year}/drivers/${driver.driverId}/results.json`)
                .then(response => response.json())
                .then(resultData => {
                    const results = resultData.MRData.RaceTable.Races;
                    if (results.length > 0) {
                        const lastResult = results[results.length - 1];
                        const teamData = lastResult.Results[0].Constructor;

                        team.textContent = `Team: ${teamData.name}`;
                        position.textContent = `${lastResult.Results[0].position}`;
                        bestLapTime.textContent = `${lastResult.Results[0].FastestLap ? lastResult.Results[0].FastestLap.Time.time : 'N/A'}`;
                    } else {
                        team.textContent = `Team: N/A`;
                        position.textContent = `Position: N/A`;
                        bestLapTime.textContent = `Best Lap Time: N/A`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching driver details:', error);
                });


            header.addEventListener('click', function() {
                content.classList.toggle('active');
                iconI.classList.toggle('fa-chevron-up');
                iconI.classList.toggle('fa-chevron-down');
            });
        });
    }

    function getDriverImage(driverName) {
        const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(driverName)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
        return fetch(wikiApiUrl)
            .then(response => response.json())
            .then(data => {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== "-1" && pages[pageId].thumbnail) {
                    return pages[pageId].thumbnail.source;
                } else {
                    return 'https://via.placeholder.com/150';
                }
            })
            .catch(error => {
                console.error('Error fetching driver image:', error);
                return 'https://via.placeholder.com/150'; 
            });
    }
});
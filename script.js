// Constants
const accessToken = 'patNkyNhVTMFiKXiz.b06ff5b3991622f39b55e55e26b2ce5f70477676101aec12e98087a82174a1f6';
const baseId = 'appLTBaBJFNVw60lg';
const tableName = 'Grid View';
const pageSize = 20;  // Adjust as needed
let currentPage = 0;

// Function to fetch data from Airtable
async function fetchData(filterQuery = '') {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?pageSize=${pageSize}${filterQuery}`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const data = await response.json();
    return { records: data.records, totalRecords: data.totalRecords };
}

// Function to display gallery items
async function displayGallery(filterQuery = '') {
    const { records, totalRecords } = await fetchData(filterQuery);
    const gallery = document.getElementById('gallery');
    const noDataMessage = document.getElementById('noDataMessage');

    if (records.length === 0) {
        noDataMessage.textContent = "No data found for the selected filters.";
        gallery.innerHTML = ''; // Clear existing gallery content
    } else {
        noDataMessage.textContent = ''; // Clear no data message if data is found
        gallery.innerHTML = records.map(record => {
            const imageUrl = record.fields["Image/Video"][0].url;
            const title = record.fields.Title;
            const medium = record.fields.Medium;
            const size = record.fields.Size;
            const dataYear = record.fields.Year;
            const availability = record.fields.Availability ? 'Available' : 'Sold Out';
            return `<div class="item" data-year=${dataYear}" >
                        <img src="${imageUrl}" alt="${title}" onclick="showArtDetails('${imageUrl}', '${title}', '${medium}', '${size}', '${availability}')">
                    </div>`;
        }).join('');
    }
}

// Show artwork details in popup
function showArtDetails(imageUrl, title, medium, size, availability) {
    const modal = document.getElementById('myModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalMedium = document.getElementById('modalMedium');
    const modalSize = document.getElementById('modalSize');
    const modalAvailability = document.getElementById('modalAvailability');

    modalImage.src = imageUrl;
    modalTitle.textContent = title;
    modalMedium.textContent = `Medium: ${medium}`;
    modalSize.textContent = `Size: ${size}`;
    modalAvailability.textContent = `Availability: ${availability}`;

    modal.style.display = 'block';
}

// Close the modal popup
const closeBtn = document.getElementsByClassName('close')[0];
closeBtn.onclick = function () {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

// Handle form submission
const form = document.getElementById('enquiryForm');
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });

    const requestBody = {
        "fields": formDataObject
    };

    const url = `https://api.airtable.com/v0/${baseId}/Artwork%20Enquiries`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            alert('Enquiry submitted successfully!');
            const modal = document.getElementById('myModal');
            modal.style.display = 'none';
        } else {
            const errorMessage = await response.json();
            throw new Error(errorMessage.error.message);
        }
    } catch (error) {
        alert(`Error submitting enquiry: ${error.message}`);
    }
});

// Function to apply filters
function applyFilters() {
    const yearFilter = document.getElementById('filteryear').value;
    const digitalOrPaintingFilter = document.getElementById('digitalorpainting').value;
    const exhibitionFilter = document.getElementById('filterExhibitionName').value;
    const availabilityFilter = document.getElementById('filterAvailability').value;
    const subjectFilter = document.getElementById('filterSubject').value;
    const seriesFilter = document.getElementById('filterSeries').value;

    // Constructing the filter query
    let filterQuery = '';
    let filters = [];

    if (yearFilter) {
        if (yearFilter === '2000-2010') {
            filters.push(`AND(Year >= 2000, Year <= 2010)`);
        } else if (yearFilter === '2010-2020') {
            filters.push(`AND(Year >= 2010, Year <= 2020)`);
        } else if (yearFilter === '2020-present') {
            filters.push(`Year >= 2020`);
        }
    }
    if (digitalOrPaintingFilter) filters.push(`SEARCH("${digitalOrPaintingFilter}", {Digital/Painting})`);
    if (exhibitionFilter) filters.push(`SEARCH("${exhibitionFilter}", {Exhibition name})`);
    if (availabilityFilter) filters.push(`SEARCH("${availabilityFilter}", {Availability})`);
    if (subjectFilter) {
        const subjectFilters = subjectFilter.split(',').map(subject => `SEARCH("${subject.trim()}", {Subject})`);
        filters.push(`OR(${subjectFilters.join(',')})`);
    }
    if (seriesFilter) filters.push(`SEARCH("${seriesFilter}", {Series})`);

    if (filters.length > 0) {
        filterQuery = `&filterByFormula=${encodeURIComponent(`AND(${filters.join(',')})`)}`;
    }

    // Display filtered gallery
    displayGallery(filterQuery);
}


// Initial call to populate gallery
document.addEventListener('DOMContentLoaded', () => displayGallery());

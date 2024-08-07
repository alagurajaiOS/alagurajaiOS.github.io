const API_KEY = 'AIzaSyDZb5krlWYbeYGi9WtCNcgxlYKEpIjV8GQ';
const SHEET_ID = '1uMyS5z1HGJm3_s71JGrvv0UsN-dM-CHsIiNtjrcoMuw';

const shortsData = [];
const youtubeData = [];
const blogsData = [];


// Example of how to fetch data from Google Sheets API
async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    //return data.values;
    console.log("data",data.values);
    extractUrls(data.values);
}

function extractUrls(data) {

    // Assuming the first row contains headers
    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Check if the row has at least one URL
        if (row[0]) {
            youtubeData.push(row[0]);
        }

        if (row[1]) {
            shortsData.push(row[1]);
        }
        if (row[2]) {
            blogsData.push(row[2]);
        }
    }
    console.log("youtubeData",youtubeData);
    console.log("shorts",shortsData);
    console.log("blogsData",blogsData);
    loadMedia('youtube');
    //return { youtubeUrls, reelsUrls };
}

function extractYoutubeVideoId(url) {
    const urlParams = new URLSearchParams(new URL(url).search);
    const videoId = urlParams.get('v') || url.split('/').pop();
    return videoId ? videoId.replace(/[^a-zA-Z0-9_-]/g, '') : null;
}

async function getYoutubeThumbnail(url) {
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    // Directly construct the thumbnail URL for YouTube Shorts
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Return or log the URL
    console.log('Thumbnail URL:', thumbnailUrl);
    return thumbnailUrl;
}

// async function getYoutubeThumbnail(url) {
//     const videoId = extractYoutubeVideoId(url);
//     if (!videoId) {
//         throw new Error('Invalid YouTube URL');
//     }
//     try {
//         console.log('URL:', url);  // Debugging step
//         console.log('videoID:', videoId);  // Debugging step
//         const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log('API response:', data);  // Debugging step
//         if (data.items && data.items.length > 0) {
//             return data.items[0].snippet.thumbnails.maxres.url;
//         } else {
//             throw new Error('No thumbnail found');
//         }
//     } catch (error) {
//         console.error('Error fetching YouTube thumbnail:', error);  // Debugging step
//         throw error;
//     }
// }

// function extractYoutubeVideoId(url) {
//     const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|v\/|embed\/)|youtu\.be\/)([^#&?\/]+)/;
//     const matches = url.match(regex);
//     return matches ? matches[1] : null;
// }


async function fetchMetadata(url) {
    const apiKey = 'cf1d574f-66f6-4bed-9eff-0a130fe4eba4'; // Replace with your Open Graph API key
    const apiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        
        const data = await response.json();
        console.log('meta_data',data)

        const title = data.hybridGraph.title;
        const image = data.hybridGraph.image;
        const description = data.hybridGraph.description;

        return { title, image, description };
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return null;
    }
}


// function getReelThumbnail(reelUrl) {
//     // const reelUrl = document.getElementById('reelUrl').value;
//     const reelId = extractReelId(reelUrl);

//     if (reelId) {
//         const thumbnailUrl = `https://www.instagram.com/p/${reelId}/media/?size=l`; // This URL might need to be adapted
//         console.log('instaThumbnail',thumbnailUrl)
//         return thumbnailUrl
//         // document.getElementById('thumbnail').src = thumbnailUrl;
//         // document.getElementById('thumbnail').style.display = 'block';
//     } else {
//         alert('Invalid URL or reel ID extraction failed.');
//     }
// }

// function extractReelId(url) {
//     const regex = /instagram\.com\/reel\/([^\/?]+)/;
//     const matches = url.match(regex);
//     return matches ? matches[1] : null;
// }


const mediaGrid = document.getElementById('mediaGrid');
const tabs = document.querySelectorAll('.tab');

async function loadMedia(mediaType) {
    mediaGrid.innerHTML = '';
    let data = [];
    if (mediaType === 'reels') {
        data = shortsData;
        mediaGrid.classList.remove('youtube', 'article');
        mediaGrid.classList.add('reels');
    } else if (mediaType === 'youtube') {
        data = youtubeData;
        mediaGrid.classList.remove('reels', 'article');
        mediaGrid.classList.add('youtube');
    } else {
        data = blogsData
        mediaGrid.classList.remove('reels', 'youtube');
        mediaGrid.classList.add('article');
        // mediaGrid.innerHTML = '<p>No articles available.</p>';
    }

    if (mediaType === 'reels' || mediaType === 'youtube') {
        for (const url of data) {
            let thumbnailUrl = '';
            if (mediaType === 'youtube') {
                mediaGrid.classList.remove('media-grid-reels', 'media-grid-article');
                mediaGrid.classList.add('media-grid')

                thumbnailUrl = await getYoutubeThumbnail(url);
            } else if (mediaType === 'reels') {
                mediaGrid.classList.remove('media-grid', 'media-grid-article');
                mediaGrid.classList.add('media-grid-reels')
                thumbnailUrl = await getYoutubeThumbnail(url);
            }

            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `<img src="${thumbnailUrl}" alt="${mediaType} thumbnail">`;
            mediaItem.addEventListener('click', () => {
                window.open(url, '_blank');
            });
            mediaGrid.appendChild(mediaItem);
        }
    } else if (mediaType == 'article') {
        mediaGrid.classList.remove('media-grid', 'media-grid-reels');
        mediaGrid.classList.add('media-grid-article');

        for (const url of data) {
            // const articlePreview = await fetchMetadata(url); // Fetch article metadata
            const data = await fetchMetadata(url);
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <div class="media-grid-article">
                    <img src="${data.image}" alt="${data.title}">
                    <div class="title">${data.title}</div>
                    <div class="description">${data.description}</div>
                </div>`;
            mediaItem.addEventListener('click', () => {
                window.open(url, '_blank');
            });
            mediaGrid.appendChild(mediaItem);
        }
        
    }

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${mediaType}Tab`).classList.add('active');
}
fetchSheetData();
// fetchGoogleSheetData();


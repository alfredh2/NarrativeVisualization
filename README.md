# Spotify Data Visualization Project

Welcome to the Spotify Data Visualization Project! This project aims to explore and analyze the energy levels of songs in various genres on Spotify. Through interactive visualizations, users can discover patterns, trends, and insights about the relationship between energy and other musical features.

Website: https://alfredh2.github.io/NarrativeVisualization/

## Project Overview

The project includes the following interactive visualizations:

### 1. Scatterplot of Energy vs. Decibels
This scatterplot visualizes the relationship between the energy levels and decibels of songs. Users can:
- Filter songs by genre using a dropdown menu.
- Adjust the minimum popularity of songs using a slider.
- Toggle a trend line to see the correlation between energy and decibels.
- Hover over data points to see details about individual songs, including title and artist.

### 2. Bar Chart of Average Energy by Genre
This bar chart shows the average energy levels of different genres. Users can:
- Navigate through different genres using pagination controls to see 20 genres at a time.
- Compare average energy levels across various musical styles.

### 3. Box Plot Comparison of Energy Distribution by Genre
This side-by-side box plot allows users to compare the energy distribution of two selected genres. Users can:
- Select two genres from dropdown menus to see their energy distributions side by side.
- View detailed statistics, including quartiles and medians, for each genre.
- See an annotation highlighting the absolute difference between the medians of the two selected genres.

## How to Use
1. Clone the repository:
   ```bash
   git clone https://github.com/alfredh2/spotify-data-visualization.git
   ```
2. Open the `index.html` file in your web browser to view the visualizations.

## Dependencies
This project uses the following libraries:
- D3.js: For creating the interactive visualizations.

## Files
- `index.html`: The main HTML file containing the structure of the visualizations.
- `styles.css`: The CSS file for styling the visualizations.
- `script.js`: The JavaScript file containing the logic for creating and updating the visualizations.
- `top_spotify.csv`: The dataset containing information about the top Spotify songs.

## Data
The dataset (`top_spotify.csv`) includes the following features:
- `title`: The title of the song.
- `artist`: The artist of the song.
- `top genre`: The genre of the song.
- `popularity`: The popularity score of the song.
- `bpm`: Beats per minute of the song.
- `nrgy`: Energy level of the song.
- `dnce`: Danceability of the song.
- `dB`: Decibel level of the song.
- `live`: Liveness score of the song.
- `val`: Valence score of the song.
- `dur`: Duration of the song.
- `acous`: Acousticness score of the song.
- `spch`: Speechiness score of the song.

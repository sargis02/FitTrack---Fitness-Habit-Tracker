# CSC2406 Assignment 2 – FitTrack

## Student Information

* **Name:** Nafiz Ahmed Sargis
* **Student ID:** U1181036


## Video Demonstration


## Live Project View
[Click to View](https://fittrackbd.vercel.app)



## Project Overview

FitTrack is an interactive Fitness & Habit Tracker web application that allows users to log activities, track progress, and visualise their fitness journey.

The application is built using **HTML5, CSS3, and JavaScript**, focusing on DOM manipulation, event handling, form validation, and data persistence using localStorage.



## Features

### Core Functionality

* Add activities (type, name, duration/quantity, date, notes)
* Edit and delete activities with confirmation
* Display activity list (newest entries first)

### Statistics & Tracking

* Total activities logged
* Weekly and monthly activity counts
* Average duration calculation
* Streak counter (consecutive active days)

### Goal Tracking

* Set goals with target values
* Track progress with percentage
* Visual progress bar

### Filter & Search

* Filter by type (workout / habit / all)
* Filter by date (week / month / all time)
* Search activities by name

### Data Management

* Data saved using localStorage
* Data loads automatically on refresh
* Clear all data button with confirmation

### Bonus Features

* Weekly activity bar chart (built using CSS & JavaScript)
* Export data as JSON
* Export data as CSV



## Technologies Used

* **HTML5** – structure of the application
* **CSS3** – styling, layout, responsive design
* **JavaScript (ES6)** – logic, DOM manipulation, data handling



## Responsiveness

The application is fully responsive and works across:

* Desktop
* Tablet
* Mobile devices



## Browsers Tested

* Google Chrome
* Microsoft Edge
* Mozila Firefox



## Key Design Decisions

* Used a **card-based layout** for better readability and UI organisation
* Implemented **event delegation** for handling dynamic elements efficiently
* Used **localStorage as the main data source** for persistence
* Built a **central filtering function** to keep UI and data consistent
* Structured code into reusable functions for maintainability



## Challenges & Solutions

### 1. localStorage Handling

* **Problem:** localStorage only stores strings
* **Solution:** Used JSON.stringify() and JSON.parse() with try/catch error handling

### 2. Streak Calculation

* **Problem:** Handling date comparisons and edge cases
* **Solution:** Compared dates day-by-day and handled today/yesterday logic

### 3. Filtering System

* **Problem:** Combining multiple filters at once
* **Solution:** Applied filters sequentially in a single function

### 4. CSV Export

* **Problem:** Data breaks when containing commas or quotes
* **Solution:** Escaped values using quotes and double quotes



## AI Usage Declaration

For this assignment, I used AI tools (ChatGPT and GitHub Copilot) as learning support tools only. All HTML, CSS, and JavaScript code in this project was written, tested, and implemented by me.

AI was used in the following ways:

* To understand how to use localStorage correctly, including JSON.stringify() and JSON.parse()
* To learn how to handle errors safely using try/catch so the app would not crash
* To understand date logic for features like weekly calculations and streak tracking
* To structure filtering logic so multiple filters (type, date, search) work together
* To solve issues in implementing the streak counter and handling edge cases
* To implement CSV export and correctly handle commas and quotation marks in user input

Example prompts used:

* How to use localStorage with JSON safely in JavaScript
* How to calculate start of week Monday in JavaScript
* How to build streak counter logic with dates
* How to combine multiple filters in JavaScript array
* How to escape commas and quotes in CSV export JavaScript

GitHub Copilot was used occasionally to provide small suggestions, mainly for JavaScript logic and minor code improvements. All suggestions were carefully reviewed, modified, and rewritten to ensure I fully understood how they worked.

AI was not used to generate full features or complete code solutions. It was only used to support my learning and improve my understanding while developing the project.



## File Structure

```
FitTrack---Fitness-Habit-Tracker/
├── index.html
├── planning.html
├── devlog.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── images/
└── README.md
```




## Declaration

I declare that this assignment is my own work and all sources have been appropriately acknowledged.

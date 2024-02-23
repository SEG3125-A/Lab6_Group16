const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/submit-survey', (req, res) => {
    const surveyResult = req.body;
    saveSurveyResult(surveyResult);
    res.send('Survey submitted successfully!');
});

function saveSurveyResult(result) {
    const surveyResults = loadSurveyResults();
    surveyResults.push(result);
    fs.writeFileSync(path.join(__dirname, 'data', 'survey_results.json'), JSON.stringify(surveyResults));
}

function loadSurveyResults() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'survey_results.json'));
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');
const {json} = require("express");
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/images', express.static('images'))

app.post('/submit-survey', (req, res) => {
    const surveyResult = req.body;
    saveSurveyResult(surveyResult);
    res.send('Survey submitted successfully!');
});


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/results', (req, res) => {

    let results = {
        "impressions": [],
        "navigation": new Map(),
        "designRating": new Map(),
        "features": new Map(),
        "comments": [],
        "recomendation": 0
    }

    let fileResults = loadSurveyResults()

    let recomendationSum = 0
    let avgRecomendation = 0
    for (let i = 0; i < fileResults.length; i++) {
        results.impressions.push(fileResults[i].impressions)


        let count = 0
        if (results.navigation.has(fileResults[i].navigation)) {
            count = results.navigation.get(fileResults[i].navigation)
        }
        results.navigation.set(fileResults[i].navigation, ++count)

        count = 0
        if (results.designRating.has(fileResults[i].designRating)) {
            count = results.designRating.get(fileResults[i].designRating)
        }
        results.designRating.set(fileResults[i].designRating, ++count)

        //if features is not array make it an array (because 1+ boxes may be checked)
        if (!Array.isArray(fileResults[i].features)) {
            fileResults[i].features = [fileResults[i].features]
        }

        fileResults[i].features.forEach((feature) => {
            count = 0
            if (results.features.has(feature)) {
                count = results.features.get(feature)
            }
            results.features.set(feature, ++count)
        })

        // if (results.features.has(fileResults[i].features)) {
        //     count = results.features.get(fileResults[i].features)
        // }
        // results.features.set(fileResults[i].features, ++count)

        results.comments.push(fileResults[i].comments)


        recomendationSum += parseInt(fileResults[i].recommendation)
    }

    avgRecomendation = recomendationSum / fileResults.length
    results.recomendation = avgRecomendation

    console.log(`${recomendationSum} / ${fileResults.length} = ${avgRecomendation}`)
    res.render('results', results)
})


function saveSurveyResult(result) {
    const surveyResults = loadSurveyResults();
    surveyResults.push(result);
    fs.writeFileSync(path.join(__dirname, 'data', 'survey_results.json'), JSON.stringify(surveyResults));
}

function loadSurveyResults() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'survey_results.json'));
        return JSON.parse(data.toString());
    } catch (err) {
        return [];
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

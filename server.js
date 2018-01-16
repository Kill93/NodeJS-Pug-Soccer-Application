var express =  require('express');
var request = require('request');
var app = express();

var port = process.env.PORT || 3000;

app.set('view engine', 'pug');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static(__dirname + '/public'));

//leagueTable
app.get('/', function (req,res){
        var url = 'http://api.football-data.org/v1/competitions/445/leagueTable';
        var options = {
            method: 'GET',
            url: url,
            headers: {
                "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
            }
        };

    request.get(options, function (error, response, body) {

        if (error) {
            throw error;
        }
        var data = JSON.parse(body);
        var league = [];

        for(i = 0; i < data.standing.length; i++) {
            var string = data.standing[i]._links.team.href;
            JSON.stringify(string);
            var teamID = string.substring(38, 43);

            var leagueData = {
                "teamID": teamID,
                "teamName": data.standing[i].teamName,
                "position": data.standing[i].position,
                "crestURI": data.standing[i].crestURI,
                "playedGames": data.standing[i].playedGames,
                "goalsScored": data.standing[i].goals,
                "goalsAgainst": data.standing[i].goalsAgainst,
                "goalDifference": data.standing[i].goalDifference,
                "wins": data.standing[i].wins,
                "draws": data.standing[i].draws,
                "losses": data.standing[i].losses,
                "points": data.standing[i].points
            }
            league.push(leagueData);
        }
        res.render('index', { data: league });
    });
});

// Selected Team Page
app.get('/team/:teamID', function (req,res){

    var url = 'http://api.football-data.org/v1/teams/';
    const id = req.params.teamID.toString();

    //// Team Name and Crest Image

    var options = {
        method: 'GET',
        url: url + id,
        headers: {
            "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
        }
    };

    request.get(options, function (error, response, body) {
        if (error) {
            throw error;
        }

        const teams = JSON.parse(body);

    //// Team Players

        var optionsP = {
            method: 'GET',
            url: url + id + "/players/",
            headers: {
                "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
            }
        };
    request.get(optionsP, function (error, response, body) {
        if (error) {
            throw error;
            }

        var data = JSON.parse(body);
        var players = [];

        for (i = 0; i < data.players.length; i++) {

                var playerData = {
                    "playerName": data.players[i].name,
                    "playerPosition": data.players[i].position,
                    "jerseyNumber": data.players[i].jerseyNumber,
                    "nationality": data.players[i].nationality,
                }
                players.push(playerData);
                players.sort(function(a, b) {
                return parseFloat(a.jerseyNumber) - parseFloat(b.jerseyNumber);
                });
        }


    //// Fixures and Results

        var options = {
            method: 'GET',
            url: url + id + "/fixtures/",
            headers: {
                "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
            }
        };

    request.get(options, function (error, response, body) {

        var data = JSON.parse(body);
        var fixtures = [];
        var results = [];

        for (i = 0; i < data.fixtures.length; i++) {

            if (data.fixtures[i].status == "SCHEDULED") {

                var fixtureData = {
                    "homeTeam": data.fixtures[i].homeTeamName,
                    "awayTeam": data.fixtures[i].awayTeamName,
                    "date": data.fixtures[i].date,
                }

                fixtures.push(fixtureData);
            }
            if (data.fixtures[i].status == "FINISHED") {

                var resultData = {
                    "homeTeam": data.fixtures[i].homeTeamName,
                    "awayTeam": data.fixtures[i].awayTeamName,
                    "goalsHomeTeam": data.fixtures[i].result.goalsHomeTeam,
                    "goalsAwayTeam": data.fixtures[i].result.goalsAwayTeam,
                    "date": data.fixtures[i].date,
                }
                results.push(resultData);
            }
        }
        res.render('team', { fixtures: fixtures, results: results, teams: teams, players: players });
            });
        });
    });
});

//All Teams in League Page
app.get('/all_teams', function (req,res){
    var url = 'http://api.football-data.org/v1/competitions/445/leagueTable';
    var options = {
        method: 'GET',
        url: url,
        headers: {
            "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
        }
    };

    request.get(options, function (error, response, body) {

        if (error) {
            throw error;
        }
        var data = JSON.parse(body);
        var teams = [];
        console.log(data);
        for(i = 0; i < data.standing.length; i++) {

            var string = data.standing[i]._links.team.href;
            JSON.stringify(string);
            var teamID = string.substring(38, 43);

            var teamData = {
                "teamID": teamID,
                "teamName": data.standing[i].teamName,
                "crestURI": data.standing[i].crestURI,
            }
            teams.push(teamData);
            teams.sort(function(a, b) {
                return a.teamName.localeCompare(b.teamName);
            });
        }
        res.render('all_teams', { teams: teams });
    });
});

//All Fixtures in League Page
app.get('/fixtures', function (req,res){
    var url = 'http://api.football-data.org/v1/competitions/445/fixtures';
    var options = {
        method: 'GET',
        url: url,
        headers: {
            "X-Auth-Token": '50a24deb768540db8e248d33c9088c34',
        }
    };

    request.get(options, function (error, response, body) {

        if (error) {
            throw error;
        }
        var data = JSON.parse(body);
        var fixtures = [];

        for(i = 0; i < data.fixtures.length; i++) {

            if (data.fixtures[i].status == "SCHEDULED") {

                var fixtureData = {
                    "homeTeam": data.fixtures[i].homeTeamName,
                    "awayTeam": data.fixtures[i].awayTeamName,
                    "matchday": data.fixtures[i].matchday,
                    "date": data.fixtures[i].date,
                }
                fixtures.push(fixtureData);
            }
        }
        res.render('fixtures', { fixtures: fixtures });
    });
});

app.get('/info', function(req, res, next) {

    config = {
        "username": "nraboy",
        "website": "hi"
    }

    res.json(config);
});


app.listen(port);
"use strict";
exports.__esModule = true;
var Domain = require("../domain/team");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
exports.initTeams = function (commands$) {
    var events$ = new rxjs_1.ReplaySubject;
    var createCommands$ = commands$.pipe(operators_1.filter(function (msg) { return msg.command.name === 'create'; }));
    var parts = operators_1.partition(function (_a) {
        var _b = _a.command, teamName = _b.teamName, email = _b.email;
        return Domain.validateTeam(name, email);
    })(createCommands$);
    var acceptedCreateCommands$ = parts[0];
    var rejectedCreateCommands$ = parts[1];
    acceptedCreateCommands$
        .pipe(operators_1.map(function (_a) {
        var _b = _a.command, teamName = _b.teamName, email = _b.email;
        return ({ context: 'team',
            id: email,
            name: 'created',
            team: { email: email,
                id: email,
                name: teamName
            }
        });
    }))
        .subscribe(events$);
    rejectedCreateCommands$.subscribe(function (_a) {
        var client = _a.client, command = _a.command;
        client.send(JSON.stringify({ error: 'invalid command', command: command }));
    });
    return events$.asObservable();
};

// user id
// snps
// traits
var pg = require("pg");
pg.defaults.ssl = true;



var insertSnp = function(id, location, basepair) {
    console.log('entered insertSnp')
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('INSERT INTO Ids_Snps (idUser, location, basepair) VALUES ($1, $2, $3)', [id, location, basepair], function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {
                if (err) throw err;

                else {
                    console.log(JSON.stringify(result));
                }
            });
        });
    });
}

var insertSnps = function(id, geneticData) {
    console.log('entered insertSnps');
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) {
            throw err;
        } else {
            for (var key in geneticData) {
                insertSnp(id, key, geneticData[key]);
            }
        }
    })
};

var insertTrait = function(trait) {
    console.log('entered insertTrait');
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('INSERT INTO Traits (trait) VALUES ($1)', [trait], function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {
                if (err) throw err;

                else {
                    console.log(JSON.stringify(result));
                }
            });
        });
    });
}

var insertTraits = function(idUser, traits, callback) {
    console.log('entered insertTraits');
    for (i = 0; i < traits.length; i++) {
        insertTrait(traits[i]);    
    }           
}

var updateTraitsTable = function(traits) {
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('INSERT INTO Traits (trait) VALUES ($1)', [traits[i]], function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {
                loopCounter++;

                if (err) throw err;

                else {
                    //console.log(JSON.stringify(result.rows));
                }
            });
        });
    });
}

var associateUserTraits = function(id, traits) {
    var traitList = "";
    for (var i = 0; i < traits.length; i++ ) {
        traitlist += traits[i] + ", "
    }
    traitList = traitList.substr(0, str.length -2);
    console.log(traitList);

    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('SELECT idTrait FROM Traits WHERE trait IN (' + traitList + ')', function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {

                if (err) throw err;

                else {
                    console.log('User trait Ids:\n')
                    console.log(JSON.stringify(result.rows));
                }
            });
        });
    });
}

exports.insertUser = function(userJson) {
    // need to insert into traits first
    console.log('entered insertuser');
    console.log(JSON.stringify(userJson));
    insertSnps(userJson.id, userJson.geneticData);
    insertTraits(userJson.traits);
    setTimeout(function() {
        associateUserTraits(userJson.id, userJson.traits);
    }, 2000); // figure out a better way later
    // insertTraits(userJson.id, userJson.traits, function(finished) {
    //     if (finished) {

    //     }
    // })
}

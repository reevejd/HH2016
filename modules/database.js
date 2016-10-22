// user id
// snps
// traits
var pg = require("pg");
pg.defaults.ssl = true;



var insertSnp = function(id, location, basepair) {
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('INSERT INTO Snps_Ids (idUser, location, basepair) VALUES ($1, $2, $3)', [id, location, basepair], function (err, result) {
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

var insertTraits = function(idUser, traits, callback) {
    for (i = 0; i < traits.length; i++) {
        updateTraitsTable(traits[i]);    
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

exports.insertUser = function(userJson) {
    // need to insert into traits first
    console.log('entered insertuser');
    console.log(JSON.stringify(userJson));
    insertSnps(userJson.id, userJson.geneticData);
    
    // insertTraits(userJson.id, userJson.traits, function(finished) {
    //     if (finished) {

    //     }
    // })
}

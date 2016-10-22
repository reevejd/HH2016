// user id
// snps
// traits
var pg = require("pg");
pg.defaults.ssl = true;


exports.insertUser = function(userJson) {
    // need to insert into traits first
    insertTraits(userJson.geneticData.id, userJson.traits, function(finished) {
        if (finished) {

        }
    })
}

var insertTraits = function(idUser, traits, callback) {
    var loopCounter = 0;
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;

        for (i = 0; i < traits.length; i++) {
            client.query('INSERT INTO Traits (idUser, trait) VALUES ($1, $2)', [idUser, traits[i]], function (err, result) {
            if (err) throw err;

            client.end(function (err) {
                loopCounter++;

                if (err) throw err;

                else {
                    //console.log(JSON.stringify(result.rows));
                }
            });

            if (loopCounter == traits.length - 1) {
                callback(true);
            }
        });
        }
        
    });   
}



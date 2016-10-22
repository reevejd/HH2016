// user id
// snps
// traits
var pg = require("pg");
pg.defaults.ssl = true;



var insertSnp = function(id, location, basepair) {

}

var insertSnps = function(geneticData) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) {
            throw err;
        } else {
            for (var i = 0; i < geneticData.length -1; i++) {
                insertSnp(geneticData.id, geneticData[])
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
    insertSnps(userJson.geneticData);
    
    insertTraits(userJson.geneticData.id, userJson.traits, function(finished) {
        if (finished) {

        }
    })
}

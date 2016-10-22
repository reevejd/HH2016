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

var insertTraits = function(traits) {
    console.log('entered insertTraits');
    for (i = 0; i < traits.length; i++) {
        insertTrait(traits[i]);    
    }           
}

var associateUserTrait = function(id, trait) {
    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('INSERT INTO userTraits (idUser, idTrait) VALUES ($1, $2)', [id, trait], function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {

                if (err) throw err;

            });
        });
    });
}

var associateUserTraits = function(id, traits) {
    console.log('entered associateUserTraits');
    var traitList = "";
    for (var i = 0; i < traits.length; i++ ) {
        traitList += "'" + traits[i] + "', "
    }
    traitList = traitList.substr(0, traitList.length -2);
    console.log(traitList);

    pg.connect(process.env.DATABASE_URL, function (err, client) {
        if (err) throw err;
        client.query('SELECT idTrait FROM Traits WHERE trait IN (' + traitList + ')', function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {

                if (err) throw err;

                else if (result) {
                    console.log('User trait Ids:\n')
                    console.log(JSON.stringify(result));
                    for (var i = 0; i < result.rows.length; i++ ) {
                        associateUserTrait(id, result.rows[i].idtrait);

                    }
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


var DNAtoTraits = function(userJSON) {
    // takes snps, makes inferences about personality.
}

var TraittoDNA = function(trait, callback) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('SELECT idUser FROM userTraits INNER JOIN traits ON (userTraits.idTrait = traits.idTrait) WHERE traits.trait = \'' + trait + '\'');
        client.query('SELECT idUser FROM userTraits INNER JOIN traits ON (userTraits.idTrait = traits.idTrait) WHERE traits.trait = \'' + trait + '\'', function (err, result) {
            if (err) console.log(err);

            client.end(function (err) {

                if (err) throw err;

                else if (result) {
                    console.log(JSON.stringify(result));
                    snpFrequencies = {
                        total: results.rows.length
                    }
                    // for each user that has this trait, iterate through their snps and keep count
                    for (var i = 0; i < results.rows.length; i++) {
                        if (snpFrequencies[results.rows[i].idUser]) {
                            snpFrequencies[results.rows[i].idUser]++
                        } else {
                            snpFrequencies[results.rows[i].idUser] = 1;
                        }
                    }

                    callback(snpFrequencies, trait);


                    
                }

            });
        });
    })
}

var TraitstoDNA = function(traits) {
    console.log('entered traitstodna');
    // takes personality, makes inferences about snps
    // should take an array of traits, then..
    // select users who have those snps, 
    // select traits from those users
    allSnpFrequencies = {};
    var counter = 0;

    for (var i = 0; i < traits.length; i++ ) {
        TraittoDNA(traits[i], function(snpFrequencies, trait) {
            if (snpFrequencies) {
                allSnpFrequencies[trait] = snpFrequencies;
                counter++
            }
        })
    }

    if (counter == traits.length) {
        return allSnpFrequencies;
    }

   

}


exports.getAssociations = function(userInfo, direction) {
    if (direction == "DNAtoTraits") {
        return DNAtoTraits(userInfo);
    } else if (direction == "TraitstoDNA") {
        return TraitstoDNA(userInfo);
    }
}
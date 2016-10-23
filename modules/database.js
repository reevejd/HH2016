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
                    var users = []
                    for (var i = 0; i < result.rows.length; i++) {
                        if (users.indexOf(result.rows[i].iduser) < 0) {
                            users.push(result.rows[i].iduser);
                        }
                    }

                    var snpFrequencies = {
                        total: users.length
                    }

                    console.log(JSON.stringify(result));
                    // for each user that has this trait, iterate through their snps and keep count
                    // need another query to get all snps for every user
                    
                    var userList = "";
                    for (var i = 0; i < users.length; i++ ) {
                        userList += "'" + users[i] + "', "
                    }
                    userList = userList.substr(0, userList.length -2);
                    console.log('userList: ' + userList)
                    if (userList == "" || userList.length < 2) {console.log('early callback'); callback(true, false);} else {
                        
                        console.log('userList in function: ' + userList);
                        pg.connect(process.env.DATABASE_URL, function(err, client) {
                            if (err) throw err;
                            console.log('\nSELECT location, basepair from Ids_Snps WHERE idUser IN (' + userList + ')\n');
                            client.query('SELECT location, basepair from Ids_Snps WHERE idUser IN (' + userList + ')', function(err, result) {
                                if (err) console.log(err);

                                client.end(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else if (result) {
                                        console.log('\n basepair/location results:');
                                        console.log(JSON.stringify(result));
                                        
                                        for (var i = 0; i < result.rows.length; i++) {
                                            if (snpFrequencies[result.rows[i].basepair + '@' + result.rows[i].location]) {
                                                snpFrequencies[result.rows[i].basepair + '@' + result.rows[i].location]++
                                            } else {
                                                snpFrequencies[result.rows[i].basepair + '@' + result.rows[i].location] = 1;
                                            }
                                        }
                                        
                                        console.log('snpFrequencies for '+trait+':\n')
                                        console.log(JSON.stringify(snpFrequencies));

                                        callback(snpFrequencies, trait);
                                    }
                                })
                            });
                            // snpFrequencies[result.rows[i].iduser] --> snpFrequencies[result.rows[i].basepair + '@' + result.rows[i].location]

                            
                        });
                    }


                    
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
    var allSnpFrequencies = {};
    var counter = 0;

    for (var i = 0; i < traits.length; i++ ) {
        TraittoDNA(traits[i], function(snpFrequencies, trait) {
            if (snpFrequencies) {
                if (trait) {
                    allSnpFrequencies[trait] = snpFrequencies;
                }
                counter++;

                if (counter == traits.length) {
                    console.log('all snp freqs: ' + JSON.stringify(allSnpFrequencies));
                    return allSnpFrequencies;
                }
            }
        })
    }
}

var snpToTrait = function(location, basepair) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('SELECT Ids_Snps.idUser FROM Ids_Snps INNER JOIN userTraits ON (Ids_Snps.idUser = userTraits.idUser) WHERE Ids_Snps.location = \'' + location + '\' AND Ids_Snps.basepair =\'' + basepair + '\'');
        client.query('SELECT Ids_Snps.idUser FROM Ids_Snps INNER JOIN userTraits ON (Ids_Snps.idUser = userTraits.idUser) WHERE Ids_Snps.location = \'' + location + '\' AND Ids_Snps.basepair =\'' + basepair + '\'', function (err, result) {
            
            client.end(function (err) {
                if (err) throw err;

                else if (result) {
                    console.log('results:\n'); console.log(JSON.stringify(result));
                    var users = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        if (users.indexOf(result.rows[i].iduser) < 0) {
                            users.push(result.rows[i].iduser);
                        }
                    }

                    var traitFrequencies = {
                        total: users.length
                    }

                    console.log('Users with this snp: ' + users);
                    
                    /////// COPIED AND PASTED FROM ABOVE .. NEED TO CHECK
                    var userList = "";
                    for (var i = 0; i < users.length; i++ ) {
                        userList += "'" + users[i] + "', "
                    }
                    userList = userList.substr(0, userList.length -2);
                    console.log('userList: ' + userList)
                    if (userList == "" || userList.length < 2) {console.log('early callback'); callback(true, true, false);} else {
                        
                        console.log('userList in function: ' + userList);
                        pg.connect(process.env.DATABASE_URL, function(err, client) {
                            if (err) throw err;
                            console.log('\nSELECT trait from Ids_Snps INNER JOIN traits ON (Ids_Snps.idUser = traits.idUser) WHERE idUser IN (' + userList + ')\n');
                            client.query('SELECT trait from Ids_Snps INNER JOIN traits ON (Ids_Snps.idUser = traits.idUser) WHERE idUser IN (' + userList + ')', function(err, result) {
                                if (err) console.log(err);

                                client.end(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else if (result) {
                                        console.log('\n trait results:');
                                        console.log(JSON.stringify(result));
                                        
                                        for (var i = 0; i < result.rows.length; i++) {
                                            if (traitFrequencies[result.rows[i].trait]) {
                                                traitFrequencies[result.rows[i].trait]++
                                            } else {
                                                traitFrequencies[result.rows[i].trait] = 1;
                                            }
                                        }
                                        
                                        console.log('snpFrequencies for '+trait+':\n')
                                        console.log(JSON.stringify(traitFrequencies));

                                        callback(location, basepair, traitFrequencies);
                                    }
                                })
                                
                            });
                            // snpFrequencies[result.rows[i].iduser] --> snpFrequencies[result.rows[i].basepair + '@' + result.rows[i].location]

                            
                        });
                    }


                }
            });
        });
    });
}

var DNAtoTraits = function(snps) {
    // first remove the id
    delete snps.id;
    var allTraitFrequencies = {};
    var counter = 0;

    // for each of these snps, need to find the most common personality traits
    for (var location in snps) {
        snpToTrait(location, snps[location], function(location, basepair, trait) {
            if (location || basepair) {
                if (trait) {
                    allTraitFrequencies[location + "@" + basepair] = trait;
                }
                counter++;

                if (counter = snps.length) {
                    console.log ('all traits freqs: ' + JSON.stringify(allTraitFrequencies));
                    return allTraitFrequencies;
                }
            }
            
        });
    }
}

exports.getAssociations = function(userInfo, direction) {
    console.log(JSON.stringify(userInfo));
    if (direction == "DNAtoTraits") {
        return DNAtoTraits(userInfo);
    } else if (direction == "TraitstoDNA") {
        return TraitstoDNA(userInfo);
    }
}
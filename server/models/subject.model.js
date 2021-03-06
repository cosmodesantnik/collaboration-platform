const Sequelize = require('sequelize');
const db = require('../middleware/sequelize.mw.js');
const NAME = "subject";
const Op = Sequelize.Op;

// Subject Definition
const Subject = db.define(NAME, {
    id: {
        type: Sequelize.INTEGER(10),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    title: {
        type: Sequelize.STRING(45),
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    url: {
        type: Sequelize.STRING(50),
        allowNull: true
    },/*
    creator: {
        type: Sequelize.TEXT,
        allowNull: true
    },*/
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
  }, {
}
);

// Create Subject Table if it is non-existant
const CreateTableIfNonExistant = async() => {
    return new Promise(async(resolve, reject) => {
        db.query(`SHOW TABLES like "` + NAME + 's"').then(([results, metadata]) => {
            if(results == 0) {
                Subject.sync();
            }
            else {
                console.log("Sequelize : The following table exists : " + NAME + "s");
            }
            resolve();
        })
    });
}

// Create Subject
const CreateSubject = async(subject) => {
    return new Promise(async(resolve, reject) => {

        let newSubject = {
            title: '',
            description: '',
        }

        if(subject.hasOwnProperty('title')) { newSubject.title = subject.title; }
        if(subject.hasOwnProperty('description')) { newSubject.description = subject.description; }

        Subject.create(newSubject).then(subject => {
            resolve(subject);
        }).catch(err => {
            console.log(err); 
            resolve();
        });
    });
}

// Create Subject by title 
const CreateSubjectByTitle = async(title) => {
    return new Promise(async(resolve, reject) => {
        await ValidateTitle(title).then( async({name, url}) => {
            // Check if the title already exists
            if(await TitleExists(name).catch(err => reject(err))) {
                reject("Subject title already exists");
            } else {
                // Create the subject
                const subject = await Subject.create({title: name, url: url}).catch(err => reject(err));
                resolve(subject);
            }
        }).catch(err => reject(err));
    });
}

const ValidateTitle = async(title) => {
    return new Promise(async(resolve, reject) => {

        if(title === '' || title === null) reject("Subject title can't be empty");
        else {
            let name = title.replace(/\s\s+/g, ' ');
            name = name.split(" ");
            if(name[0] == '') name.splice(0, 1);
            if(name[name.length - 1] == '') name.splice(-1, 1);
            name = name.join(" ");

            const path = ('/' + name).replace(/ /g, "_").match(/(?<!\?.+)(?<=\/)[\w-]+(?=[/\r\n?]|$)/g);

            if(path === null || path.length != 1) reject("Subject URL is invalid");
            else {
                const url = path[0];
                resolve({name, url});
            }
        }

    })
}

const ValidateURL = async(url) => {
    return new Promise(async(resolve, reject) => {
        if(url === '' || url === null) reject("Subject URL can't be empty");
        else {
            const path = ('/' + url).replace(/ /g, "_").match(/(?<!\?.+)(?<=\/)[\w-]+(?=[/\r\n?]|$)/g);
            if(path === null || path.length != 1) reject("Subject URL is invalid");
            else resolve(path[0]);
        }
    })
}

const TitleExists = async(title) => {
    return new Promise(async(resolve, reject) => {
        Subject.findOne({
            where: {title: title}
        }).then(subject => {
            if(subject != null) resolve(true);
            else resolve(false);
        }).catch(err => {
            reject("Error validating the title");
        });
    });
}

const URLExists = async(url) => {
    return new Promise(async(resolve, reject) => {
        Subject.findOne({
            where: {url: url }
        }).then(subject => {
            if(subject != null) resolve(true);
            else resolve(false);
        }).catch(err => {
            reject("Error validating the URL");
        });
    });
}


// Get Subject by ID
const GetSubjectByID = async(id) => {
    return new Promise(async(resolve, reject) => {
        Subject.findByPk(id).then(subject => {
            resolve(subject);
        }).catch(err => {
            console.log(err);
            resolve();
        });
    });
}

// Get Subject by ID
const GetSubjectByTitle = async(title) => {
    return new Promise(async(resolve, reject) => {
        Subject.findOne({
            where: {
                title: title
            }
        }).then(subject => {
            resolve(subject);
        }).catch(err => {
            reject(err);
        });
    });
}

// Get Subject by Where
const GetSubjectWhere = async(search) => {
    return new Promise(async(resolve, reject) => {
        Subject.findOne(search).then(subject => {
            if(subject === null) reject("Subject doesn't exists");
            else resolve(subject.dataValues);
        }).catch(err => {
            reject(err);
        });
    });
}

// Update Subject
const UpdateSubject = async(subject) => {
    return new Promise(async(resolve, reject) => {
        Subject.update(
            {   title: subject.title,
                description: subject.description
            },
            { where: { id: subject.id }}
        ).then(() => {
            Subject.findByPk(subject.id).then(subject => {
                resolve(subject);
            }).catch(err => {
                console.log(err);
                resolve();
            });
        }).catch(err => {
            console.log(err);
            resolve();
        });
    });
}

// Delete Subject
const DeleteSubjectByID = async(id) => {
    return new Promise(async(resolve, reject) => {
        Subject.destroy({
            where: {
              id: id,
            }
        }).then( subject => {
            resolve(subject);
        }).catch(err => {
            reject(err);
        });
    });
}

// Delete Subject
const DeleteSubjectByTitle = async(title) => {
    return new Promise(async(resolve, reject) => {
        Subject.destroy({
            where: {
              title: title,
            }
        }).then(() => {
            resolve();
        }).catch(err => {
            reject(err)
        });
    });
}

// Get All Subjects
const GetAllSubjects = async() => {
    return new Promise(async(resolve, reject) => {
        Subject.findAll().then(subjects => {
            let list = [];
            subjects.forEach(subject => {
                list.push({
                    id: subject.dataValues.id,
                    title: subject.dataValues.title,
                    description: subject.dataValues.description,
                    url: subject.dataValues.url,
                    createdAt: subject.dataValues.createdAt,
                    updatedAt: subject.dataValues.updatedAt
                });
            });
            resolve(list);
          }).catch(err => {reject(err)});
    });
}

// Get All Subjects by Search Parameters
const SearchSubjects = async(title) => {
    return new Promise(async(resolve, reject) => {
        try {
            let searchTitle = '%' + title + '%';
            const subjects = await Subject.findAll({
                where: {
                    title: {
                        [Op.like]: searchTitle
                    }
                }
            }).catch(err => {reject(err)});
            let list = [];
            subjects.forEach(subject => {
                list.push({
                    id: subject.dataValues.id,
                    title: subject.dataValues.title,
                    description: subject.dataValues.description,
                    url: subject.dataValues.url,
                    createdAt: subject.dataValues.createdAt,
                    updatedAt: subject.dataValues.updatedAt
                });
            });
            resolve(list);
        } catch(err) { reject(err); }


        /*
        Subject.findAll().then(subjects => {
            let list = [];
            subjects.forEach(subject => {
                list.push({
                    id: subject.dataValues.id,
                    title: subject.dataValues.title,
                    description: subject.dataValues.description,
                    url: subject.dataValues.url,
                    createdAt: subject.dataValues.createdAt,
                    updatedAt: subject.dataValues.updatedAt
                });
            });
            resolve(list);
          }).catch(err => {reject(err)});*/
    });
}




module.exports = {
    Subject,
    CreateTableIfNonExistant,
    CreateSubject,
    CreateSubjectByTitle,
    GetSubjectByID,
    GetSubjectByTitle,
    UpdateSubject,
    DeleteSubjectByID,
    DeleteSubjectByTitle,
    GetAllSubjects,
    TitleExists,
    ValidateTitle,
    ValidateURL,
    GetSubjectWhere,
    SearchSubjects
};
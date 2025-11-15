const { DataTypes } = require('sequelize');
const sequelize = require('../index');

// 论文表 (Publications)
const Publication = sequelize.define('Publication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(512),
        allowNull: false
    },
    abstract: {
        type: DataTypes.TEXT
    },
    // venueId, publicationTypeId, researchCategoryId are added by associations
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    citations: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    doi: {
        type: DataTypes.STRING,
        unique: true
    },
    pdfUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    codeUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// 作者表 (Authors)
const Author = sequelize.define('Author', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    affiliation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    }
});

// 期刊/会议表 (Venues)
const Venue = sequelize.define('Venue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    abbreviation: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// 论文类型表 (PublicationTypes)
const PublicationType = sequelize.define('PublicationType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
});

// 研究分类表 (ResearchCategories)
const ResearchCategory = sequelize.define('ResearchCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
});

// 关键词表 (Keywords)
const Keyword = sequelize.define('Keyword', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
});

// 关联关系 (Associations)

// Publication and Author (Many-to-Many)
const PublicationAuthor = sequelize.define('PublicationAuthor', {
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});
Publication.belongsToMany(Author, { through: PublicationAuthor });
Author.belongsToMany(Publication, { through: PublicationAuthor });

// Publication and Keyword (Many-to-Many)
const PublicationKeyword = sequelize.define('PublicationKeyword', {});
Publication.belongsToMany(Keyword, { through: PublicationKeyword });
Keyword.belongsToMany(Publication, { through: PublicationKeyword });

// Publication and Venue (Many-to-One)
Publication.belongsTo(Venue);
Venue.hasMany(Publication);

// Publication and PublicationType (Many-to-One)
Publication.belongsTo(PublicationType);
PublicationType.hasMany(Publication);

// Publication and ResearchCategory (Many-to-One)
Publication.belongsTo(ResearchCategory);
ResearchCategory.hasMany(Publication);

module.exports = {
    Publication,
    Author,
    Venue,
    PublicationType,
    ResearchCategory,
    Keyword,
    PublicationAuthor,
    PublicationKeyword,
    sequelize
};

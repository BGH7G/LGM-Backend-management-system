const { DataTypes } = require('sequelize');
const sequelize = require('../index');

// 新闻表 (News)
const News = sequelize.define('News', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    summary: {
        type: DataTypes.TEXT
    },
    content: {
        type: DataTypes.TEXT('long')
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    authorId: {
        type: DataTypes.INTEGER, // Assuming a Users table exists
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.ENUM('published', 'draft', 'archived'),
        defaultValue: 'draft'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// 分类表 (Categories)
const newsCategory = sequelize.define('newsCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// 标签表 (Tags)
const TagOfNews = sequelize.define('TagOfNews', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// 关联关系 (Associations)

// News and Category (One-to-Many)
News.belongsTo(newsCategory, { foreignKey: 'categoryId' });
newsCategory.hasMany(News, { foreignKey: 'categoryId' });

// News and Tag (Many-to-Many)
const NewsTag = sequelize.define('NewsTag', {
    newsId: {
        type: DataTypes.INTEGER,
        references: { model: News, key: 'id' }
    },
    tagId: {
        type: DataTypes.INTEGER,
        references: { model: TagOfNews, key: 'id' }
    }
});
News.belongsToMany(TagOfNews, { through: NewsTag, foreignKey: 'newsId', otherKey: 'tagId' });
TagOfNews.belongsToMany(News, { through: NewsTag, foreignKey: 'tagId', otherKey: 'newsId' });

// News and News (Many-to-Many for related news)
const RelatedNews = sequelize.define('RelatedNews', {
    newsId: {
        type: DataTypes.INTEGER,
        references: {
            model: News,
            key: 'id'
        }
    },
    relatedNewsId: {
        type: DataTypes.INTEGER,
        references: {
            model: News,
            key: 'id'
        }
    }
});
News.belongsToMany(News, { as: 'Related', through: RelatedNews, foreignKey: 'newsId', otherKey: 'relatedNewsId' });

// 点赞表 NewsLike (防重复点赞)
const NewsLike = sequelize.define('NewsLike', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
});

News.hasMany(NewsLike);
NewsLike.belongsTo(News);

(async () => {
    await sequelize.sync({});
})();

module.exports = {
    News,
    newsCategory,
    TagOfNews,
    NewsTag,
    RelatedNews,
    NewsLike,
    sequelize
};

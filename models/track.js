module.exports = function(sequelize, DataTypes) {
    const track = sequelize.define("track", {
      
      isrc: {type:DataTypes.STRING, allowNull:false},
      image: {type:DataTypes.STRING, allowNull:false},
      title: {type:DataTypes.STRING, allowNull:false},
      artist: {type:DataTypes.STRING, allowNull:false}
    });
    
    return track;
  };
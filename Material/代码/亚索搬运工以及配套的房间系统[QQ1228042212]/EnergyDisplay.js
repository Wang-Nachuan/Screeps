
var EnergyDisplay =
{
    display: function (group) {
        let i = 0;
        let namegroup = new Array();
        if (true) {
            for (var name in Game.rooms) {

                if (Game.rooms[name].controller == null || !Game.rooms[name].controller.my) { continue; }
                namegroup[i] = name;
                i++;
            }
        }
        let f = 0;
        for (let a = i-1; a >=0; a--) {
            group[f]=namegroup[a];
            f++;
            
        }
    }
}
module.exports = EnergyDisplay;
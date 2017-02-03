'use strict';

let listifier = new require('./lib/listify')(),
    textutils = require(`./lib/textutil.js`),
    util = require('./lib/util.js')();

var getText = function() {
    //return '[Illustration: FIG. 24.--BIRTH OF THE VIRGIN. _From the Grandes Heures of the Duc de Berri._] \nAbout that time they attempted to represent distances, and to create\ndifferent planes in their works; to reproduce such things as they\nrepresented far more exactly than they had done before, and to put them in\njust relations to surrounding places and objects; in a word, they seemed\nto awake to an appreciation of the true office of painting and to its\ninfinite possibilities.\n\nDuring this Gothic period some of the most exquisite manuscripts were made\nin France and Germany, and they are now the choicest treasures of their\nkind in various European collections.\n\nFig. 24, of the birth of the Virgin Mary, is from one of the most splendid\nbooks of the time which was painted for the Duke de Berry and called the\nGreat Book of the Hours. The wealth of ornament in the border is a\ncharacteristic of the French miniatures of the time. The Germans used a\nsimpler style, as you will see by Fig. 25, of the Annunciation.\n\nThe influence of the Gothic order of architecture upon glass-painting was\nvery pronounced. Under this order the windows became much more important\nthan they had been, and it was not unusual to see a series of windows\npainted in such pictures as illustrated the whole teaching of the\ndoctrines of the church. It was at this time that the custom arose of\ndonating memorial windows to religious edifices. Sometimes they were the\ngift of a person or a family, and the portraits of the donors were painted\nin the lower part of the window, and usually in a kneeling posture; at\nother times windows were given by guilds, and it is very odd to see\ncraftsmen of various sorts at work in a cathedral window: such pictures\nexist at Chartres, Bourges, Amiens, and other places.\n\n[Illustration: FIG. 25.--THE ANNUNCIATION. _From the Mariale of Archbishop\nArnestus of Prague._]\n\nAbout A.D. 1300 it began to be the custom to represent architectural\neffects upon colored windows. Our cut is from a window at Konigsfelden,\nand will show exactly what I mean (Fig. 26).\n';


    let Corpora = require(`./lib/corpora.js`),
        corpora = new Corpora(),
        strategy,
        chars = 5000,
        textObj = util.pick(corpora.texts),
        text = textObj.text(),
        startPos = util.randomInRange(0, text.length - chars), // will fail for texts < 5000 chars
        blob = text.slice(0,chars);

    return { text: blob,
             source: textObj.name
           };

};
let text = getText(),
    list = listifier.getList(text);

// TODO: clean the individual pieces

// textutils.cleaner()

console.log(JSON.stringify(list, null, 2));

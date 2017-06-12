import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";

import {Genius} from "./plugins/Genius";
import {NormalizeTitles} from "./NormalizeTitles";
const async = require('async');
const plugins = [Genius, SearchWikia];
const request = require('request').defaults({timeout: 5000});

interface Result {
    lyric : string;
    sourceName : string;
    sourceUrl : string;
}

export class Searcher {
    protected plugins:SearchLyrics[];
    protected normalizer : NormalizeTitles;

    constructor() {
        this.normalizer = new NormalizeTitles();
        this.loadPlugins();
    }

    loadPlugins() {
        
        this.plugins = plugins.map((Plugin) => {
            return new Plugin(request);
        });
    }

    search(title:string, artist:string, cb : (error : any, result : Result) => void) {
        const from = { lyric: null, sourceName: '', sourceUrl: ''};
        
        const normalizedTitle = this.normalizer.normalize(title);
        // run plugins on series
        // if some returns success getting a lyric
        // stop and save the lyric result
        console.log(this.plugins);
        async.eachSeries(this.plugins, (plugin : SearchLyrics, callback) => {
            console.log('buscando en: ' + plugin.name);
            
            plugin.search(normalizedTitle, artist, (err, result) => {
                            
                if (!err) {
                    
                    from.lyric = result.lyric;
                    from.sourceName = plugin.name;
                    from.sourceUrl = result.url;
                    console.log("Encontro: " + from.lyric);
                }
                callback(null, from)
            })
        }, (err) => {
            cb(err, from);
        });
    }
}

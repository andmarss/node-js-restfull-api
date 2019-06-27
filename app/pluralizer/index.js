class Pluralizer {
    static getPlural(number) {
        if(number % 10 === 1 && number % 100 !== 11) return 0;

        return number % 10 >= 2 && number % 10 <= 4 && ( number % 100 < 10 || number % 100 >= 20 ) ? 1 : 2;
    }

    static pluralize(number, words) {
        if(typeof number !== "number") throw new Error('Требуется передача числа для плурализации');

        if(!Array.isArray(words) || words.length !== 3) throw new Error('Требуется передача массива из трех слов');

        return words[Pluralizer.getPlural(number)];
    }
}

module.exports = Pluralizer;
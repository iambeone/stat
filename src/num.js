export function pretifyNumber(number){
    const negativeSign = number < 0 ? "-" : "";

    let i = parseInt(number = Math.abs(Number(number) || 0).toFixed(2)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + ' ' : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ' ') + (',' + Math.abs(number - i).toFixed(2).slice(2));
}
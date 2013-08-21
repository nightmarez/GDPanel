// ==UserScript==
// @name           GDPanel
// @namespace      GDPanel
// @description    Panel script for GameDev.ru
// @include        http://www.gamedev.ru/*
// @include        http://gamedev.ru/*
// @copyright      2011-2013, Michael Makarov (m.m.makarov@gmail.com, http://nightmarez.net)
// @licence        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @version        1.5.1
// ==/UserScript==

////////////////////////////////////////////////////
//         userscript for gamedev.ru/forum/       //
//           для Opera, Firefox и Chrome          //
//    designed by Makarov M.M. (aka NightmareZ)   //
////////////////////////////////////////////////////

(function (document) {

    ////////////////Config//////////////////////////////
    var showColorPalette = true; // color palette
    var longPalette = true; // long color palette
    var showTags = true; // tags panel
    var showSmiles = true; // smiles panel
    ////////////////////////////////////////////////////

    // Browser type
    // 1 - Opera, 2 - Firefox | Chrome
    var browserType;

    var textArea;

    var incorrectBrowserVersion = function() {
        alert('Unsupported browser version!');
    }

    var isOperaBrowser = function() {
        return browserType == 1;
    }

    var isFirefoxOrChromeBrowser = function() {
        return browserType == 2 || browserType == 3;
    }

    var insertText = function (text) {
        var sa = textArea.selectionStart;

        textArea.value =
            textArea.value.substr(0, sa) +
            text +
            textArea.value.substr(sa, textArea.value.length - sa);

        textArea.selectionEnd =
            textArea.selectionStart = sa + text.length;

        textArea.focus();
    }

    var insertTextD = function (first, last) {
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;

        if (end - start > 0) {
            var s = textArea.value.substr(start, end - start);

            var firstPart = textArea.value.substr(0, start) +
                first + s + last;

            textArea.value =
                firstPart +
                textArea.value.substr(end, textArea.value.length - end);

            textArea.selectionEnd =
                textArea.selectionStart = firstPart.length;

            textArea.focus();
        }
        else {
            var sa = textArea.selectionStart;
            var firstPart = textArea.value.substr(0, sa) + first;

            textArea.value =
                firstPart + last +
                textArea.value.substr(sa, textArea.value.length - sa);

            textArea.selectionEnd =
                textArea.selectionStart = firstPart.length;

            textArea.focus();
        }
    }

    var insertTextH = function (first, second, last) {
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;

        if (end - start > 0) {
            var s = textArea.value.substr(start, end - start);

            var firstPart = textArea.value.substr(0, start) +
                first + s + second + s + last;

            textArea.value =
                firstPart +
                textArea.value.substr(end, textArea.value.length - end);

            textArea.selectionEnd =
                textArea.selectionStart = firstPart.length;

            textArea.focus();
        }
        else {
            insertTextD(first, second + last);
        }
    }

    var createATag = function(innerHTML) {
        var tag = document.createElement('a');
        if (isOperaBrowser())
            tag.style.cursor = "pointer";
        else
            tag.href = 'javascript:void(0);';
        tag.innerHTML = innerHTML;
        return tag;
    }

    var createSmileBtn = function(node, smile, alt) {
        var smileTag = createATag('<img src="' + smile + '" alt="' + alt + '" />');
        smileTag.addEventListener('click', function () { insertText("<img src=\"" + smile + "\" alt=\"" + alt + "\" />"); }, false);
        node.appendChild(smileTag);
    }

    var createColorBtn = function(node, color) {
        sizer = "&nbsp;";
        if (!longPalette)
            sizer = new Array(4).join('&nbsp;');

        var colorTag = createATag('<span style="background-color:' + color + ';">' + sizer + '</span>');
        colorTag.addEventListener('click', function () { insertTextD("<span style=\"color: " + color + ";\">", "</span>"); }, false);
        node.appendChild(colorTag);
    }

    var createTagBtn = function(node, lnk) {
        var span = document.createElement('span');
        span.appendChild(lnk);
        span.innerHTML = /*'[' + */span.innerHTML/* + ']'*/;
        node.appendChild(span);
    }

    var createTagBtnFF = function(node, lnk, fn) {
        var span = document.createElement('span');
        span.appendChild(lnk);
        span.innerHTML = /*'[' + */span.innerHTML/* + ']'*/;
        span.addEventListener('click', fn, false);
        node.appendChild(span);
    }

    var createSpace = function(node) {
        var span = document.createElement('span');
        span.innerHTML = '&nbsp;&nbsp;&nbsp;';
        node.appendChild(span);
    }

    var trim = function(string) {
        return string.replace(/(^\s+)|(\s+$)/g, "");
    }

    var decToHex = function(dec) {
        var result = parseInt(dec.toString()).toString(16);
        if (result.length == 1) result = "0".concat(result);
        return result;
    }

    var createGrayscaleArray = function() {
        var colors = [];
        for (var i = 0xf; i >= 0; i--) {
            var hexString = i.toString(16);
            if (hexString.length == 1) hexString = hexString.concat(hexString);
            colors[0xf - i] = "#".concat(hexString, hexString, hexString);
        }
        return colors;
    }

    var hue = function(P, Q, h) {
        if (h < 0.0) h += 1.0;
        if (h > 1.0) h -= 1.0;
        if (h * 6.0 < 1.0) return P + (Q - P) * h * 6.0;
        if (h * 2.0 < 1.0) return Q;
        if (h * 3.0 < 2.0) return P + (Q - P) * (2.0 / 3.0 - h) * 6.0;
        return P;
    }

    var HSLToRGB = function(h, s, l) {
        var r, g, b;
        var Q, P;

        if (s == 0.0) {
            r = g = b = 0.0;
        }
        else {
            Q = l < 0.5
                ? l * (s + 1.0)
                : l + s - (l * s);

            P = l * 2.0 - Q;
            r = hue(P, Q, h + 1.0 / 3.0);
            g = hue(P, Q, h);
            b = hue(P, Q, h - 1.0 / 3.0);
        }

        return [r * 255, g * 255, b * 255];
    }

    var createHueArray = function() {
        var colors = [];
        for (var i = 0; i < 360; i++) {
            var color = HSLToRGB(i / 360.0, 1.0, 0.5);
            colors[i] = "#".concat(
                decToHex(color[0]),
                decToHex(color[1]),
                decToHex(color[2]));
        }
        return colors;
    }

    var selectEach = function(arr, each) {
        var targetArray = [];
        var j = 0;
        for (var i in arr) {
            j++;
            if (j >= each) {
                targetArray.push(arr[i]);
                j = 0;
            }
        }
        return targetArray;
    }

    var createTagsArray = function() {
        return [
                   ["http://savepic.ru/1468119.png", "Жирный шрифт", "[b]", "[/b]"],
                   ["http://savepic.ru/1474263.png", "Перечёркнутый шрифт", "[s]", "[/s]"],
                   ["http://savepic.ru/1471191.png", "Наклонный шрифт", "[i]", "[/i]"],
                   ["http://savepic.ru/1472215.png", "Подчёркнутый шрифт", "[u]", "[/u]"],
                   [],
                   ["http://savepic.ru/1460951.png", "H1", "<h1>", "</h1>"],
                   ["http://savepic.ru/1461975.png", "H2", "<h2>", "</h2>"],
                   ["http://savepic.ru/1458903.png", "H3", "<h3>", "</h3>"],
                   ["http://savepic.ru/1459927.png", "H4", "<h4>", "</h4>"],
                   [],
                   ["http://savepic.ru/1466071.png", "strong", "<strong>", "</strong>"],
                   ["http://savepic.ru/1462999.png", "small", "<small>", "</small>"],
                   ["http://savepic.ru/1464023.png", "Верхний индекс", "<sup>", "</sup>"],
                   ["http://savepic.ru/1452759.png", "Нижний индекс", "<sub>", "</sub>"],
                   ["http://savepic.ru/1453783.png", "Отформатированный текст", "<pre>", "</pre>"],
                   ["http://savepic.ru/1457879.png", "Разделитель", "[br]"],
                   ["http://savepic.ru/1444567.png", "Параграф", "<p>"],
                   ["http://savepic.ru/1445591.png", "Перенос строки", "<br>"],
                   [],
                   ["http://savepic.ru/1467095.png", "YouTube", "[youtube=", "]"],
                   ["http://savepic.ru/1448663.png", "Изображение", "[img=", "]"],
                   ["http://savepic.ru/1449687.png", "Ссылка", "[url=", "]", "[/url]"],
                   ["http://savepic.ru/1446615.png", "Список", "<ul>\\n<li>", "</li>\\n<li></li>\\n</ul>"],
                   ["http://savepic.ru/1447639.png", "Таблица", "<table width=400 border=1>\\n<tr>\\n<td>", "</td>\\n<td></td>\\n</tr>\\n</table>"],
                   [],
                   ["http://savepic.ru/1442519.png", "C++", "[code=cpp]", "[/code]"],
                   ["http://savepic.ru/1443543.png", "Delphi", "[code=delphi]", "[/code]"]
        ];
    }

    var createTags = function(node) {
        if (showTags) {
            var tags = createTagsArray();
            for (var i in tags) {
                tagInfo = tags[i];
                if (tagInfo.length == 5) {
                    var tag = createATag('<img src="' + tagInfo[0] + '" alt="' + tagInfo[1] + '">');
                    (function (x) { createTagBtnFF(node, tag, function () { insertTextH(x[2], x[3], x[4]); }); })(tagInfo);
                } else if (tagInfo.length == 4) {
                    var tag = createATag('<img src="' + tagInfo[0] + '" alt="' + tagInfo[1] + '">');
                    (function (x) { createTagBtnFF(node, tag, function () { insertTextD(x[2], x[3]); }); })(tagInfo);
                } else if (tagInfo.length == 3) {
                    var tag = createATag('<img src="' + tagInfo[0] + '" alt="' + tagInfo[1] + '">');
                    (function (x) { createTagBtnFF(node, tag, function () { insertText(x[2]); }); })(tagInfo);
                } else if (tagInfo.length == 0) {
                    createSpace(node);
                }
            }
        }

        if (showColorPalette) {
            var br = document.createElement('br');
            node.appendChild(br);

            if (longPalette) {
                var hues = selectEach(createHueArray(), 2);

                for (var i in hues)
                    createColorBtn(node, hues[i]);

                var grayscales = createGrayscaleArray();

                for (var i in grayscales)
                    createColorBtn(node, grayscales[i]);
            } else {
                var colors = [
                    "#000000",
                    "#800000",
                    "#008000",
                    "#808000",
                    "#000080",
                    "#800080",
                    "#008080",
                    "#808080",
                    "#C0C0C0",
                    "#FF0000",
                    "#00FF00",
                    "#FFFF00",
                    "#0000FF",
                    "#FF00FF",
                    "#00FFFF",
                    "#FFFFFF"
                ];

                for (var i in colors)
                    createColorBtn(node, colors[i]);
            }
        }

        if (showSmiles) {
            var smiles = [
                ["http://savepic.ru/1488596.gif", ":-)"],
                ["http://savepic.ru/1470164.gif", ";-)"],
                ["http://savepic.ru/1467092.gif", ":-P"],
                ["http://savepic.ru/1475284.gif", ":-("],
                ["http://savepic.su/2617168.gif", ":'-("],
                ["http://savepic.ru/1473236.gif", "O_O"],
                ["http://savepic.ru/1461972.gif", ":-D"],
                ["http://savepic.ru/1459924.gif", "rofl"],
                ["http://savepic.ru/1464020.gif", "O_o"],
                ["http://savepic.ru/1453780.gif", "good"],
                ["http://savepic.ru/1454804.gif", "scratch"],
                ["http://savepic.ru/1444564.gif", "rtfm"],
                ["http://savepic.ru/1445588.gif", "stop"],
                ["http://savepic.ru/1442516.gif", "umnik"],
                ["http://savepic.ru/1501911.gif", "angel"],
                ["http://savepic.su/2620240.gif", "love"],
                ["http://savepic.ru/1499862.gif", "idea"],
                ["http://savepic.ru/1482455.gif", ":-["],
                ["http://savepic.ru/1507030.gif", "kill"],
                ["http://savepic.ru/1503959.gif", "bad"],
                ["http://savepic.su/2614096.gif", "smoke"],
                ["http://savepic.ru/1469143.gif", "angry"],
                ["http://savepic.ru/1494743.gif", "devil"],
                ["http://savepic.ru/1492695.gif", "bomb"],
                ["http://savepic.ru/1498839.gif", "yahoo"],
                ["http://savepic.ru/1495767.gif", "dance"],
                ["http://savepic.ru/1485527.gif", "wall"],
                ["http://savepic.ru/1479383.gif", "sex"]
            ];

            if (showSmiles) {
                var br = document.createElement('br');
                node.appendChild(br);

                for (var i in smiles)
                    createSmileBtn(node, smiles[i][0], smiles[i][1]);
            }
        }
    }

    var removeAds = function() {
        var ad = document.getElementById('ad');
        if (ad)
            ad.parentNode.removeChild(ad);
    }

    var initFunc2 = function () {
        var areatags = document.getElementById('areatags');
        if (areatags)
            areatags.parentNode.removeChild(areatags);

        var txtAreas = document.getElementsByClassName('gdr');
        if (txtAreas.length > 0) {
            textArea = txtAreas[0];
            var newNode = document.createElement('div');
            createTags(newNode);
            textArea.parentNode.insertBefore(newNode, textArea);
        }

        removeAds();
    }

    var initFunc = function () {
        if (document.location.href.indexOf('gamedev.ru') == -1)
            return;

        var ua = window.navigator.userAgent;
        if (ua.indexOf('Opera') == -1 &&
            ua.indexOf('Firefox') == -1 &&
            ua.indexOf('Chrome') == -1) {

            incorrectBrowserVersion();
            return;
        }
        else if (ua.indexOf('Opera') != -1) {
            browserType = 1;
        }
        else if (ua.indexOf('Firefox') != -1) {
            browserType = 2;
        }
        else {
            browserType = 3;
        }

        if (isOperaBrowser()) {
            var reg = /Opera\/(\d+).(\d+)/;
            var verArr = reg.exec(window.navigator.userAgent);
            var majorVersion = verArr[1];
            var minorVersion = verArr[2];

            if (majorVersion < 9) {
                incorrectBrowserVersion();
                return;
            }
            else {
                if ((majorVersion == 9) && (minorVersion < 5)) {
                    incorrectBrowserVersion();
                    return;
                }
            }
        }
        else if (isFirefoxOrChromeBrowser()) {
            if (browserType == 2) {
                var reg = /Firefox\/(\d+).(\d+)/;
                var verArr = reg.exec(window.navigator.userAgent);
                var majorVersion = verArr[1];

                if (majorVersion < 3) {
                    incorrectBrowserVersion();
                    return;
                }
            }
        }
        else {
            incorrectBrowserVersion();
            return;
        }

        if (browserType == 1) {
            addEventListener('load', function (e) {
                initFunc2();
            }, false);
        }
        else if (browserType == 2) {
            initFunc2();
        }
    };

    initFunc();

})(document);
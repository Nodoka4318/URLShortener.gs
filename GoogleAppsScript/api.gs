//
// URLShortener.gs by Nodoka4318
// https://www.kankantari.net
// 
// repository: https://github.com/Nodoka4318/URLShortener.gs
//
/**
 * The id of spreadsheet which you want to use for the database.
 */
const SPREADSHEET_ID = "your_id";
/**
 * Length of code.
 */
const CODE_LENGTH = 6;

// do not edit under here

/**
 *  結び付けられたリンク
 */
class Link {
  constructor(code, url) {
    this.code = code;
    this.url = url;
  }

  static createLink(url) {
    var code = Link.generateCode(CODE_LENGTH);
    return new Link(code, url);
  }

  static generateCode(len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(Array(len)).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  static fromText(data) {
    var vals = data.split("^^");
    // <コード>^^<URL> 別の列にしようか迷ったけどめんどい
    return new Link(vals[0], vals[1]);
  }

  build() {
    return this.code + "^^" + this.url;
  }
}

class DB {
  /**
   * @param {String} spreadsheetID スプレッドシートのid 
   */
  constructor(spreadsheetID) {
    try {
      this.spreadsheet = SpreadsheetApp.openById(spreadsheetID);
      this.sheet = this.spreadsheet.getSheets()[0];
    } catch (error) {
      Logger.log(error);
      return;
    }
  }

  /**
   * スプレッドシートに値を追加します
   *  
   * @param {String} value
   * @param {Number} column
   */
  appendColumn(value, column) {
    var lastrow = this.getColumn(column).length + 1;
    this.sheet.getRange(lastrow + 1, column).setValue(value);
  }

  /**
   * 指定のセルを空白にします
   * 
   * @param {Number} column
   * @param {Number} row
   */
  deleteAt(column, row) {
    this.setValueAt("", column, row);
  }

  /**
   * 指定のセルの値を変えます
   * 
   * @param {String} value
   * @param {Number} column
   * @param {Number} row
   */
  setValueAt(value, column, row) {
    this.sheet.getRange(row, column).setValue(value);
  }

  /**
   * スプレッドシートの任意の列全体を返します
   * 
   * @param {Number} column
   * @return {Array} 列の要素
   */
  getColumn(column) {
    var line;
    try {
      line = this.sheet.getRange(2, column, this.sheet.getLastRow() - 1, 1).getValues();
    } catch(error) {
      // console.log(error)
      return [];
    }

    var arr = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i][0].toString() != "") {
        arr.push(line[i][0]);
      }
    }
    return arr;
  }

  /**
   * リンクを全て取得します
   * 
   * @return {Array} リンク全て
   */
  getLinks() {
    return this.getColumn(1).map((s) => Link.fromText(s));
  }

  /**
   * リンクを探し、Linkクラスを返します
   * なかった場合は'*'と返します
   * 
   * @param {String} code
   */
  getLink(code) {
    var links = this.getLinks();
    for (let i = 0; i < links.length; i++) {
      if (links[i].code == code) {
        return links[i];
      }
    }
    return "*";
  }

  writeNewLink(link) {
    this.appendColumn(link.build(), 1);
  }
}

const DATABASE = new DB(SPREADSHEET_ID);

function doPost(e) {
  Logger.log("post payload: " + e.postData.getDataAsString());

  var params = JSON.parse(e.postData.getDataAsString());
  var url = params["url"].toString();

  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    Logger.log(url);
    url = "http://" + url;
  }

  var newLink = Link.createLink(url);
  DATABASE.writeNewLink(newLink);

  var o = ContentService.createTextOutput("{\"code\": " + newLink.code + "}");
  Logger.log("returned: " + o.getContent());
  o.setMimeType(ContentService.MimeType.JSON);
  return o;
}

function doGet(e) {
  Logger.log("get payload: " + e.parameter.code);
  var code = e.parameter.code.toString();

  if (!code instanceof String) {
    return;
  }

  var link = DATABASE.getLink(code);
  var result = "The code is invalid.";

  if (link instanceof Link) {
    result = link.url;
  }

  Logger.log("result: " + result);

  var o = ContentService.createTextOutput(result);
  o.setMimeType(ContentService.MimeType.TEXT);
  return o;
}

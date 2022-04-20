function doGet() {
  var htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  htmlOutput
    .setTitle('testesGAS+Vue.js')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
  return htmlOutput;
}

//スプレッドシート指定
const ss = SpreadsheetApp.openById('1H6UfgXJgJ2v1dBNv88iYDdvPj0iqob2dWiN15o2PJRo');

const firstRow = 7; //名前の最初の行
const nameCol = 2; // 名前の列

const raiCol = 6; //来客の列
const kitCol = 9; //帰宅の列

//Vueと連携させる情報の取得
function getSpreadsheetNameAndPersonalNames() {
  let ns = getPersonalNames();
  let sheet = getTodaySheet();
  let values = {
    selectedSheetName: sheet.getSheetName(),
    names: ns,
    lunches: getLunches(ns, sheet),
    //absences: getAbsences(ns),
    attendances: getAttendances(ns, sheet),
    stays: getStays(ns, sheet)
  };
  return values;
}

//今日の日付のシート取得
function getTodaySheet() {
  let date = new Date().getDate();
  let sheet = ss.getSheetByName('' + date);
  return sheet;
}

//名前をスプレッドシート内のリストから列挙し配列型で返す
function getPersonalNames() {
  let sheet = ss.getSheetByName('月次一覧');

  let names = [];
  let value;

  let values = sheet.getRange(4,2,60,1).getValues();

  for (let i = 0; i < 60; i++) {
    if (values[i][0] != "") names.push(values[i][0]);
    else break;
  }

  /*for (let row = 4;; row++) {
    value = sheet.getRange(row,2).getValue();
    if (value != "") names.push(value);
    else break;
  }*/

  return names;
}

//シートから食事情報取得しオブジェクト型で返す
function getLunches(names, sheet) {
  let lunches = {};
  let value;

  let col = 11; //食事の列

  let values = sheet.getRange(firstRow, col, names.length, 1).getValues();

  for (let i = 0; i < names.length; i++) {
    if (values[i][0] == '1') lunches[ names[i] ] = true;
    else                     lunches[ names[i] ] = false;
  }

  /*for (let row = firstRow; row - firstRow < names.length; row++) {
    value = sheet.getRange(row,col).getValue();
    if (value == '1') lunches[ names[row - firstRow] ] = true;
    else              lunches[ names[row - firstRow] ] = false;
  }*/

  return lunches;
}

//シートから休み情報取得しオブジェクト型で返す
/*function getAbsences(names) {
  let sheet = getTodaySheet();

  let absences = {};
  let value;

  let col = 5; //出席の列

  for (let row = firstRow; row - firstRow < names.length; row++) {
    value = sheet.getRange(row,col).getValue();
    if (value == '欠（加）') absences[ names[row - firstRow] ] = true;
    else                    absences[ names[row - firstRow] ] = false;
  }

  return absences;
}*/

function getAttendances(names, sheet) {
  let attendances = {};
  let value;

  let col = 5; //出席の列

  let values = sheet.getRange(firstRow, col, names.length, 1).getValues();

  for (let i = 0; i < names.length; i++) {
    attendances[ names[i] ] = values[i][0];
  }

  /*for (let row = firstRow; row - firstRow < names.length; row++) {
    value = sheet.getRange(row,col).getValue();

    attendances[ names[row - firstRow] ] = value;
  }*/

  return attendances;
}

//滞在中かどうかのフラグをオブジェクト型で返す
function getStays(names, sheet) {
  let stays = {};

  let raiValues = sheet.getRange(firstRow, raiCol, names.length, 1).getValues();
  let kitValues = sheet.getRange(firstRow, kitCol, names.length, 1).getValues();

  for (let i = 0; i < names.length; i++) {
    if      (raiValues[i][0] == '' && kitValues[i][0] == '') stays[ names[i] ] = 0;
    else if (raiValues[i][0] != '' && kitValues[i][0] == '') stays[ names[i] ] = 1;
    else if (raiValues[i][0] != '' && kitValues[i][0] != '') stays[ names[i] ] = 2;
    else                                                     stays[ names[i] ] = 0;
  }

  /*for (let row = firstRow; row - firstRow < names.length; row++) {

    rai = sheet.getRange(row,raiCol).getValue();
    kit = sheet.getRange(row,kitCol).getValue();

    if (rai != '' && kit == '') stays[ names[row - firstRow] ] = true;
    else                        stays[ names[row - firstRow] ] = false;
  }*/

  return stays;
}

/*function getSheetNames() {
  let sheets = ss.getSheets();
  let sn = [];
  for (let i = 1; i < sheets.length; i++) {
    sn.push(sheets[i].getSheetName());
  }
  return sn;
}*/

//時刻の書き込み
function set_date(names, name, rk, attendances) {
  let sheet = getTodaySheet();
  let index = names.indexOf(name);

  let row = index + firstRow;
  let col;

  if      (rk == '来客') col = raiCol; //来客の列
  else if (rk == '帰宅') col = kitCol; //帰宅の列

  let time = getTime_(rk);

  let cell = sheet.getRange(row,col);
  cell.setValue(time);

  set_attendance(names,name,attendances);
}

//web表示用データ
/*function show_date(name, rk) {
  let values = {
    name: name,
    time: getTime_(rk),
    rk: rk
  };
  return values;
}*/

//食事の切り替え
function set_lunch(names, name, lunches) {
  let sheet = getTodaySheet();
  let index = names.indexOf(name);

  let col = 11; //食事の列

  let row = index + firstRow;

  if (lunches[name]) {
    sheet.getRange(row, col).setValue('1');
  }
  else {
    sheet.getRange(row, col).setValue('');
  }
  
  /*for (let i = 0; i < names.length; i++) {
    if (lunches[names[i]]) {
      sheet.getRange(i+firstRow, col).setValue('1');
    }
    else {
      sheet.getRange(i+firstRow, col).setValue('');
    }
  }*/
}

//出席、欠席の切り替え
/*function set_absence(names, name, absences) {
  let sheet = getTodaySheet();
  let index = names.indexOf(name);

  let col = 5; //出席の列

  let row = index + firstRow;

  if (absences[name]) {
    sheet.getRange(index+firstRow, col).setValue('欠（加）');
  }
  else {
    sheet.getRange(index+firstRow, col).setValue('出席');
  }
}*/

//出欠の切り替え
function set_attendance(names, name, attendances) {
  let sheet = getTodaySheet();
  let index = names.indexOf(name);

  let col = 5; //出席の列
  let row = index+firstRow;

  sheet.getRange(row,col).setValue(attendances[name]);

  if (attendances[name] != '出席') {
    sheet.getRange(row,raiCol).setValue('');
    sheet.getRange(row,kitCol).setValue('');
  }
}

/*function change_sheet(sheetName) {
  let nameListSheet = ss.getSheetByName('名前リスト');
  let cell = nameListSheet.getRange(1,3);

  cell.setValue(sheetName);

  let values = {
    lunches: getLunches(getPersonalNames()),
    absences: getAbsences(getPersonalNames())
  };

  return values;
}*/


function t_(rk) {
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth()+1;
  let date = now.getDate();
  let hour = now.getHours();
  let minute = 0; //now.getMinutes();

  if (rk == '来客') {
    if      ( 8 <= hour && hour <  12) hour = 10;
    else if (12 <= hour && hour <= 15) hour = 13;
  }
  else if (rk == '帰宅') {
    if      ( 9 <= hour && hour <  13) hour = 12;
    else if (13 <= hour && hour <= 16) hour = 15;
  }
  
  let time = year + "年" + month + "月" + date + "日" + hour + "時" + minute + "分";

  return time;
}

function getTime_(rk) {
  let now = new Date();
  let hour = now.getHours();
  let minute = 0; //now.getMinutes();

  if (rk == '来客') {
    if      ( 8 <= hour && hour <  12) hour = 10;
    else if (12 <= hour && hour <= 15) hour = 13;
  }
  else if (rk == '帰宅') {
    if      ( 9 <= hour && hour <  13) hour = 12;
    else if (13 <= hour && hour <= 16) hour = 15;
  }

  //hour = 15; //デバッグ用
  
  if (minute == 0) minute = '00';

  let time = hour + ":" + minute;

  return time;
}










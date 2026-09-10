import { jqxGridComponent } from '../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';

export class Utils {

  public static getCheckedRows(myGrid: jqxGridComponent, field: string) {

    var rows = myGrid.getrows();
    var arrayData: any[] = [];
    for (var i = 0; i < rows.length; i++) {
      var index = rows[i];
      if (index.selected) {
        arrayData.push(index[field]);
      }
    }
    return arrayData;
  }

  public static getSelectedRows(myGrid: jqxGridComponent, field: string) {

    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];
      if (field == '')
        arrayData.push(row);
      else
        arrayData.push(row[field]);
    }
    return arrayData;
  }

  public static getNBSelectedRows(myGrid: jqxGridComponent, field: string) {

    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];
      if (row['bloqueo'] == 0) {
        if (field == '')
          arrayData.push(row);
        else
          arrayData.push(row[field]);
      }
    }
    return arrayData;
  }


  public static addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

}

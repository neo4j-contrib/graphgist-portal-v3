/* eslint no-loop-func: 0 */
/* eslint no-negated-in-lhs: 0 */

import $ from "jquery";

var convertCell, convertResult, render;

convertResult = function(data) {
  var column, columns, i, idx, j, len, len1, new_row, ref, result, row, row_idx, value;
  result = {
    columns: [],
    data: []
  };
  columns = data.columns;
  for (idx = i = 0, len = columns.length; i < len; idx = ++i) {
    column = columns[idx];
    result.columns[idx] = {
      sTitle: column
    };
  }
  ref = data.json;
  for (row_idx = j = 0, len1 = ref.length; j < len1; row_idx = ++j) {
    row = ref[row_idx];
    new_row = (function() {
      var k, len2, results;
      results = [];
      for (idx = k = 0, len2 = columns.length; k < len2; idx = ++k) {
        column = columns[idx];
        value = convertCell(row[column]);
        results.push(render(value));
      }
      return results;
    })();
    result.data[row_idx] = new_row;
  }
  return result;
};

render = function(cell) {
  if (typeof cell === 'string') {
    if (cell.match(/^https?:/)) {
      if (cell.match(/(jpg|png|gif)$/i)) {
        return '<img style="display:inline;max-height:100%" src="' + cell + '">';
      }
      return '<a href="' + cell + '" target="_blank">' + cell + '</a>';
    }
  }
  return cell;
};

convertCell = function(cell) {
  var c, i, labels, len, result;
  if (cell === null) {
    return '<null>';
  }
  if (cell instanceof Array) {
    result = [];
    for (i = 0, len = cell.length; i < len; i++) {
      c = cell[i];
      result.push(convertCell(c));
    }
    return "[" + (result.join(', ')) + "]";
  }
  if (cell instanceof Object) {
    if (cell['_type']) {
      return "(" + cell['_start'] + ")-[" + cell['_id'] + ":" + (cell['_type'] + props(cell)) + "]->(" + cell['_end'] + ")";
    } else if (cell['_id']) {
      labels = '';
      if (cell['_labels']) {
        labels = ':' + cell['_labels'].join(':');
      }
      return '(' + cell['_id'] + labels + props(cell) + ')';
    }
    return props(cell);
  }
  if (typeof cell === 'string') {
    if (cell.match(/^https?:/)) {
      if (cell.match(/(jpg|png|gif)$/i)) {
        return '<img style="display:inline;max-height:100%" src="' + cell + '">';
      }
      return '<a href="' + cell + '" target="_blank">' + cell + '</a>';
    }
  }
  return cell;
};

export const props = function(cell) {
  var key, props;
  props = [];
  for (key in cell) {
    if (cell.hasOwnProperty(key) && key[0] !== '_') {
      props.push([key] + ':' + JSON.stringify(cell[key]));
    }
  }
  if (props.length) {
    return " {" + (props.join(', ')) + "}";
  } else {
    return '';
  }
};

export const renderTable = function(element, data, options) {
  const $TABLE = $('<table class="ui table" cellpadding="0" cellspacing="0" border="0"></table>');

  var large, result, table;
  if (options == null) {
    options = {};
  }
  if (!data || !'stats' in data || !'rows' in data.stats) {
    return false;
  }
  result = convertResult(data);
  table = $TABLE.clone().appendTo($(element));
  large = result.data.length > 10;
  table.dataTable({
    aoColumns: result.columns,
    bAutoWidth: true,
    bFilter: large,
    bInfo: large,
    bLengthChange: large,
    bPaginate: options.paging || large,
    aaData: result.data,
    aLengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'All']],
    aaSorting: [],
    bSortable: true,
    searching: options.searching != null ? options.searching : true,
    oLanguage: {
      oPaginate: {
        sNext: ' >> ',
        sPrevious: ' << '
      }
    }
  });
  return true;
};
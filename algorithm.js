let line_record = [
  [], // [在此可能連線中，machine方所有棋子的size]
  [], // [在此可能連線中，player方所有棋子的size]
];

function machine_move_piece() {
  let best_move = calc_best_move();
  if (best_move == undefined) return false;

  let origin_piece = $(`[data-position=${best_move[0]}]`)
    .children(".piece")
    .last();
  let destination_cell = $(`[data-position=${best_move[1]}]`);

  origin_piece.addClass("selected");

  setTimeout(() => {
    origin_piece.detach().appendTo(destination_cell);
    origin_piece.attr("data-used", "1");
    update_board_record(best_move[0], best_move[1]);
    move_record.push([best_move[0], best_move[1]]);
    change_round();
    check_if_win();
  }, 400);
}

function calc_best_move() {
  let all_possible_moves = [];
  let if_player_has_3_pieces_in_line =
    jQuery.inArray(1 - manVSMachine, if_N_pieces_in_line(3)) !== -1;

  let machine_unused_pieces = [
    unused_pieces_record[manVSMachine][0].at(-1),
    unused_pieces_record[manVSMachine][1].at(-1),
    unused_pieces_record[manVSMachine][2].at(-1),
  ];

  for (let i = 0; i < machine_unused_pieces.length; i++) {
    if (machine_unused_pieces[i] == undefined) continue;

    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        if (pieces_location_record[j][k].length === 0) {
          all_possible_moves.push([
            (manVSMachine + 4).toString() + i.toString(),
            j.toString() + k.toString(),
          ]);
        } else if (
          pieces_location_record[j][k].at(-1)[1] <
            machine_unused_pieces[i][1] &&
          (pieces_location_record[j][k].at(-1)[0] === manVSMachine ||
            (pieces_location_record[j][k].at(-1)[0] !== manVSMachine &&
              if_player_has_3_pieces_in_line))
        ) {
          // 若所在位置(有比較小的棋子) 且
          //    (和machine所執棋子同色 或 (和machine所執棋子不同色 且 玩家已三子連線))

          all_possible_moves.push([
            (manVSMachine + 4).toString() + i.toString(),
            j.toString() + k.toString(),
          ]);
        }
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (pieces_location_record[i][j].length === 0) continue;

      if (pieces_location_record[i][j].at(-1)[0] === manVSMachine) {
        // 若該子屬於machine持方，則可以選擇作為起手子
        for (let k = 0; k < 4; k++) {
          for (let l = 0; l < 4; l++) {
            if (k === i && l === j) continue;

            if (
              pieces_location_record[k][l].length === 0 ||
              pieces_location_record[k][l].at(-1)[1] <
                pieces_location_record[i][j].at(-1)[1]
            ) {
              all_possible_moves.push([
                i.toString() + j.toString(),
                k.toString() + l.toString(),
              ]);
            }
          }
        }
      }
    }
  }

  let highest_score = [0, 0]; // [<當前最高積分>, <i>]

  // 逐一檢查每一個可能的移動
  for (let l = 0; l < all_possible_moves.length; l++) {
    // if (l !== all_possible_moves.length - 1) continue;
    let origin_x = parseInt(all_possible_moves[l][0].slice(0, 1));
    let origin_y = parseInt(all_possible_moves[l][0].slice(1, 2));
    let dest_x = parseInt(all_possible_moves[l][1].slice(0, 1));
    let dest_y = parseInt(all_possible_moves[l][1].slice(1, 2));
    let line_score = 0;
    let duplicate_record = JSON.parse(JSON.stringify(pieces_location_record));

    if (origin_x > 3) {
      // 若從場外拿棋子
      let moving_piece = machine_unused_pieces[origin_y];
      duplicate_record[dest_x][dest_y].push(moving_piece);

      // 逐一檢查落子處之所有可能連線
      loop1: for (let j = 0; j < 4; j++) {
        let current_line = [];
        for (let i = 0; i < 4; i++) {
          if (j === 0) {
            // 直行
            current_line.push(duplicate_record[i][dest_y]);
          } else if (j === 1) {
            // 橫行
            current_line.push(duplicate_record[dest_x][i]);
          } else if (j === 2 && dest_x === dest_y) {
            // 左上右下
            current_line.push(duplicate_record[i][i]);
          } else if (j === 3 && dest_x + dest_y === 3) {
            // 左下右上
            current_line.push(duplicate_record[i][3 - i]);
          } else {
            continue loop1;
          }
        }

        // 逐一檢查每一格子棋子個數
        for (let i = 0; i < 4; i++) {
          if (current_line[i].length === 0) continue;

          if (current_line[i].at(-1)[0] === manVSMachine) {
            // manchine方棋子個數
            line_record[0].push(current_line[i].at(-1)[1]);
          } else {
            // player方棋子個數
            line_record[1].push(current_line[i].at(-1)[1]);
          }
        }

        let a = calc_line_score(line_record);
        line_score += a;
      }
      // console.log(line_score);

      // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
      if (line_score >= highest_score[0]) {
        highest_score[0] = line_score;
        highest_score[1] = l;
      }
    } else {
      // 若從場上拿棋子
      let moving_piece = duplicate_record[origin_x][origin_y].pop();
      duplicate_record[dest_x][dest_y].push(moving_piece);

      // 逐一檢查起子處之所有可能連線
      loop1: for (let j = 0; j < 4; j++) {
        let current_line = [];
        for (let i = 0; i < 4; i++) {
          if (j === 0) {
            // 直行
            current_line.push(duplicate_record[i][origin_y]);
          } else if (j === 1) {
            // 橫行
            current_line.push(duplicate_record[origin_x][i]);
          } else if (j === 2 && origin_x === origin_y) {
            // 左上右下
            current_line.push(duplicate_record[i][i]);
          } else if (j === 3 && origin_x + origin_y === 3) {
            // 左下右上
            current_line.push(duplicate_record[i][3 - i]);
          } else {
            continue loop1;
          }
        }

        // 逐一檢查每一格子棋子個數
        for (let i = 0; i < 4; i++) {
          if (current_line[i].length === 0) continue;

          if (current_line[i].at(-1)[0] === manVSMachine) {
            // manchine方棋子個數
            line_record[0].push(current_line[i].at(-1)[1]);
          } else {
            // player方棋子個數
            line_record[1].push(current_line[i].at(-1)[1]);
          }
        }

        let a = calc_initial_line_score(line_record);
        line_score += a;
      }

      // 逐一檢查落子處之所有可能連線
      loop1: for (let j = 0; j < 4; j++) {
        let current_line = [];
        for (let i = 0; i < 4; i++) {
          if (j === 0) {
            // 直行
            current_line.push(duplicate_record[i][dest_y]);
          } else if (j === 1) {
            // 橫行
            current_line.push(duplicate_record[dest_x][i]);
          } else if (j === 2 && dest_x === dest_y) {
            // 左上右下
            current_line.push(duplicate_record[i][i]);
          } else if (j === 3 && dest_x + dest_y === 3) {
            // 左下右上
            current_line.push(duplicate_record[i][3 - i]);
          } else {
            continue loop1;
          }
        }

        // 逐一檢查每一格子棋子個數
        for (let i = 0; i < 4; i++) {
          if (current_line[i].length === 0) continue;

          if (current_line[i].at(-1)[0] === manVSMachine) {
            // manchine方棋子個數
            line_record[0].push(current_line[i].at(-1)[1]);
          } else {
            // player方棋子個數
            line_record[1].push(current_line[i].at(-1)[1]);
          }
        }

        let a = calc_line_score(line_record);
        line_score += a;
      }

      // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
      if (line_score >= highest_score[0]) {
        highest_score[0] = line_score;
        highest_score[1] = l;
      }
    }
  }

  // console.log(duplicate_record);
  // console.log(pieces_location_record);
  /////

  // console.log(all_possible_moves);

  return all_possible_moves[highest_score[1]];
}

function calc_initial_line_score(record) {
  let score = 0;

  // 扣掉起子處所在的此一連線上，對方棋子size的總和
  if (record[1].length !== 0) {
    for (let i = 0; i < record[1].length; i++) {
      score -= record[1][i];
    }
  }

  if (
    record[1].length === 4 ||
    (record[1].length === 3 &&
      (record[0].length === 0 || jQuery.inArray(4, record[0]) === -1))
  ) {
    score -= 100;
  }

  line_record[0] = [];
  line_record[1] = [];

  return score;
}

function calc_line_score(record) {
  let score = 0;

  // 落子後
  // 加權machine方棋子size
  for (let i = 0; i < record[0].length; i++) {
    score += record[0][i];
  }

  // machine方棋子數量為4，分數加100
  if (record[0].length === 4) {
    score += 10000;
  }

  // machine方棋子數量為1，player方棋子數量為3，且machine方棋子size為4
  if (
    record[0].length === 1 &&
    record[1].length === 3 &&
    jQuery.inArray(4, record[0]) !== -1
  ) {
    score += 1000;
  }

  if (
    (record[0].length === 3 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 3 && record[1].length === 0)
  ) {
    score += 900;
  }

  if (
    (record[0].length === 2 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 2 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 2 && record[1].length === 0)
  ) {
    score += 80;
  }

  if (
    (record[0].length === 1 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 1 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 1 && record[1].length === 0)
  ) {
    score += 70;
  }

  if (
    record[0].length === 3 &&
    record[1].length === 1 &&
    jQuery.inArray(4, record[1]) !== -1
  ) {
    score += 3;
  }

  if (
    (record[0].length === 2 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) !== -1) ||
    (record[0].length === 2 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) !== -1)
  ) {
    score += 2;
  }

  if (
    (record[0].length === 1 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) !== -1) ||
    (record[0].length === 1 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) !== -1)
  ) {
    score += 1;
  }

  line_record[0] = [];
  line_record[1] = [];

  return score;
}

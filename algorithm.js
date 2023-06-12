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
    if (move_record.length >= 2) {
      $(".retract-btn").removeClass("disabled");
    }
    $(".restart-btn").removeClass("disabled");
    change_round();
    check_if_win();
  }, 400);
}

function calc_best_move() {
  let all_possible_moves = [];
  let if_player_has_3_pieces_in_line =
    if_N_pieces_in_line(3)[1 - manVSMachine].length !== 0;
  let which_line_has_3_pieces = if_N_pieces_in_line(3)[1 - manVSMachine];
  let valid_position = [];

  for (let i = 0; i < which_line_has_3_pieces.length; i++) {
    if (which_line_has_3_pieces[i] < 4) {
      // 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        valid_position.push(
          which_line_has_3_pieces[i].toString() + j.toString()
        );
      }
    } else if (
      which_line_has_3_pieces[i] >= 4 &&
      which_line_has_3_pieces[i] < 8
    ) {
      // 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        valid_position.push(
          j.toString() + (which_line_has_3_pieces[i] - 4).toString()
        );
      }
    } else if (which_line_has_3_pieces[i] === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        valid_position.push(j.toString() + j.toString());
      }
    } else if (which_line_has_3_pieces[i] === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        valid_position.push(j.toString() + (3 - j).toString());
      }
    }
  }

  let machine_unused_pieces = [
    unused_pieces_record[manVSMachine][0].at(-1),
    unused_pieces_record[manVSMachine][1].at(-1),
    unused_pieces_record[manVSMachine][2].at(-1),
  ];

  let player_unused_pieces = [
    unused_pieces_record[1 - manVSMachine][0].at(-1),
    unused_pieces_record[1 - manVSMachine][1].at(-1),
    unused_pieces_record[1 - manVSMachine][2].at(-1),
  ];

  let used_player_size_3 = 0;
  let used_player_size_2 = 0;
  let used_player_size_1 = 0;
  let used_machine_size_3 = 0;
  let used_machine_size_2 = 0;
  let used_machine_size_1 = 0;
  let use_size_3 = false;
  let use_size_2 = false;
  let use_size_1 = false;

  for (let i = 0; i < player_unused_pieces.length; i++) {
    if (
      player_unused_pieces[i] == undefined ||
      player_unused_pieces[i][1] < 3
    ) {
      used_player_size_3++;
    }
  }

  for (let i = 0; i < player_unused_pieces.length; i++) {
    if (
      player_unused_pieces[i] == undefined ||
      player_unused_pieces[i][1] < 2
    ) {
      used_player_size_2++;
    }
  }

  for (let i = 0; i < player_unused_pieces.length; i++) {
    if (player_unused_pieces[i] == undefined) {
      used_player_size_1++;
    }
  }

  for (let i = 0; i < machine_unused_pieces.length; i++) {
    if (
      machine_unused_pieces[i] == undefined ||
      machine_unused_pieces[i][1] < 3
    ) {
      used_machine_size_3++;
    }
  }

  for (let i = 0; i < machine_unused_pieces.length; i++) {
    if (
      machine_unused_pieces[i] == undefined ||
      machine_unused_pieces[i][1] < 2
    ) {
      used_machine_size_2++;
    }
  }

  for (let i = 0; i < machine_unused_pieces.length; i++) {
    if (machine_unused_pieces[i] == undefined) {
      used_machine_size_1++;
    }
  }

  if (used_player_size_3 > used_machine_size_3) {
    use_size_3 = true;
  }

  if (used_player_size_2 > used_machine_size_2) {
    use_size_2 = true;
  }

  if (used_player_size_1 > used_machine_size_1) {
    use_size_1 = true;
  }

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
              if_player_has_3_pieces_in_line &&
              jQuery.inArray(j.toString() + k.toString(), valid_position) !==
                -1))
        ) {
          // 若落子位置(有比較小的棋子)
          //             且
          // (和machine所執棋子同色 或 (和machine所執棋子不同色 且 玩家已三子連線 且 落子位置在玩家三子連線上))

          all_possible_moves.push([
            (manVSMachine + 4).toString() + i.toString(),
            j.toString() + k.toString(),
          ]);
        }
      }
    }
  }

  let duplicate_record = JSON.parse(JSON.stringify(pieces_location_record));

  let lines = get_all_lines(duplicate_record);

  let lines_record = get_all_lines_record(lines);

  // 取得machine的自由棋子
  let machine_free_pieces = get_free_pieces(
    lines,
    lines_record,
    duplicate_record,
    manVSMachine
  );

  // console.log(machine_free_pieces);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (pieces_location_record[i][j].length === 0) continue;

      if (
        pieces_location_record[i][j].at(-1)[0] === manVSMachine &&
        machine_free_pieces[i][j].length !== 0
      ) {
        // 若該子屬於machine持方，且為自由棋子，則可以選擇作為起手子
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

  let highest_score = [-Infinity, 0]; // [<當前最高積分>, <i>]

  // 逐一檢查每一個可能的移動
  console.log("----------------------------------");
  console.log(all_possible_moves);
  outer_loop: for (let l = 0; l < all_possible_moves.length; l++) {
    // if (l !== 0) continue;
    // if (l !== all_possible_moves.length - 1) continue;
    let origin_x = parseInt(all_possible_moves[l][0].slice(0, 1));
    let origin_y = parseInt(all_possible_moves[l][0].slice(1, 2));
    let dest_x = parseInt(all_possible_moves[l][1].slice(0, 1));
    let dest_y = parseInt(all_possible_moves[l][1].slice(1, 2));
    let line_score = 0;
    let duplicate_record = JSON.parse(JSON.stringify(pieces_location_record));
    let moving_piece;

    if (origin_x > 3) {
      // 若從場外拿棋子
      if (
        (machine_unused_pieces[origin_y][1] === 3 && !use_size_3) ||
        (machine_unused_pieces[origin_y][1] === 2 && !use_size_2) ||
        (machine_unused_pieces[origin_y][1] === 1 && !use_size_1)
      ) {
        line_score -= 300000000;
      } else {
        line_score += 30000000;
      }

      moving_piece = machine_unused_pieces[origin_y];
    } else {
      // 若從場上拿棋子
      moving_piece = duplicate_record[origin_x][origin_y].pop();
    }

    duplicate_record[dest_x][dest_y].push(moving_piece);

    console.log(duplicate_record);

    let dest_piece_second_to_last = duplicate_record[dest_x][dest_y].at(-2);

    // 若從場外拿棋子
    if (origin_x > 3 && dest_piece_second_to_last != undefined) {
      // 且蓋住的是玩家的棋子
      if (dest_piece_second_to_last[0] === 1 - manVSMachine) {
        line_score += 400000000;
      }
    }

    // 若存在下面一顆棋子
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let dest_piece_1 = duplicate_record[i][j].at(-1);
        let dest_piece_2 = duplicate_record[i][j].at(-2);

        if (dest_piece_2 != undefined) {
          // 若蓋住的是玩家的棋子
          if (dest_piece_2[0] === 1 - manVSMachine) {
            if (dest_piece_1[1] === 4) {
              if (dest_piece_1[1] - dest_piece_2[1] === 1) {
                // 若最上面一顆棋子的大小 - 下面一顆棋子的大小 = 1
                // 4 -> 3
                line_score += 130000000;
              }
              // else {
              //   // 若最上面一顆棋子的大小為4
              //   // 4 -> 2 ： + 20
              //   // 4 -> 1 ： + 10
              //   line_score += 10 * (4 - (dest_piece_1[1] - dest_piece_2[1]));
              // }
            } else {
              // 若最上面一顆棋子的大小不為4
              if (dest_piece_1[1] - dest_piece_2[1] === 1) {
                // 若最上面一顆棋子的大小 - 下面一顆棋子的大小 = 1
                // 2 -> 1 or 3 -> 2
                line_score += 20000000;
              } else if (dest_piece_1[1] - dest_piece_2[1] === 2) {
                // 若最上面一顆棋子的大小 - 下面一顆棋子的大小 = 2
                // 3 -> 1
                line_score += 10000000;
              }
            }
          }
        }
      }
    }

    let all_lines = get_all_lines(duplicate_record);

    let all_lines_record = get_all_lines_record(all_lines);

    // 取得machine的自由棋子
    let machine_free_pieces = get_free_pieces(
      all_lines,
      all_lines_record,
      duplicate_record,
      manVSMachine
    );

    // 取得player的自由棋子
    let player_free_pieces = get_free_pieces(
      all_lines,
      all_lines_record,
      duplicate_record,
      1 - manVSMachine
    );

    // 逐一檢查棋盤上所有可能連線
    for (let i = 0; i < 10; i++) {
      let score = calc_line_score(
        all_lines_record[i],
        i,
        machine_free_pieces,
        player_free_pieces,
        machine_unused_pieces,
        player_unused_pieces,
        duplicate_record
      );
      line_score += score;
    }

    // 逐一檢查棋盤上每一格的所有可能連線
    let score_cross = calc_cross_score(
      duplicate_record,
      all_lines_record,
      machine_free_pieces,
      player_free_pieces
    );
    line_score += score_cross;

    // console.log(`score_cross: ${score_cross}`);
    console.log(`第${l}個移動：${line_score}`);

    // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
    if (
      line_score > highest_score[0] ||
      (line_score === highest_score[0] && Math.random() < 0.1)
    ) {
      highest_score[0] = line_score;
      highest_score[1] = l;
    }

    console.log(highest_score);
  }

  return all_possible_moves[highest_score[1]];
}

function calc_line_score(
  record,
  current_line_index,
  machine_free_pieces,
  player_free_pieces,
  machine_unused_pieces,
  player_unused_pieces,
  duplicate_record
) {
  let score = 0;
  let player_free_pieces_out_of_line = JSON.parse(
    JSON.stringify(player_free_pieces)
  );
  let machine_free_pieces_out_of_line = JSON.parse(
    JSON.stringify(machine_free_pieces)
  );

  // 落子後
  // 加上machine方棋子size
  for (let i = 0; i < record[manVSMachine].length; i++) {
    score += record[manVSMachine][i];
  }

  // 扣掉player方棋子size
  for (let i = 0; i < record[1 - manVSMachine].length; i++) {
    score -= record[1 - manVSMachine][i];
  }

  // machine方棋子數量為4
  if (record[manVSMachine].length === 4) {
    score += 5000000000;
  }

  // player方棋子數量為4
  if (record[1 - manVSMachine].length === 4) {
    score -= 5000000000;
  }

  // machine方棋子數量為0，且player方棋子數量為3
  if (
    record[manVSMachine].length === 0 &&
    record[1 - manVSMachine].length === 3
  ) {
    score -= 1000000000;
  }

  // machine方棋子數量為1，player方棋子數量為3
  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 3
  ) {
    // 將所有自由棋子中，位於此線段的棋子清除
    if (current_line_index < 4) {
      // 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        player_free_pieces_out_of_line[current_line_index][j].length = 0;
      }
    } else if (current_line_index >= 4 && current_line_index < 8) {
      // 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        player_free_pieces_out_of_line[j][current_line_index - 4].length = 0;
      }
    } else if (current_line_index === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        player_free_pieces_out_of_line[j][j].length = 0;
      }
    } else if (current_line_index === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        player_free_pieces_out_of_line[j][3 - j].length = 0;
      }
    }

    // 目前得到所有不在此線段的player方自由棋子: player_free_pieces_out_of_line

    // 若其中有size比此線段machine方棋子大的，才扣分
    let already_minus = false;

    loop1: for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (player_free_pieces_out_of_line[i][j].length !== 0) {
          if (
            player_free_pieces_out_of_line[i][j][1] > record[manVSMachine][0]
          ) {
            score -= 1000000000;
            already_minus = true;
            break loop1;
          }
        }
      }
    }

    // 如果還沒扣過100000分的話
    if (!already_minus) {
      // 若player場外有棋子更大，且machine方已三子連線
      loop1: for (let i = 0; i < 3; i++) {
        if (player_unused_pieces[i] == undefined) continue loop1;

        if (
          player_unused_pieces[i][1] > record[manVSMachine][0] &&
          if_N_pieces_in_line(3, duplicate_record)[manVSMachine] !== -1
        ) {
          score -= 1000000000;
          break loop1;
        }
      }
    }
  }

  // machine方棋子數量為3，player方棋子數量為1
  if (
    record[manVSMachine].length === 3 &&
    record[1 - manVSMachine].length === 1
  ) {
    // 將所有自由棋子中，位於此線段的棋子清除
    if (current_line_index < 4) {
      // 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        machine_free_pieces_out_of_line[current_line_index][j].length = 0;
      }
    } else if (current_line_index >= 4 && current_line_index < 8) {
      // 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        machine_free_pieces_out_of_line[j][current_line_index - 4].length = 0;
      }
    } else if (current_line_index === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        machine_free_pieces_out_of_line[j][j].length = 0;
      }
    } else if (current_line_index === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        machine_free_pieces_out_of_line[j][3 - j].length = 0;
      }
    }

    // 若玩家在場外有比這3子連線的棋子還大的棋子，不加分
    loop2: for (let i = 0; i < 3; i++) {
      if (player_unused_pieces[i] == undefined) continue loop2;

      if (player_unused_pieces[i][1] > Math.min(...record[manVSMachine])) {
        score -= 100000000;
        break loop2;
      }
    }

    // 目前得到所有不在此線段的machine方自由棋子: machine_free_pieces_out_of_line

    // 若其中有size比此線段player方棋子大的，才加分
    let already_plus = false;

    loop1: for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (machine_free_pieces_out_of_line[i][j].length !== 0) {
          if (
            machine_free_pieces_out_of_line[i][j][1] >
            record[1 - manVSMachine][0]
          ) {
            score += 100000000;
            already_plus = true;
            break loop1;
          }
        }
      }
    }

    // 如果還沒加過3000分的話
    if (!already_plus) {
      // 若machine場外有棋子更大，且player方已三子連線
      loop1: for (let i = 0; i < 3; i++) {
        if (machine_unused_pieces[i] == undefined) continue loop1;

        if (
          machine_unused_pieces[i][1] > record[1 - manVSMachine][0] &&
          if_N_pieces_in_line(3, duplicate_record)[1 - manVSMachine] !== -1
        ) {
          score += 100000000;
          break loop1;
        }
      }
    }
  }

  // machine方棋子數量為3，player方棋子數量為0
  if (
    record[manVSMachine].length === 3 &&
    record[1 - manVSMachine].length === 0
  ) {
    loop1: for (let i = 0; i < 3; i++) {
      if (player_unused_pieces[i] == undefined) continue loop1;

      if (player_unused_pieces[i][1] > Math.min(...record[manVSMachine])) {
        score -= 100000000;
        break loop1;
      }
    }

    score += 100000000;
  }

  if (
    record[manVSMachine].length === 0 &&
    record[1 - manVSMachine].length === 2
  ) {
    score -= 10000000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[manVSMachine]) === -1
  ) {
    score -= 10000000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[manVSMachine]) === -1
  ) {
    score -= 10000000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 0
  ) {
    score += 1000000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[1 - manVSMachine]) === -1
  ) {
    score += 1000000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[1 - manVSMachine]) === -1
  ) {
    score += 1000000;
  }

  if (
    record[manVSMachine].length === 0 &&
    record[1 - manVSMachine].length === 1
  ) {
    score -= 100000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[manVSMachine]) === -1
  ) {
    score -= 100000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[manVSMachine]) === -1
  ) {
    score -= 100000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 0
  ) {
    score += 10000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[1 - manVSMachine]) === -1
  ) {
    score += 10000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[1 - manVSMachine]) === -1
  ) {
    score += 10000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 3 &&
    jQuery.inArray(4, record[manVSMachine]) !== -1
  ) {
    score -= 1000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[manVSMachine]) !== -1
  ) {
    score -= 1000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[manVSMachine]) !== -1
  ) {
    score -= 1000;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[manVSMachine]) !== -1
  ) {
    score -= 1000;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[manVSMachine]) !== -1
  ) {
    score -= 1000;
  }

  if (
    record[manVSMachine].length === 3 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[1 - manVSMachine]) !== -1
  ) {
    score += 100;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[1 - manVSMachine]) !== -1
  ) {
    score += 100;
  }

  if (
    record[manVSMachine].length === 2 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[1 - manVSMachine]) !== -1
  ) {
    score += 100;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 1 &&
    jQuery.inArray(4, record[1 - manVSMachine]) !== -1
  ) {
    score += 100;
  }

  if (
    record[manVSMachine].length === 1 &&
    record[1 - manVSMachine].length === 2 &&
    jQuery.inArray(4, record[1 - manVSMachine]) !== -1
  ) {
    score += 100;
  }

  return score;
}

function get_free_pieces(
  all_lines,
  all_lines_record,
  duplicate_record,
  black_or_white
) {
  // 逐一檢查棋盤上所有可能連線
  let free_pieces = [[], [], [], []];
  let duplicate_record2 = JSON.parse(JSON.stringify(duplicate_record));

  for (let i = 0; i < 10; i++) {
    let who_has_one_only = -1; // -1:該線上所有棋子均自由

    if (
      all_lines_record[i][1].length === 1 &&
      all_lines_record[i][0].length === 3
    ) {
      // machine方棋子數量為1，player方棋子數量為3
      who_has_one_only = 1;
    } else if (
      all_lines_record[i][1].length === 3 &&
      all_lines_record[i][0].length === 1
    ) {
      // machine方棋子數量為3，player方棋子數量為1
      who_has_one_only = 0;
    }

    for (let k = 0; k < 4; k++) {
      // 若有數量比為1:3的狀況 and 目前線段第k的位置數量為"1"
      if (
        who_has_one_only > -1 &&
        all_lines[i][k].at(-1)[0] === who_has_one_only
      ) {
        // 若此位置底下有棋子 and 此棋子的顏色和最上層不同
        if (
          all_lines[i][k].at(-2) != undefined &&
          all_lines[i][k].at(-2)[0] !== all_lines[i][k].at(-1)[0]
        ) {
          // 判斷為不自由棋子，並將該位置所有棋子刪除
          if (i < 4) {
            // i = 0,1,2,3 橫行
            duplicate_record2[i][k].length = 0;
          } else if (i >= 4 && i < 8) {
            // i = 4,5,6,7 直行
            duplicate_record2[k][i - 4].length = 0;
          } else if (i === 8) {
            // 左上右下
            duplicate_record2[k][k].length = 0;
          } else if (i === 9) {
            // 右上左下
            duplicate_record2[k][3 - k].length = 0;
          }
        }
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (duplicate_record2[i][j].length !== 0) {
        free_pieces[i][j] = duplicate_record2[i][j].at(-1);
      } else {
        free_pieces[i][j] = [];
      }
    }
  }
  // console.log(free_pieces);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (
        free_pieces[i][j].length !== 0 &&
        free_pieces[i][j][0] === 1 - black_or_white
      ) {
        free_pieces[i][j].length = 0;
      }
    }
  }

  return free_pieces;
}

function get_all_lines(duplicate_record) {
  // 逐一檢查棋盤上所有可能連線
  let lines = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 0; i < 10; i++) {
    if (i < 4) {
      // i = 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        lines[i].push(duplicate_record[i][j]);
      }
    } else if (i >= 4 && i < 8) {
      // i = 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        lines[i].push(duplicate_record[j][i - 4]);
      }
    } else if (i === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        lines[i].push(duplicate_record[j][j]);
      }
    } else if (i === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        lines[i].push(duplicate_record[j][3 - j]);
      }
    }
  }
  return lines;
}

function get_all_lines_record(all_lines) {
  // [<白>, <黑>]
  let line_record = [
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
    [[], []],
  ];

  for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 4; k++) {
      if (all_lines[i][k].length === 0) continue;

      if (all_lines[i][k].at(-1)[0] === 0) {
        // 白方棋子個數
        line_record[i][0].push(all_lines[i][k].at(-1)[1]);
      } else {
        // 黑方棋子個數
        line_record[i][1].push(all_lines[i][k].at(-1)[1]);
      }
    }
  }
  return line_record;
}

function calc_cross_score(
  duplicate_record,
  all_lines_record,
  machine_free_pieces,
  player_free_pieces
) {
  let score = 0;
  let line_index = [
    [0, 4, 8],
    [0, 5],
    [0, 6],
    [0, 7, 9],
    [1, 4],
    [1, 5, 8],
    [1, 6, 9],
    [1, 7],
    [2, 4],
    [2, 5, 9],
    [2, 6, 8],
    [2, 7],
    [3, 4, 9],
    [3, 5],
    [3, 6],
    [3, 7, 8],
  ];

  outer_loop: for (let i = 0; i < line_index.length; i++) {
    // 計算玩家雙活三情況所設變數
    let player_free_pieces_out_of_line = JSON.parse(
      JSON.stringify(player_free_pieces)
    );
    let all_machine_free_pieces = JSON.parse(
      JSON.stringify(machine_free_pieces)
    );

    // 計算我方雙活三情況所設變數
    let all_player_free_pieces = JSON.parse(JSON.stringify(player_free_pieces));
    let machine_free_pieces_out_of_line1 = JSON.parse(
      JSON.stringify(machine_free_pieces)
    );
    let machine_free_pieces_out_of_line2 = JSON.parse(
      JSON.stringify(machine_free_pieces)
    );

    let this_position_piece;
    let coordinate;
    if (i >= 0 && i < 4) {
      // 0,1,2,3
      coordinate = [0, i];
    } else if (i >= 4 && i < 8) {
      // 4,5,6,7
      coordinate = [1, i - 4];
    } else if (i >= 8 && i < 12) {
      // 8,9,10,11
      coordinate = [2, i - 8];
    } else if (i >= 12 && i < 16) {
      // 12,13,14,15
      coordinate = [3, i - 12];
    }

    if (duplicate_record[coordinate[0]][coordinate[1]].at(-1) != undefined) {
      this_position_piece =
        duplicate_record[coordinate[0]][coordinate[1]].at(-1);
    } else {
      this_position_piece = [];
    }

    // index_list: 在目前格子中，有弱勢連線的線段編號
    // 若該格子出現2條弱勢連線，扣5萬分
    // 例如: 在第一格中，[0, 4, 8]三條線有[0, 4]出現player方有兩顆棋子的狀況
    let index_list = [];

    for (let j = 0; j < line_index[i].length; j++) {
      let index = line_index[i][j];
      if (
        all_lines_record[index][manVSMachine].length === 0 &&
        all_lines_record[index][1 - manVSMachine].length === 2 &&
        this_position_piece[0] !== 1 - manVSMachine
      ) {
        index_list.push(index);
      }

      if (
        all_lines_record[index][manVSMachine].length === 1 &&
        all_lines_record[index][1 - manVSMachine].length === 2 &&
        this_position_piece[0] !== 1 - manVSMachine &&
        jQuery.inArray(4, all_lines_record[index][manVSMachine]) === -1
      ) {
        index_list.push(index);
      }

      if (
        all_lines_record[index][manVSMachine].length === 2 &&
        all_lines_record[index][1 - manVSMachine].length === 2 &&
        this_position_piece[0] !== 1 - manVSMachine &&
        jQuery.inArray(4, all_lines_record[index][manVSMachine]) === -1
      ) {
        index_list.push(index);
      }

      if (
        all_lines_record[index][manVSMachine].length === 1 &&
        all_lines_record[index][1 - manVSMachine].length === 3 &&
        this_position_piece[0] === manVSMachine &&
        jQuery.inArray(4, all_lines_record[index][manVSMachine]) === -1
      ) {
        index_list.push(index);
      }
    }

    if (index_list.length === 3) {
      let score_list = [];

      for (let i = 0; i < index_list.length; i++) {
        let player_pieces = all_lines_record[index_list[i]][1 - manVSMachine];
        let score = 0;

        for (let j = 0; j < player_pieces.length; j++) {
          if (player_pieces[j] === 4) {
            score += 100;
          } else {
            score += player_pieces[j];
          }
        }
        score_list.push(score);
      }

      let maximum = Math.max(...score_list);

      let index = score_list.indexOf(maximum);
      if (index !== -1) {
        index_list.splice(index, 1);
      }
    }

    if (index_list.length >= 2) {
      // true: (X,2), false:(1,3),
      // two_player_pieces = [false, false];
      // two_player_pieces = [false, true];
      let two_player_pieces = [];

      for (let j = 0; j < index_list.length; j++) {
        let machine = all_lines_record[index_list[j]][manVSMachine];
        let player = all_lines_record[index_list[j]][1 - manVSMachine];
        if (machine.length === 1 && player.length === 3) {
          two_player_pieces[j] = false;
        } else if (player.length === 2) {
          two_player_pieces[j] = true;
        }
      }

      // 判斷此2或3條線段以外自由的player棋子能否蓋過該線段之machine棋子

      for (let i = 0; i < index_list.length; i++) {
        // 若此線段player只有2顆棋子，player的自由棋子要扣掉此線段上的2顆
        // 若此線段player有3顆棋子，則不扣掉，3顆均納入為player自由棋子
        if (two_player_pieces[i]) {
          if (index_list[i] < 4) {
            // 0,1,2,3
            for (let j = 0; j < 4; j++) {
              // 橫行
              player_free_pieces_out_of_line[index_list[i]][j].length = 0;
            }
          } else if (index_list[i] >= 4 && index_list[i] < 8) {
            // 4,5,6,7
            for (let j = 0; j < 4; j++) {
              // 直行
              player_free_pieces_out_of_line[j][index_list[i] - 4].length = 0;
            }
          } else if (index_list[i] === 8) {
            for (let j = 0; j < 4; j++) {
              // 左上右下
              player_free_pieces_out_of_line[j][j].length = 0;
            }
          } else if (index_list[i] === 9) {
            for (let j = 0; j < 4; j++) {
              // 左下右上
              player_free_pieces_out_of_line[j][3 - j].length = 0;
            }
          }
        }
      }

      let available_free_player_pieces = [];
      let available_free_machine_pieces = [];
      let weak_machine_pieces = [];

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (player_free_pieces_out_of_line[i][j].length !== 0) {
            available_free_player_pieces.push(
              player_free_pieces_out_of_line[i][j][1]
            );
          }

          if (all_machine_free_pieces[i][j].length !== 0) {
            available_free_machine_pieces.push(
              all_machine_free_pieces[i][j][1]
            );
          }
        }
      }

      for (let j = 0; j < index_list.length; j++) {
        let this_line_record = all_lines_record[index_list[j]][manVSMachine];
        for (let k = 0; k < this_line_record.length; k++) {
          weak_machine_pieces.push(this_line_record[k]);
        }
      }

      for (let j = 0; j < index_list.length - 1; j++) {
        let index = weak_machine_pieces.indexOf(this_position_piece[1]);
        if (index !== -1) {
          weak_machine_pieces.splice(index, 1);
        }
      }

      // 最大的自由的player棋子 >= 最大的自由的machine棋子 且
      // 此位置沒有棋子 或 最大的自由的player棋子比此位置的棋子大 且
      // 兩條線內沒有size=4的machine棋子 且
      // 最大的自由的player棋子 > 最大的位於線上的machine
      if (
        Math.max(...available_free_player_pieces) >=
          Math.max(...available_free_machine_pieces) &&
        (this_position_piece.length === 0 ||
          Math.max(...available_free_player_pieces) > this_position_piece[1]) &&
        jQuery.inArray(4, weak_machine_pieces) === -1 &&
        Math.max(...available_free_player_pieces) >
          Math.max(...weak_machine_pieces)
      ) {
        let minus_score = true;

        for (let j = 0; j < index_list.length; j++) {
          let player = all_lines_record[index_list[j]][1 - manVSMachine];
          let machine = all_lines_record[index_list[j]][manVSMachine];
          let free_player_pieces_remove_4 = available_free_player_pieces.filter(
            function (e) {
              return e !== 4;
            }
          );

          // 若這兩條交叉線有其中一條是[4,4]<player>,[3]<machine>，且
          // 最大的自由的player棋子為4，且
          // 最大的自由的machine棋子 > 已移除4後的最大的自由的player棋子
          // -> player必須用size=4蓋住，形成[4,4,4]<player>,[3]<machine>
          if (
            player.length === 2 &&
            player[0] === 4 &&
            player[1] === 4 &&
            machine.length === 1 &&
            machine[0] === 3 &&
            Math.max(...available_free_player_pieces) === 4 &&
            Math.max(...available_free_machine_pieces) >
              Math.max(...free_player_pieces_remove_4)
          ) {
            minus_score = false;
          }
        }

        if (minus_score) {
          score -= 230000000;
          break outer_loop;
        }
      }
      // console.log(available_free_player_pieces);
      // console.log(weak_machine_pieces);
    }

    // index_list2: 在目前格子中，有(3,0)或(3,1)的線段編號
    let index_list2 = [];

    for (let j = 0; j < line_index[i].length; j++) {
      let index = line_index[i][j];
      // 若該條線上，我方棋子數量為3 且
      // 玩家棋子數量為0 且
      // 交叉點上為我方的棋子 且
      if (
        all_lines_record[index][manVSMachine].length === 3 &&
        all_lines_record[index][1 - manVSMachine].length === 0 &&
        this_position_piece[0] === manVSMachine
      ) {
        index_list2.push(index);
      }

      // 若該條線上，我方棋子數量為3 且
      // 玩家棋子數量為1 且
      // 交叉點上為我方的棋子 且
      // 該條線上玩家的棋子大小不為4
      if (
        all_lines_record[index][manVSMachine].length === 3 &&
        all_lines_record[index][1 - manVSMachine].length === 1 &&
        this_position_piece[0] === manVSMachine &&
        jQuery.inArray(4, all_lines_record[index][1 - manVSMachine]) === -1
      ) {
        index_list2.push(index);
      }
    }

    // 若有3條關鍵連線，選取較為弱勢的兩條
    if (index_list2.length === 3) {
      let score_list = [];

      for (let i = 0; i < index_list2.length; i++) {
        let machine_pieces = all_lines_record[index_list2[i]][manVSMachine];
        let score = 0;

        for (let j = 0; j < machine_pieces.length; j++) {
          if (machine_pieces[j] === 4) {
            score += 100;
          } else {
            score += machine_pieces[j];
          }
        }
        score_list.push(score);
      }

      let maximum = Math.max(...score_list);

      let index = score_list.indexOf(maximum);
      if (index !== -1) {
        index_list2.splice(index, 1);
      }
    }

    if (index_list2.length >= 2) {
      // 判斷此2條線段以外自由的player棋子能否蓋過該線段之machine棋子

      // 若此線段player只有2顆棋子，player的自由棋子要扣掉此線段上的2顆
      if (index_list2[0] < 4) {
        // 0,1,2,3
        for (let j = 0; j < 4; j++) {
          // 橫行
          machine_free_pieces_out_of_line1[index_list2[0]][j].length = 0;
        }
      } else if (index_list2[0] >= 4 && index_list2[0] < 8) {
        // 4,5,6,7
        for (let j = 0; j < 4; j++) {
          // 直行
          machine_free_pieces_out_of_line1[j][index_list2[0] - 4].length = 0;
        }
      } else if (index_list2[0] === 8) {
        for (let j = 0; j < 4; j++) {
          // 左上右下
          machine_free_pieces_out_of_line1[j][j].length = 0;
        }
      } else if (index_list2[0] === 9) {
        for (let j = 0; j < 4; j++) {
          // 左下右上
          machine_free_pieces_out_of_line1[j][3 - j].length = 0;
        }
      }

      if (index_list2[1] < 4) {
        // 0,1,2,3
        for (let j = 0; j < 4; j++) {
          // 橫行
          machine_free_pieces_out_of_line2[index_list2[1]][j].length = 0;
        }
      } else if (index_list2[1] >= 4 && index_list2[1] < 8) {
        // 4,5,6,7
        for (let j = 0; j < 4; j++) {
          // 直行
          machine_free_pieces_out_of_line2[j][index_list2[1] - 4].length = 0;
        }
      } else if (index_list2[1] === 8) {
        for (let j = 0; j < 4; j++) {
          // 左上右下
          machine_free_pieces_out_of_line2[j][j].length = 0;
        }
      } else if (index_list2[1] === 9) {
        for (let j = 0; j < 4; j++) {
          // 左下右上
          machine_free_pieces_out_of_line2[j][3 - j].length = 0;
        }
      }

      let available_all_player_free_pieces = [];
      let available_free_machine_pieces_out_of_line1 = [];
      let available_free_machine_pieces_out_of_line2 = [];
      let weak_player_pieces1 = 0;
      let weak_player_pieces2 = 0;

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (all_player_free_pieces[i][j].length !== 0) {
            available_all_player_free_pieces.push(
              all_player_free_pieces[i][j][1]
            );
          }

          if (machine_free_pieces_out_of_line1[i][j].length !== 0) {
            available_free_machine_pieces_out_of_line1.push(
              machine_free_pieces_out_of_line1[i][j][1]
            );
          }

          if (machine_free_pieces_out_of_line2[i][j].length !== 0) {
            available_free_machine_pieces_out_of_line2.push(
              machine_free_pieces_out_of_line2[i][j][1]
            );
          }
        }
      }

      for (let j = 0; j < index_list2.length; j++) {
        let this_line_record =
          all_lines_record[index_list2[j]][1 - manVSMachine];
        if (this_line_record.length === 0) continue;

        if (j === 0) weak_player_pieces1 = this_line_record[0];
        if (j === 1) weak_player_pieces2 = this_line_record[0];
      }

      if (
        this_position_piece[1] >=
          Math.max(...available_all_player_free_pieces) &&
        Math.max(...available_free_machine_pieces_out_of_line1) >
          weak_player_pieces1 &&
        Math.max(...available_free_machine_pieces_out_of_line2) >
          weak_player_pieces2
      ) {
        score += 5000000000;
        break outer_loop;
      }

      // console.log(available_free_player_pieces);
      // console.log(weak_machine_pieces);
    }
  }

  return score;
}

function debug_move_piece(number) {
  manVSMachine = number;
  machine_move_piece();
  // manVSMachine = -1;
}

function debug_change_mode(number) {
  manVSMachine = number;
}

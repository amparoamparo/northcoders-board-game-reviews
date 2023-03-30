const db = require("../db/connection");

exports.fetchReviewComments = (reviewId) => {
  const queryStr = `
    SELECT
      *
    FROM
      comments
    WHERE
      review_id = $1
    ORDER BY
      created_at DESC
  `;

  return db.query(queryStr, [reviewId]).then((queryResponse) => {
    const reviewComments = queryResponse.rows;

    if (!reviewComments.length) {
      return db
        .query(`SELECT * FROM reviews WHERE review_id = $1`, [reviewId])
        .then((queryResponse) => {
          if (queryResponse.rowCount === 0) {
            return Promise.reject({
              status: 404,
              msg: "We couldn't find any reviews with that ID. Check your request and try again.",
            });
          } else {
            return reviewComments;
          }
        });
    }

    return reviewComments;
  });
};

exports.createComment = (reviewId, commentAuthor, commentContent) => {
  const queryStr = `
  INSERT INTO comments
  (review_id, author, body)
  VALUES
  ($1, $2, $3)
  RETURNING *; 
  `;

  return db
    .query(queryStr, [reviewId, commentAuthor, commentContent])
    .then((newComment) => {
      const postedComment = newComment.rows[0];

      return postedComment;
    });
};

exports.removeComment = (commentId) => {
  queryStr = `
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;
  `;

  return db.query(queryStr, [commentId]).then((queryResponse) => {
    const deletedComment = queryResponse.rows[0];

    if (deletedComment === undefined) {
      return Promise.reject({
        status: 404,
        msg: "We couldn't find any comments with that ID. Check your request and try again.",
      });
    }

    return deletedComment;
  });
};
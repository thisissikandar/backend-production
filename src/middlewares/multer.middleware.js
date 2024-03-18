import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //dont use like this becouse duplication o server
  },
});

export const upload = multer({
  storage,
});

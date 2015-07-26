var multiparty = require('multiparty'),
    fs         = require('fs'),
    path       = require('path'),
    ueditor, respond;

ueditor = function(static_url, handel) {
  return function(req, res, next) {
    var _respond = respond(static_url, handel);
    _respond(req, res, next);
  };
};

respond = function(static_url, callback) {

  return function(req, res, next) {

    if (req.query.action === 'listimage') {

      res.ue_list = function(list_dir) {
        var str  = '',
            i    = 0,
            list = [];

        fs.readdir(static_url + list_dir, function(err, files) {
          if (err) throw err;

          var total = files.length;

          files.forEach(function(file) {

            var filetype  = 'jpg,png,gif,ico,bmp',
                tmplist   = file.split('.'),
                _filetype = tmplist[tmplist.length - 1],
                temp;

            if (filetype.indexOf(_filetype.toLowerCase()) >= 0) {
              temp = {};
              if (list_dir === '/') {
                temp.url = list_dir + file;
              } else {
                temp.url = list_dir + "/" + file;
              }
              list[i] = (temp);
            }

            i++;
            // send file name string when all files was processed
            if (i === total) {
              res.json({
                "state": "SUCCESS",
                "list": list,
                "start": 1,
                "total": total
              });
            }
          });
        });
      };
      callback(req, res, next);

    } else if (req.query.action === 'uploadimage') {

      res.ue_up = function(img_url) {
        var 
            UPLOAD_FILE = './public' + img_url,
            // 生成 multiparty对象, 并配置下载目标路径
            form        = new multiparty.Form({uploadDir: UPLOAD_FILE});

        // 下载后处理
        form.parse(req, function(err, fields, files) {
          var inputFile, uploadedPath, dstPath;

          if (err) {
            console.log('parse files: ' + err);
          } else {

            inputFile = files.upfile[0];
            uploadedPath = inputFile.path;
            dstPath = UPLOAD_FILE + inputFile.originalFilename;

            // 重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {
              if (err) {
                console.log('rename error: ' + err);
              } else {

                res.json({
                  'url': path.join(img_url, inputFile.originalFilename),
                  'original': inputFile.originalFilename,
                  'state': 'SUCCESS'
                });

              }
            });
          }
        });
      }

      callback(req, res, next);
    } else {
      callback(req, res, next);
    }
    return;
  };
};

module.exports = ueditor;

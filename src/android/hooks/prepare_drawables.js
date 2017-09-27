var ICON_FILENAME = 'icon.png';

var map_folders = [
  {
		src: "mipmap-hdpi",
		dst: "drawable-hdpi"
	},
	{
		src: "mipmap-ldpi",
		dst: "drawable-ldpi"
	},
	{
		src: "mipmap-mdpi",
		dst: "drawable-mdpi"
	},
	{
		src: "mipmap-xhdpi",
		dst: "drawable-xhdpi"
	},
	{
		src: "mipmap-xxhdpi",
		dst: "drawable-xxhdpi"
	},
	{
		src: "mipmap-xxxhdpi",
		dst: "drawable-xxxhdpi"
	}];

module.exports = function (ctx) {

  // make sure android platform is part of build
  if (ctx.opts.platforms.indexOf('android') < 0) {
    return;
  }

  console.error("Running hook to create drawables");

  var fs = ctx.requireCordovaModule('fs');
  var path = ctx.requireCordovaModule('path');

  var res_dir = path.join(ctx.opts.projectRoot + '/platforms/android/res/')

  map_folders.forEach(function(folder) {
    var drawable_folder = path.join(res_dir, folder.dst);

    if (!fs.existsSync(drawable_folder))
      fs.mkdirSync(drawable_folder);
    else
      console.log("Folder " + folder.dst + " already exists");

    var src = path.join(res_dir, folder.src, ICON_FILENAME);
    var dst = path.join(res_dir, folder.dst, ICON_FILENAME);

    copyFile(fs, src, dst);
  });

  console.log("All icons copied with success");
};


function copyFile(fs, src, dst) {
  var rs = fs.createReadStream(src);

  rs.on('error', function(err){
    if (err) throw err;
  });

  rs.pipe(fs.createWriteStream(dst));
}

console.error("Running hook to add push notifications capabilities");

var fs = require('fs'),
    xcode = require('xcode'),
    xml2js = require('xml2js'),
    path = require('path'),
    plist = require('plist'),
    util = require('util');

var deferral = undefined;
var parser = undefined;

/******************************
 * Get Preference
 ******************************/
function _getPreference(configXML, prefName, defaultValue){
  fs.readFile(configXML, function(err, data) {
    if (err) throw err;

    parser.parseString(data, function (err, result) {
      if (err) throw err;
      
      var preferenceList = result.widget.preference;

      if (!preferenceList || !preferenceList.length)
        return deferral.resolve(defaultValue);

      for (var i=0; i<preferenceList.length; i++){
        var xmlPreference = preferenceList[i];
        
        if (xmlPreference.$.name === prefName)
          return deferral.resolve(xmlPreference.$.value);
      }

      deferral.resolve(defaultValue);
    });
  });

  return deferral.promise;
}

/******************************
 * Validate Preference
 ******************************/
function _validatePreference(value, defaultValue){
  return value === "development" ? value : defaultValue;
}

/******************************
 * Handle Entitlement File
 ******************************/
function _handleEntitlementFile(sourceFile, destFile, configXML){
  var entitlementsFile = fs.readFileSync(sourceFile, 'utf8');
  var obj = plist.parse(entitlementsFile);

  _getPreference(configXML, "aps-environment", "production").then(function(value){
    obj['aps-environment'] = _validatePreference(value, "production");

    var xml = plist.build(obj);
    fs.writeFileSync(destFile, xml, { encoding: 'utf8' });

    deferral.resolve();
  });
  
  return deferral.promise;
}

/******************************
 * Create Entitlement File
 ******************************/
function _createEntitlementFile(iosFolder, projFolder, projName, configXML, context) {
  var sourceFile = path.join(context.opts.plugin.pluginInfo.dir, 'src/ios/Resources/OutSystems.entitlements');
  var destFile = path.join(iosFolder, projName, 'Resources', projName + '.entitlements');
  
  console.log("Will add ios push notifications entitlements to project '" + projName + "'");
  console.log("Source Folder: " + sourceFile);
  console.log("Destination Folder: " + destFile);
  
  _handleEntitlementFile(sourceFile, destFile, configXML).then(function(){
    var projectPath = path.join(projFolder, 'project.pbxproj');
    var pbxProject = undefined;

    if (context.opts.cordova.project) {
      pbxProject = context.opts.cordova.project.parseProjectFile(context.opts.projectRoot).xcode;
    } else {
      pbxProject = xcode.project(projectPath);
      pbxProject.parseSync();
    }
    
    pbxProject.addResourceFile(projName + ".entitlements");

    var configGroups = pbxProject.hash.project.objects['XCBuildConfiguration'];

    for (var key in configGroups) {
      var config = configGroups[key];
      if (config.buildSettings !== undefined) {
        config.buildSettings.CODE_SIGN_ENTITLEMENTS = '"' + projName + '/Resources/' + projName + '.entitlements"';
        //config.buildSettings.CODE_SIGN_ENTITLEMENTS = '"' + projName + '/' + projName + '.entitlements"';
      }
    }

    // write the updated project file
    fs.writeFileSync(projectPath, pbxProject.writeSync());
    console.warn("OK, added ios push notifications entitlements to project '" + projName + "'");

    deferral.resolve();
  });

  return deferral.promise;
}

/******************************
 * Main
 ******************************/
module.exports = function (context) {
  var Q = context.requireCordovaModule('q');

  //NOT optional
  deferral = new Q.defer();
  parser = new xml2js.Parser();

  if (context.opts.cordova.platforms.indexOf('ios') < 0) {
    throw new Error('This plugin expects the ios platform to exist.');
  }

  var iosFolder = context.opts.cordova.project ? context.opts.cordova.project.root : path.join(context.opts.projectRoot, 'platforms/ios/');
  console.log("iOS Platform Folder: " + iosFolder);

  var promises = [];

  var projFolder = undefined;
  var projName = undefined;
  
  // Find the project folder by looking for *.xcodeproj
  var dirFiles = fs.readdirSync(iosFolder);

  dirFiles.forEach(function(file) {
    if (file.match(/\.xcodeproj$/)) {
      projFolder = path.join(iosFolder, file);
      projName = path.basename(file, '.xcodeproj');
    }
  });

  if (!projFolder || !projName) {
    throw new Error("Could not find an .xcodeproj folder in: " + iosFolder);
  }

  var configXML = path.join(iosFolder, projName, 'config.xml');
  
  //OutSystems NativeShell Entitlements File
  var entitlementsFile = path.join(iosFolder, projName, projName + '.entitlements');
  
  //Cordova 6.4.0 Entitlements Files
  var entitlementsDebugFile = path.join(iosFolder, projName, 'Entitlements-Debug.plist');
  var entitlementsReleaseFile = path.join(iosFolder, projName, 'Entitlements-Release.plist');

  if (fs.existsSync(entitlementsFile)) {
    promises.push(_handleEntitlementFile(entitlementsFile, entitlementsFile, configXML));
  }
  else if (fs.existsSync(entitlementsDebugFile) && fs.existsSync(entitlementsReleaseFile)) {
    promises.push(_handleEntitlementFile(entitlementsDebugFile, entitlementsDebugFile, configXML));
    promises.push(_handleEntitlementFile(entitlementsReleaseFile, entitlementsReleaseFile, configXML));
  }
  else {
    promises.push(_createEntitlementFile(iosFolder, projFolder, projName, configXML, context));
  }

  return Q.all(promises);
}
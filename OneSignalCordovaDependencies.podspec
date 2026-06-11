require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
onesignal_xcframework_version = '5.5.2'
onesignal_disable_location_env = ENV['ONESIGNAL_DISABLE_LOCATION'].to_s.strip.downcase
onesignal_disable_location = ['true', '1'].include?(onesignal_disable_location_env)

Pod::Spec.new do |s|
  s.name = 'OneSignalCordovaDependencies'
  s.version = package['version']
  s.summary = 'OneSignal Cordova native dependencies'
  s.license = { :type => 'MIT' }
  s.author = 'OneSignal'
  s.homepage = 'https://github.com/OneSignal/OneSignal-Cordova-SDK'
  s.source = { :git => 'https://github.com/OneSignal/OneSignal-Cordova-SDK.git', :tag => s.version.to_s }
  s.ios.deployment_target = '9.0'
  s.source_files = 'src/ios/OneSignalCordovaDependenciesStub.m'

  if onesignal_disable_location
    s.dependency 'OneSignalXCFramework/OneSignal', onesignal_xcframework_version
    s.dependency 'OneSignalXCFramework/OneSignalInAppMessages', onesignal_xcframework_version
  else
    s.dependency 'OneSignalXCFramework', onesignal_xcframework_version
  end
end

//
//  OneSignalWidgetBundle.swift
//  OneSignalWidget
//
//  Created by Fadi George on 1/27/26.
//

import WidgetKit
import SwiftUI

@main
struct OneSignalWidgetBundle: WidgetBundle {
    var body: some Widget {
        OneSignalWidget()
        OneSignalWidgetControl()
        OneSignalWidgetLiveActivity()
    }
}

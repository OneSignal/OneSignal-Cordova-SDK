//
//  OneSignalWidgetLiveActivity.swift
//  OneSignalWidget
//
//  Created by Fadi George on 1/28/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct OneSignalWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OneSignalWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension OneSignalWidgetAttributes {
    fileprivate static var preview: OneSignalWidgetAttributes {
        OneSignalWidgetAttributes(name: "World")
    }
}

extension OneSignalWidgetAttributes.ContentState {
    fileprivate static var smiley: OneSignalWidgetAttributes.ContentState {
        OneSignalWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: OneSignalWidgetAttributes.ContentState {
         OneSignalWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: OneSignalWidgetAttributes.preview) {
   OneSignalWidgetLiveActivity()
} contentStates: {
    OneSignalWidgetAttributes.ContentState.smiley
    OneSignalWidgetAttributes.ContentState.starEyes
}

import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

// Your struct name might be different here
@available(iOS 16.2, *)
struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            // Lock screen / banner UI
            VStack {
                Spacer()

                Text("Title: " + (context.attributes.data["title"]?.asString() ?? ""))
                    .font(.headline)

                Spacer()

                HStack {
                    Spacer()
                    Text(context.state.data["message"]?.asDict()?["en"]?.asString() ?? "Default Message")
                    Spacer()
                }

                Text("INT: " + String(context.state.data["intValue"]?.asInt() ?? 0))
                Text("DBL: " + String(context.state.data["doubleValue"]?.asDouble() ?? 0.0))
                Text("BOL: " + String(context.state.data["boolValue"]?.asBool() ?? false))

                Spacer()
            }
            .activitySystemActionForegroundColor(.black)
            .activityBackgroundTint(.white)

        } dynamicIsland: { _ in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                    // More content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("Min")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

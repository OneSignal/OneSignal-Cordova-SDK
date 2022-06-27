/// Represents a button sent as part of a push notification
class OSActionButton {
  constructor(json) {
        /// The custom unique ID for this button
        this.id = json.id;
        /// The text to display for the button
        this.text = json.text;
    
        /// (Android only)
        /// The URL/filename to show as the
        /// button's icon
        if (json.icon) {
            this.icon = json.icon;
        }
    }
}

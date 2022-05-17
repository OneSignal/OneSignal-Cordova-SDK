function OSInAppMessageAction (json) {
    this.clickName = json.click_name;
    this.clickUrl = json.click_url;
    this.firstClick = json.first_click;
    this.closesMessage = json.closes_message;
}

function OSInAppMessage (json) {
    this.messageId = json.messageId;
}

module.exports = {
    OSInAppMessageAction: OSInAppMessageAction,
    OSInAppMessage: OSInAppMessage
};

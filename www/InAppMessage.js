function OSInAppMessageAction (json) {
    this.clickName = json.click_name;
    this.clickUrl = json.click_url;
    this.firstClick = json.first_click;
    this.closesMessage = json.closes_message;
}

module.exports = OSInAppMessageAction;
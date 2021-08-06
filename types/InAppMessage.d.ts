export interface InAppMessageAction {
    closes_message  : boolean;
    first_click     : boolean;
    click_name      ?: string;
    click_url       ?: string;
}

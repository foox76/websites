declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const trackEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: eventName,
            ...eventParams
        });
        console.log(`[Analytics] Event: ${eventName}`, eventParams);
    }
};

export const CONVERSION_EVENTS = {
    WHATSAPP_CLICK: 'whatsapp_click',
    CALL_CLICK: 'call_click',
    FORM_SUBMIT: 'form_submit',
    OFFER_VIEW: 'offer_view'
};
